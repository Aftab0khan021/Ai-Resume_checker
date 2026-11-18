# server.py — AI Resume & Job Matcher API
# Enhanced version: security hardened, bugs fixed, advanced features added.

import os
import io
import re
import uuid
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from contextlib import asynccontextmanager

from fastapi import (
    FastAPI, APIRouter, UploadFile, File, HTTPException,
    Depends, Request, Query, status
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, EmailStr, validator
import nltk
import PyPDF2
import docx
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from motor.motor_asyncio import AsyncIOMotorClient

from app.db import get_db, ensure_indexes
from app.auth import (
    Token,
    create_access_token,
    get_password_hash,
    verify_password,
    validate_password_strength,
    validate_username,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user,
    get_optional_user,
)

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("resume-matcher")

# ---------------------------------------------------------------------------
# NLTK bootstrap (download only if missing)
# ---------------------------------------------------------------------------
for _resource, _path in [("punkt", "tokenizers/punkt"), ("stopwords", "corpora/stopwords")]:
    try:
        nltk.data.find(_path)
    except LookupError:
        nltk.download(_resource, quiet=True)

# ---------------------------------------------------------------------------
# File upload limits
# ---------------------------------------------------------------------------
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
MAX_RESUME_TEXT_LENGTH = 50_000        # characters
MAX_JD_TEXT_LENGTH = 20_000            # characters
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc"}
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
}

# ---------------------------------------------------------------------------
# Rate limiter
# ---------------------------------------------------------------------------
limiter = Limiter(key_func=get_remote_address, default_limits=["200/hour"])

# ---------------------------------------------------------------------------
# Global DB reference (also populated via lifespan)
# ---------------------------------------------------------------------------
db = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global db
    try:
        mongo_url = os.getenv("MONGO_URL")
        if mongo_url:
            client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
            db = client[os.getenv("DB_NAME", "ai_resume_checker")]
            try:
                await client.admin.command("ping")
                logger.info("MongoDB connected successfully.")
                await ensure_indexes()
            except Exception as e_ping:
                logger.warning(f"MongoDB ping failed: {e_ping}")
        else:
            logger.warning("MONGO_URL not set — running without DB persistence.")
            db = None
    except Exception as e:
        logger.warning(f"MongoDB startup error: {e}")
        db = None
    yield
    logger.info("Shutting down.")


# ---------------------------------------------------------------------------
# App & Router
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AI Resume & Job Matcher API",
    version="2.0.0",
    description="Advanced AI-powered resume analysis with ATS scoring.",
    lifespan=lifespan,
)
api = APIRouter(prefix="/api")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
DEFAULT_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]
_extra = os.getenv("FRONTEND_ORIGINS", "").strip()
if _extra:
    DEFAULT_ORIGINS += [o.strip() for o in _extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=DEFAULT_ORIGINS,
    allow_origin_regex=r"^https?://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------
class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[EmailStr] = None

    @validator("username")
    def username_valid(cls, v):
        err = validate_username(v)
        if err:
            raise ValueError(err)
        return v

    @validator("password")
    def password_strong(cls, v):
        err = validate_password_strength(v)
        if err:
            raise ValueError(err)
        return v


class UserResponse(BaseModel):
    username: str
    email: Optional[str] = None


class AnalysisResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None           # stores username of owner
    match_percentage: float
    matched_skills: List[str]
    missing_skills: List[str]
    recommendations: List[str]
    resume_text: str
    job_description: str
    target_job_title: str = Field(default="")
    analysis_summary: str
    ats_compatibility_score: float = Field(..., description="ATS score 0-100")
    quantification_feedback: List[str]
    ats_breakdown: Dict[str, Any] = Field(default_factory=dict)
    ats_red_flags: List[str] = Field(default_factory=list)
    ats_green_flags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AnalysisResultCreate(BaseModel):
    resume_text: str
    job_description: str
    target_job_title: str = Field(default="")


class AnalysisResponse(BaseModel):
    id: str
    match_percentage: float
    matched_skills: List[str]
    missing_skills: List[str]
    recommendations: List[str]
    analysis_summary: str
    resume_text: str
    job_description: str
    target_job_title: str
    ats_compatibility_score: float
    quantification_feedback: List[str]
    ats_breakdown: Dict[str, Any] = Field(default_factory=dict)
    ats_red_flags: List[str] = Field(default_factory=list)
    ats_green_flags: List[str] = Field(default_factory=list)
    created_at: datetime


class SummaryRequest(BaseModel):
    resume_text: str


class SummaryResponse(BaseModel):
    summaries: List[str]


class HealthResponse(BaseModel):
    status: str
    db: str
    version: str


# ---------------------------------------------------------------------------
# Text extraction utilities
# ---------------------------------------------------------------------------
def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        pages = []
        for page in reader.pages:
            page_text = page.extract_text() or ""
            pages.append(page_text)
        return "\n".join(pages).strip()
    except Exception as e:
        raise RuntimeError(f"PDF extraction error: {e}")


def extract_text_from_docx(file_content: bytes) -> str:
    try:
        d = docx.Document(io.BytesIO(file_content))
        paragraphs = [p.text for p in d.paragraphs]
        # Also extract from tables
        for table in d.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        paragraphs.append(cell.text.strip())
        return "\n".join(paragraphs).strip()
    except Exception as e:
        raise RuntimeError(f"DOCX extraction error: {e}")


def preprocess_text(text: str) -> str:
    """Normalize whitespace only — preserve structure for AI analysis."""
    text = text or ""
    text = re.sub(r"\r\n", "\n", text)
    text = re.sub(r"\r", "\n", text)
    text = re.sub(r"[ \t]+", " ", text)   # collapse horizontal whitespace only
    text = re.sub(r"\n{3,}", "\n\n", text) # max two blank lines
    return text.strip()


def sanitize_text_input(text: str, max_length: int) -> str:
    """Strip null bytes and enforce max length."""
    text = text.replace("\x00", "").strip()
    return text[:max_length]


# ---------------------------------------------------------------------------
# Skill extraction & similarity
# ---------------------------------------------------------------------------
SKILL_PATTERNS = [
    r"\b(?:python|java(?:script)?|typescript|react(?:\.js)?|angular|vue(?:\.js)?|node(?:\.js)?|express|django|flask|fastapi|spring|laravel|rails|nextjs|nuxtjs)\b",
    r"\b(?:html5?|css3?|sass|scss|tailwind(?:css)?|bootstrap|material.?ui|chakra.?ui|styled.?components)\b",
    r"\b(?:sql|mysql|postgresql|postgres|mongodb|redis|sqlite|oracle|firebase|supabase|dynamodb|cassandra|elasticsearch)\b",
    r"\b(?:aws|azure|gcp|google\s+cloud|docker|kubernetes|k8s|jenkins|terraform|ansible|github\s+actions|ci[/-]cd)\b",
    r"\b(?:machine\s+learning|deep\s+learning|natural\s+language\s+processing|nlp|computer\s+vision|ml|ai|data\s+science|data\s+analytics|tableau|power\s+bi|tensorflow|pytorch|scikit.?learn|hugging\s+face)\b",
    r"\b(?:agile|scrum|kanban|jira|confluence|product\s+management|project\s+management|devops|sre|microservices|rest(?:ful)?|graphql|grpc)\b",
    r"\b(?:leadership|teamwork|communication|problem.?solving|analytical|critical\s+thinking|mentoring|public\s+speaking)\b",
    r"\b(?:git|github|gitlab|bitbucket|svn|linux|unix|bash|powershell|windows\s+server)\b",
    r"\b(?:figma|sketch|adobe\s+xd|photoshop|illustrator|ui[/-]ux|user\s+research|wireframing|prototyping)\b",
    r"\b(?:security|cybersecurity|penetration\s+testing|owasp|soc\s+2|iso\s+27001|gdpr|hipaa)\b",
]


def extract_skills_from_text(text: str) -> List[str]:
    found = []
    t = (text or "").lower()
    for pattern in SKILL_PATTERNS:
        found += re.findall(pattern, t, re.IGNORECASE)
    return sorted(set(s.strip() for s in found if s.strip()))


def calculate_basic_similarity(resume_text: str, job_description: str) -> float:
    try:
        v = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), max_features=5000)
        m = v.fit_transform([resume_text, job_description])
        sim = cosine_similarity(m[0:1], m[1:2])[0][0]
        return float(max(0.0, min(sim * 100.0, 100.0)))
    except Exception:
        return 0.0


def get_missing_skills_from_tfidf(resume_text: str, job_description: str) -> List[str]:
    try:
        processed_resume = preprocess_text(resume_text).lower()
        v = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), max_features=3000)
        m = v.fit_transform([job_description, processed_resume])

        jd_vector = m[0].toarray()[0]
        feature_names = np.array(v.get_feature_names_out())
        sorted_indices = jd_vector.argsort()[::-1]

        resume_tokens = set(processed_resume.split())
        potential_skills = extract_skills_from_text(job_description) + [
            feature_names[i] for i in sorted_indices if jd_vector[i] > 0.1
        ]

        jd_keyword_scores = {feature_names[i]: jd_vector[i] for i in range(len(feature_names))}
        sorted_potential = sorted(set(potential_skills), key=lambda x: jd_keyword_scores.get(x, 0), reverse=True)

        missing_skills = []
        for term in sorted_potential:
            # Check if the term is not present in the resume as any sub-token
            if not any(word in resume_tokens for word in term.lower().split()):
                missing_skills.append(term.capitalize())
            if len(missing_skills) >= 8:
                break

        return missing_skills or ["Communication", "Adaptability", "Problem Solving"]
    except Exception as e:
        logger.warning(f"TFIDF missing skills failed: {e}")
        return ["Communication", "Leadership", "Project Management"]


# ---------------------------------------------------------------------------
# ATS scoring utilities
# ---------------------------------------------------------------------------
def calculate_detailed_ats_scores(text: str, similarity_score: float = 0.0) -> Dict[str, float]:
    txt = text or ""
    lines = [l.strip() for l in txt.splitlines() if l.strip()]

    section_keywords = (
        "experience", "work history", "employment", "education", "qualification",
        "skills", "technologies", "projects", "certifications", "summary",
        "profile", "objective", "contact", "achievements", "publications",
    )
    headings = sum(1 for l in lines[:60] if any(k in l.lower() for k in section_keywords))
    formatting_score = min(100.0, (headings / 5.0) * 100)

    keyword_density = float(similarity_score)

    has_email = 1.0 if re.search(r"[^@\s]+@[^@\s]+\.[^@\s]+", txt) else 0.0
    has_phone = 1.0 if re.search(r"(\+?\d[\d\s\-().]{7,}\d)", txt) else 0.0
    has_linkedin = 1.0 if re.search(r"linkedin\.com", txt, re.I) else 0.0
    contact_info_score = ((has_email + has_phone + has_linkedin) / 3.0) * 100

    bullet_like = sum(
        1 for l in lines
        if l.startswith(("-", "*", "•", "➢", ">", "◦", "▪")) or re.match(r"^\d+[).]\s", l)
    )
    bullet_fraction = bullet_like / max(1, len(lines))
    readability_score = min(100.0, bullet_fraction * 250)

    required_sections = ["experience", "education", "skills"]
    found_sections = sum(1 for sec in required_sections if any(sec in l.lower() for l in lines[:60]))
    section_completeness = (found_sections / len(required_sections)) * 100

    numbers = re.findall(r"\d+%|\$[\d,]+|\d+\+|\d+x|\d+\s*(?:years?|months?|users?|customers?|projects?)", txt, re.I)
    quantification_score = min(100.0, len(numbers) * 12.5)

    word_count = len(txt.split())
    if 300 <= word_count <= 800:
        length_score = 100.0
    elif word_count < 300:
        length_score = (word_count / 300) * 100
    else:
        length_score = max(50.0, 100 - ((word_count - 800) / 20))

    casual_words = ["gonna", "wanna", "yeah", "cool", "awesome", "stuff", "literally", "basically"]
    casual_count = sum(1 for word in casual_words if re.search(r"\b" + word + r"\b", txt.lower()))
    professional_language = max(50.0, 100 - (casual_count * 15))

    return {
        "formatting_score": round(formatting_score, 1),
        "keyword_density": round(keyword_density, 1),
        "contact_info_score": round(contact_info_score, 1),
        "readability_score": round(readability_score, 1),
        "section_completeness": round(section_completeness, 1),
        "quantification_score": round(quantification_score, 1),
        "length_score": round(length_score, 1),
        "professional_language": round(professional_language, 1),
    }


def compute_red_green_flags(scores: Dict[str, float]) -> tuple[List[str], List[str]]:
    red_flags, green_flags = [], []
    if scores["contact_info_score"] < 50:
        red_flags.append("Missing or incomplete contact information (email/phone/LinkedIn)")
    if scores["section_completeness"] < 70:
        red_flags.append("Missing standard resume sections (Experience, Education, Skills)")
    if scores["quantification_score"] < 30:
        red_flags.append("Lacks quantified achievements — add numbers, percentages, metrics")
    if scores["readability_score"] < 50:
        red_flags.append("Limited use of bullet points — structured bullets improve ATS parsing")
    if scores["length_score"] < 60:
        red_flags.append("Resume length not optimal — aim for 300-800 words (1-2 pages)")
    if scores["keyword_density"] < 40:
        red_flags.append("Low keyword match with job description — tailor your resume more")
    if scores["professional_language"] < 70:
        red_flags.append("Casual language detected — use professional terminology throughout")

    if scores["formatting_score"] > 70:
        green_flags.append("Clear section headers present — good ATS structure")
    if scores["contact_info_score"] > 80:
        green_flags.append("Complete contact information provided")
    if scores["quantification_score"] > 50:
        green_flags.append("Good use of quantified metrics and achievements")
    if scores["readability_score"] > 70:
        green_flags.append("Well-formatted with clear bullet points")
    if scores["keyword_density"] > 60:
        green_flags.append("Strong keyword alignment with job description")
    if scores["section_completeness"] == 100:
        green_flags.append("All standard resume sections present")

    return red_flags, green_flags


# ---------------------------------------------------------------------------
# AI analysis
# ---------------------------------------------------------------------------
async def analyze_with_ai(
    resume_text: str, job_description: str, target_job_title: str, original_resume: str = ""
) -> Dict[str, Any]:
    """
    Try Gemini AI analysis; fall back to deterministic scoring if unavailable.
    Uses original_resume (un-lowercased) for ATS calculations.
    """
    text_for_ats = original_resume or resume_text

    try:
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("EMERGENT_LLM_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY not configured")

        from google import genai

        client = genai.Client(api_key=api_key, http_options={"api_version": "v1"})

        # Try preferred model, then fallback
        models_to_try = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-latest"]
        response = None
        for model_name in models_to_try:
            try:
                prompt = f"""You are an expert AI Resume Evaluator and ATS (Applicant Tracking System) Specialist.
Analyze the resume against the job description with DETAILED ATS scoring.

TARGET JOB TITLE: {target_job_title or "Not specified"}

RESUME (first 3000 chars):
{resume_text[:3000]}

JOB DESCRIPTION (first 3000 chars):
{job_description[:3000]}

Provide a comprehensive analysis. Return ONLY valid JSON with this EXACT structure (no markdown, no extra text):
{{
  "match_percentage": <number 0-100>,
  "matched_skills": ["skill1", "skill2", "skill3"],
  "missing_skills": ["skill1", "skill2", "skill3"],
  "recommendations": ["Specific actionable advice 1", "Specific actionable advice 2", "Specific actionable advice 3", "Specific actionable advice 4", "Specific actionable advice 5"],
  "analysis_summary": "Concise 2-3 sentence professional summary of the candidate-role fit.",
  "ats_compatibility_score": <overall ATS score 0-100>,
  "quantification_feedback": ["Specific advice on where to add numbers/metrics in bullet point 1", "Advice 2"],
  "ats_breakdown": {{
    "formatting_score": <number 0-100>,
    "keyword_density": <number 0-100>,
    "contact_info_score": <number 0-100>,
    "readability_score": <number 0-100>,
    "section_completeness": <number 0-100>,
    "quantification_score": <number 0-100>,
    "length_score": <number 0-100>,
    "professional_language": <number 0-100>
  }},
  "ats_red_flags": ["specific ATS issue 1", "specific ATS issue 2"],
  "ats_green_flags": ["positive aspect 1", "positive aspect 2"]
}}"""
                response = client.models.generate_content(model=model_name, contents=prompt)
                logger.info(f"AI analysis succeeded with model: {model_name}")
                break
            except Exception as model_err:
                logger.warning(f"Model {model_name} failed: {model_err}")
                continue

        if response is None:
            raise RuntimeError("All Gemini models failed")

        text = response.text

        # Robust JSON extraction — handle markdown code fences
        text_clean = re.sub(r"```(?:json)?\s*", "", text).strip()
        s = text_clean.find("{")
        e = text_clean.rfind("}") + 1
        if s == -1 or e == 0:
            raise ValueError("AI returned no parseable JSON")

        payload = json.loads(text_clean[s:e])

        match_percentage = float(payload.get("match_percentage", 0.0))
        matched_skills_list = [str(x) for x in payload.get("matched_skills", [])]
        missing_skills_list = [str(x) for x in payload.get("missing_skills", [])]
        recommendations = [str(x) for x in payload.get("recommendations", [])]
        analysis_summary = str(payload.get("analysis_summary", "AI analysis completed."))
        ats_score = float(payload.get("ats_compatibility_score", 0.0))
        quant_feedback = [str(x) for x in payload.get("quantification_feedback", [])]
        ats_breakdown = payload.get("ats_breakdown", {})
        ats_red_flags = [str(x) for x in payload.get("ats_red_flags", [])]
        ats_green_flags = [str(x) for x in payload.get("ats_green_flags", [])]

        logger.info(f"AI ats_breakdown keys: {list(ats_breakdown.keys()) if isinstance(ats_breakdown, dict) else 'not a dict'}")

        # If AI didn't return breakdown, compute it
        if not isinstance(ats_breakdown, dict) or len(ats_breakdown) < 4:
            ats_breakdown = calculate_detailed_ats_scores(text_for_ats, match_percentage)

        if not ats_red_flags or not ats_green_flags:
            computed_rf, computed_gf = compute_red_green_flags(
                calculate_detailed_ats_scores(text_for_ats, match_percentage)
            )
            ats_red_flags = ats_red_flags or computed_rf
            ats_green_flags = ats_green_flags or computed_gf

        return {
            "match_percentage": max(0.0, min(100.0, match_percentage)),
            "matched_skills": matched_skills_list[:20],
            "missing_skills": missing_skills_list[:15],
            "recommendations": recommendations[:10],
            "analysis_summary": analysis_summary,
            "ats_compatibility_score": max(0.0, min(100.0, ats_score)),
            "quantification_feedback": quant_feedback[:8],
            "ats_breakdown": ats_breakdown,
            "ats_red_flags": ats_red_flags[:8],
            "ats_green_flags": ats_green_flags[:8],
        }

    except Exception as e:
        logger.warning(f"AI analysis unavailable — using deterministic fallback. Reason: {e}")

        try:
            score = calculate_basic_similarity(resume_text, job_description)
        except Exception:
            score = 0.0

        try:
            missing_skills_list = get_missing_skills_from_tfidf(resume_text, job_description)
        except Exception:
            missing_skills_list = []

        try:
            matched_skills_list = extract_skills_from_text(resume_text)[:12]
        except Exception:
            matched_skills_list = []

        detailed_scores = calculate_detailed_ats_scores(text_for_ats, score)
        ats = round(sum(detailed_scores.values()) / len(detailed_scores), 1)
        red_flags, green_flags = compute_red_green_flags(detailed_scores)

        recs = [
            "Add clear section headings: Experience, Education, Skills, Projects.",
            "Use bullet points starting with strong action verbs (e.g., 'Developed', 'Led', 'Optimized').",
            "Quantify your achievements with numbers and percentages (e.g., 'Improved X by 30%').",
            "Tailor keywords from the job description into your resume text.",
            "Ensure contact information (email, phone, LinkedIn) is clearly visible at the top.",
        ]

        return {
            "match_percentage": float(score),
            "matched_skills": matched_skills_list,
            "missing_skills": missing_skills_list,
            "recommendations": recs,
            "analysis_summary": (
                f"Deterministic analysis: {score:.1f}% keyword similarity with the job description. "
                "AI analysis was unavailable — results are computed locally using TF-IDF."
            ),
            "ats_compatibility_score": ats,
            "quantification_feedback": [
                "Consider adding measurable metrics to your top 3-5 accomplishments to increase impact.",
                "Replace vague descriptions like 'improved performance' with 'improved performance by 40%'.",
            ],
            "ats_breakdown": detailed_scores,
            "ats_red_flags": red_flags or ["Unable to perform full AI red flag analysis"],
            "ats_green_flags": green_flags or ["Run with AI enabled for detailed green flags"],
        }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@api.get("/", tags=["Health"])
async def root():
    return {"message": "AI Resume & Job Matcher API v2.0", "docs": "/docs"}


# ── Auth ──────────────────────────────────────────────────────────────────

@api.post("/auth/register", response_model=UserResponse, tags=["Auth"])
@limiter.limit("10/minute")
async def register(request: Request, user: UserCreate):
    db_local = get_db()
    if db_local is None:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    # Check username uniqueness (case-insensitive)
    existing_user = await db_local.users.find_one(
        {"username": {"$regex": f"^{re.escape(user.username)}$", "$options": "i"}}
    )
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    # Check email uniqueness if provided
    if user.email:
        existing_email = await db_local.users.find_one({"email": user.email})
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = get_password_hash(user.password)
    user_doc = {
        "username": user.username,
        "hashed_password": hashed_pw,
        "email": user.email,
        "created_at": datetime.now(timezone.utc),
        "is_active": True,
    }
    try:
        await db_local.users.insert_one(user_doc)
    except Exception as e:
        logger.error(f"Register: insert failed: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

    logger.info(f"New user registered: {user.username}")
    return UserResponse(username=user.username, email=user.email)


@api.post("/auth/login", response_model=Token, tags=["Auth"])
@limiter.limit("10/minute")
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    db_local = get_db()
    if db_local is None:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    user = await db_local.users.find_one({"username": form_data.username})
    # Always run verify to prevent timing attacks
    pw_ok = verify_password(form_data.password, user["hashed_password"]) if user else False

    if not user or not pw_ok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user["username"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    logger.info(f"User logged in: {user['username']}")
    return {"access_token": access_token, "token_type": "bearer"}


@api.get("/auth/me", response_model=UserResponse, tags=["Auth"])
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(username=current_user["username"], email=current_user.get("email"))


# ── Upload ────────────────────────────────────────────────────────────────

@api.post("/upload-resume", response_model=Dict[str, str], tags=["Resume"])
@limiter.limit("20/minute")
async def upload_resume(request: Request, file: UploadFile = File(...)):
    filename = file.filename or "unknown"
    content_type = (file.content_type or "").lower()

    # Validate extension
    lower_name = filename.lower()
    ext = ""
    for allowed_ext in ALLOWED_EXTENSIONS:
        if lower_name.endswith(allowed_ext):
            ext = allowed_ext
            break

    if not ext:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read with size cap
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {e}")

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is {MAX_FILE_SIZE_BYTES // (1024*1024)} MB."
        )

    logger.info(f"Upload: filename={filename}, size={len(contents)} bytes")
    text = ""
    errors = []

    if ext == ".pdf" or content_type == "application/pdf":
        try:
            text = extract_text_from_pdf(contents)
        except Exception as e:
            errors.append(f"PDF: {e}")

    if not text and ext in (".docx", ".doc"):
        try:
            text = extract_text_from_docx(contents)
        except Exception as e:
            errors.append(f"DOCX: {e}")

    # UTF-8 fallback for plain text resumes
    if not text:
        try:
            decoded = contents.decode("utf-8", errors="ignore").strip()
            if decoded and len(decoded) > 50:
                text = decoded
        except Exception as e:
            errors.append(f"UTF-8 decode: {e}")

    if not text or not text.strip():
        err_detail = "; ".join(errors) if errors else "No readable text found in file."
        raise HTTPException(status_code=400, detail=f"Unable to extract text: {err_detail}")

    # Enforce max text length
    if len(text) > MAX_RESUME_TEXT_LENGTH:
        text = text[:MAX_RESUME_TEXT_LENGTH]
        logger.warning(f"Resume text truncated to {MAX_RESUME_TEXT_LENGTH} chars")

    return {"text": text, "filename": filename}


# ── Analyze ───────────────────────────────────────────────────────────────

@api.post("/analyze", tags=["Analysis"])
@limiter.limit("10/minute")
async def analyze_resume_job_match(
    request: Request,
    current_user: Optional[dict] = Depends(get_optional_user),
    func: Optional[str] = Query(None),
):
    """
    Analyze resume against job description.
    Works for both authenticated and anonymous users.
    Authenticated users' results are saved to history.
    """
    # Parse JSON body
    try:
        body = await request.json()
    except Exception as e:
        raw = await request.body()
        try:
            body = json.loads(raw.decode("utf-8", errors="replace"))
        except Exception:
            raise HTTPException(
                status_code=422,
                detail=[{"loc": ["body"], "msg": "Invalid JSON body", "type": "value_error"}]
            )

    resume_text = body.get("resume_text")
    job_description = body.get("job_description")
    target_job_title = body.get("target_job_title", "") or ""

    # Validate
    errors = []
    if resume_text is None:
        errors.append({"loc": ["body", "resume_text"], "msg": "Field required", "type": "value_error.missing"})
    if job_description is None:
        errors.append({"loc": ["body", "job_description"], "msg": "Field required", "type": "value_error.missing"})
    if errors:
        raise HTTPException(status_code=422, detail=errors)

    if not isinstance(resume_text, str) or not resume_text.strip():
        raise HTTPException(status_code=422, detail=[{"loc": ["body", "resume_text"], "msg": "resume_text must be a non-empty string", "type": "value_error"}])
    if not isinstance(job_description, str) or not job_description.strip():
        raise HTTPException(status_code=422, detail=[{"loc": ["body", "job_description"], "msg": "job_description must be a non-empty string", "type": "value_error"}])

    # Sanitize and enforce limits
    resume_text = sanitize_text_input(resume_text, MAX_RESUME_TEXT_LENGTH)
    job_description = sanitize_text_input(job_description, MAX_JD_TEXT_LENGTH)
    target_job_title = sanitize_text_input(target_job_title, 200)

    # Preprocess for AI (preserve structure — just normalize whitespace)
    r_text = preprocess_text(resume_text)
    jd_text = preprocess_text(job_description)

    try:
        result = await analyze_with_ai(r_text, jd_text, target_job_title, original_resume=resume_text)
    except Exception as e:
        logger.error(f"Analyze: AI error: {e}")
        raise HTTPException(status_code=500, detail="Internal analysis error")

    user_id = current_user["username"] if current_user else None

    doc = AnalysisResult(
        user_id=user_id,
        match_percentage=result["match_percentage"],
        matched_skills=result["matched_skills"],
        missing_skills=result["missing_skills"],
        recommendations=result["recommendations"],
        analysis_summary=result["analysis_summary"],
        resume_text=resume_text,
        job_description=job_description,
        target_job_title=target_job_title,
        ats_compatibility_score=result["ats_compatibility_score"],
        quantification_feedback=result["quantification_feedback"],
        ats_breakdown=result.get("ats_breakdown", {}),
        ats_red_flags=result.get("ats_red_flags", []),
        ats_green_flags=result.get("ats_green_flags", []),
    )

    # Persist if DB available
    try:
        db_conn = get_db()
        if db_conn is not None:
            await db_conn.analysis_results.insert_one(doc.dict())
            logger.info(f"Analysis saved: id={doc.id}, user={user_id or 'anonymous'}")
    except Exception as e:
        logger.warning(f"Failed to persist analysis: {e}")

    return AnalysisResponse(**doc.dict())


# ── History ───────────────────────────────────────────────────────────────

@api.get("/analysis-history", response_model=List[AnalysisResponse], tags=["Analysis"])
async def get_analysis_history(
    current_user: Optional[dict] = Depends(get_optional_user),
    limit: int = Query(default=10, ge=1, le=50),
):
    try:
        db_local = get_db()
        if db_local is None:
            return []

        # Build query — authenticated users see only their own results
        query: Dict[str, Any] = {}
        if current_user:
            query["user_id"] = current_user["username"]
        else:
            # Anonymous: return empty (no way to identify user)
            return []

        projection = {"resume_text": 0, "job_description": 0, "_id": 0}
        cursor = db_local.analysis_results.find(query, projection).sort("created_at", -1).limit(limit)
        items = await cursor.to_list(length=limit)

        result = []
        for x in items:
            x.setdefault("resume_text", "")
            x.setdefault("job_description", "")
            x.setdefault("ats_compatibility_score", 0)
            x.setdefault("quantification_feedback", [])
            x.setdefault("target_job_title", "")
            x.setdefault("ats_breakdown", {})
            x.setdefault("ats_red_flags", [])
            x.setdefault("ats_green_flags", [])
            try:
                result.append(AnalysisResponse(**x))
            except Exception as ex:
                logger.warning(f"Skipping malformed history item: {ex}")
        return result

    except Exception:
        logger.exception("get_analysis_history failed")
        raise HTTPException(status_code=500, detail="Failed to load analysis history")


@api.get("/analysis/{analysis_id}", response_model=AnalysisResponse, tags=["Analysis"])
async def get_analysis_detail(
    analysis_id: str,
    current_user: Optional[dict] = Depends(get_optional_user),
):
    # Validate UUID format to prevent injection
    try:
        uuid.UUID(analysis_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid analysis ID format")

    try:
        db_local = get_db()
        if db_local is None:
            raise HTTPException(status_code=503, detail="Database not available")

        query: Dict[str, Any] = {"id": analysis_id}
        # Restrict to current user's results if authenticated
        if current_user:
            query["user_id"] = current_user["username"]

        item = await db_local.analysis_results.find_one(query, {"_id": 0})
        if not item:
            raise HTTPException(status_code=404, detail="Analysis not found")

        item.setdefault("ats_breakdown", {})
        item.setdefault("ats_red_flags", [])
        item.setdefault("ats_green_flags", [])
        return AnalysisResponse(**item)
    except HTTPException:
        raise
    except Exception:
        logger.exception("get_analysis_detail: unexpected error")
        raise HTTPException(status_code=500, detail="Failed to retrieve analysis")


# ── Summary Generation ────────────────────────────────────────────────────

@api.post("/generate-summary", response_model=SummaryResponse, tags=["AI"])
@limiter.limit("10/minute")
async def generate_summary(request: Request, body: SummaryRequest):
    # BUG FIX: renamed parameter from 'payload' to 'body' to avoid shadowing json.loads result
    resume_text_input = sanitize_text_input(body.resume_text, MAX_RESUME_TEXT_LENGTH)
    processed = preprocess_text(resume_text_input)
    if not processed:
        raise HTTPException(
            status_code=422,
            detail=[{"loc": ["body", "resume_text"], "msg": "Resume text is required", "type": "value_error"}]
        )

    try:
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("EMERGENT_LLM_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY not configured")

        from google import genai
        client = genai.Client(api_key=api_key, http_options={"api_version": "v1"})

        prompt = f"""Based on the following resume text, write 3 professional, high-impact summary statements for a job application.
Each summary should be 2-3 sentences, start with a strong action word, and highlight key skills and experience.
Return ONLY valid JSON (no markdown): {{ "summaries": ["summary1", "summary2", "summary3"] }}

RESUME TEXT:
{processed[:2500]}"""

        models_to_try = ["gemini-2.0-flash", "gemini-1.5-flash"]
        response = None
        for model_name in models_to_try:
            try:
                response = client.models.generate_content(model=model_name, contents=prompt)
                break
            except Exception as me:
                logger.warning(f"Summary model {model_name} failed: {me}")
                continue

        if response is None:
            raise RuntimeError("All models failed for summary generation")

        text = response.text
        text_clean = re.sub(r"```(?:json)?\s*", "", text).strip()
        s = text_clean.find("{")
        e = text_clean.rfind("}") + 1
        if s != -1 and e > 0:
            result_data = json.loads(text_clean[s:e])
            summaries = [str(x) for x in result_data.get("summaries", [])]
            if summaries:
                return SummaryResponse(summaries=summaries)
        raise ValueError("Could not parse AI summary response")

    except Exception as e:
        logger.error(f"Summary generation failed: {e}")
        # Return fallback summaries
        word_count = len(processed.split())
        return SummaryResponse(summaries=[
            f"Results-driven professional with demonstrated expertise in key technical and analytical skills, bringing {word_count // 100 or 'several'} years of relevant experience to drive organizational success.",
            "Dynamic team player with a strong track record of delivering high-impact projects on time and within budget, leveraging advanced problem-solving and communication skills.",
            "Strategic thinker and collaborative professional committed to continuous learning and innovation, with a passion for leveraging technology to solve complex business challenges.",
        ])


# ── Health ────────────────────────────────────────────────────────────────

@api.get("/health", response_model=HealthResponse, tags=["Health"])
async def health():
    db_status = "unavailable"
    try:
        db_local = get_db()
        if db_local is not None:
            await db_local.command("ping")
            db_status = "connected"
    except Exception:
        db_status = "error"

    return HealthResponse(status="ok", db=db_status, version="2.0.0")


# ---------------------------------------------------------------------------
# Mount router
# ---------------------------------------------------------------------------
app.include_router(api)
