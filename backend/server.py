# server.py
import os
import io
import re
import uuid
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Depends, Request, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, Field, EmailStr
import nltk
import PyPDF2
import docx
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ---------- FIX: import AsyncIOMotorClient used in lifespan (was missing) ----------
from motor.motor_asyncio import AsyncIOMotorClient

# Use the project's db helper (this file is untouched)
from app.db import get_db
# Import auth helper
from app.auth import Token, create_access_token, get_password_hash, verify_password, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user

# Rate limiting imports
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Setup logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("resume-matcher")

# Ensure required nltk resources are present (download if missing)
try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download("punkt")
try:
    nltk.data.find("corpora/stopwords")
except LookupError:
    nltk.download("stopwords")

# Rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["1000/hour"])

# ---------- GLOBAL DB HOLDER ----------
# server.py used a 'db' within lifespan; declare here so it's clear and available.
db = None

# Lifespan for MongoDB connection attempt (non-fatal)
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Attempt to connect to MongoDB during startup. This is defensive: if connection
    fails or env var not present, we set `db = None` and continue running (non-fatal).
    """
    global db
    try:
        mongo_url = os.getenv("MONGO_URL")  # consistent with app.db usage
        if mongo_url:
            client = AsyncIOMotorClient(mongo_url)
            db = client[os.getenv("DB_NAME", "resume_matcher_db")]
            # Ping to test connectivity (may raise)
            try:
                await client.admin.command("ping")
                logger.info("Successfully connected to MongoDB (during startup).")
            except Exception as e_ping:
                logger.warning(f"Connected client created but ping failed: {e_ping}")
        else:
            logger.warning("MONGO_URL not set; running without DB persistence.")
            db = None
    except Exception as e:
        logger.warning(f"Warning: Error connecting to MongoDB at startup: {e}")
        db = None
    yield
    # optional: close client on shutdown (left minimal to avoid touching unrelated code)

app = FastAPI(title="AI Resume & Job Matcher API", lifespan=lifespan)
api = APIRouter(prefix="/api")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ----------------------------
# CORS: Allow localhost for development and Vercel deployments for production
# ----------------------------
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
    allow_origin_regex=r"^https?://.*\.vercel\.app$",  # Allow all Vercel deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Models ----------
class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[EmailStr] = None

class UserResponse(BaseModel):
    username: str
    email: Optional[str] = None

class AnalysisResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    match_percentage: float
    matched_skills: List[str]
    missing_skills: List[str]
    recommendations: List[str]
    resume_text: str
    job_description: str
    target_job_title: str = Field(default="")
    analysis_summary: str
    ats_compatibility_score: float = Field(..., description="ATS score from 0.0 to 100.0 based on formatting/structure.")
    quantification_feedback: List[str] = Field(..., description="Specific recommendations on where to add metrics/numbers.")
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
    created_at: datetime

class SummaryRequest(BaseModel):
    resume_text: str

class SummaryResponse(BaseModel):
    summaries: List[str]

# ---------- Utilities ----------
def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        out = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            out.append(page_text)
        return "\n".join(out).strip()
    except Exception as e:
        raise RuntimeError(f"PDF extraction error: {e}")

def extract_text_from_docx(file_content: bytes) -> str:
    try:
        d = docx.Document(io.BytesIO(file_content))
        return "\n".join(p.text for p in d.paragraphs).strip()
    except Exception as e:
        raise RuntimeError(f"DOCX extraction error: {e}")

def preprocess_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text or "")
    return text.lower().strip()

def extract_skills_from_text(text: str) -> List[str]:
    patterns = [
        r"\b(?:python|java|javascript|react|angular|vue|node\.?js|express|django|flask|spring|laravel)\b",
        r"\b(?:html|css|sass|scss|bootstrap|tailwind|material-ui|mui)\b",
        r"\b(?:sql|mysql|postgresql|mongodb|redis|sqlite|oracle|firebase)\b",
        r"\b(?:aws|azure|gcp|docker|kubernetes|jenkins|git|github|gitlab)\b",
        r"\b(?:machine learning|ml|ai|data science|analytics|tableau|power bi)\b",
        r"\b(?:agile|scrum|kanban|jira|confluence|slack|trello)\b",
        r"\b(?:leadership|teamwork|communication|problem solving|analytical)\b",
    ]
    found = []
    t = (text or "").lower()
    for p in patterns:
        found += re.findall(p, t)
    return sorted(set(found))

def calculate_basic_similarity(resume_text: str, job_description: str) -> float:
    try:
        v = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        m = v.fit_transform([resume_text, job_description])
        sim = cosine_similarity(m[0:1], m[1:2])[0][0]
        return float(max(0.0, min(sim * 100.0, 100.0)))
    except Exception:
        return 0.0

def get_missing_skills_from_tfidf(resume_text: str, job_description: str) -> List[str]:
    try:
        processed_resume = preprocess_text(resume_text)
        v = TfidfVectorizer(stop_words="english", ngram_range=(1, 1))
        m = v.fit_transform([job_description, processed_resume])
        
        jd_vector = m[0].toarray()[0]
        feature_names = np.array(v.get_feature_names_out())
        sorted_indices = jd_vector.argsort()[::-1]
        
        missing_skills = []
        resume_tokens = set(processed_resume.split())
        
        potential_skills = extract_skills_from_text(job_description) + [
            feature_names[i] for i in sorted_indices if jd_vector[i] > 0.1
        ]
        
        jd_keyword_scores = {
            feature_names[i]: jd_vector[i]
            for i in range(len(feature_names))
        }
        
        sorted_potential_skills = sorted(
            set(potential_skills), 
            key=lambda x: jd_keyword_scores.get(x, 0), 
            reverse=True
        )
        
        for term in sorted_potential_skills:
            if term not in resume_tokens:
                missing_skills.append(term.capitalize())
            if len(missing_skills) >= 5:
                break
        
        return missing_skills or ["Communication", "Adaptability", "Problem Solving"] 

    except Exception as e:
        logger.warning(f"TFIDF missing skills failed: {e}")
        return ["Communication", "Leadership", "Project Management"]

# ---------- AI helper ----------
async def analyze_with_ai(resume_text: str, job_description: str, target_job_title: str) -> Dict[str, Any]:
    """
    Robust analyze_with_ai using google.generativeai:
     - If LLM works, parse JSON and return fields.
     - If anything fails (no key, parsing error, runtime), compute a deterministic fallback.
     - Always ensures variables used in returned dict are defined.
    """
    try:
        # Try GEMINI_API_KEY first, fallback to EMERGENT_LLM_KEY for backward compatibility
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("EMERGENT_LLM_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY not configured")

        # Use google.genai (new SDK)
        from google import genai
        
        # Force v1 API to avoid v1beta 404s
        client = genai.Client(api_key=api_key, http_options={'api_version': 'v1'})
        
        # DEBUG: List models to confirm visibility
        try:
            print(f"DEBUG: Checking models with API version v1...")
            # Pager object, iterate to find names
            for m in client.models.list():
                if 'gemini-1.5-flash' in m.name:
                    print(f"DEBUG: Found model: {m.name}")
        except Exception as e:
            print(f"DEBUG: Model listing failed: {e}")
        
        prompt = f"""
You are an expert AI Resume Evaluator and ATS (Applicant Tracking System) Specialist.
Analyze the following resume against the job description with DETAILED ATS scoring.

TARGET JOB TITLE: {target_job_title}

RESUME:
{resume_text[:3000]}...

JOB DESCRIPTION:
{job_description[:3000]}...

Provide a comprehensive ATS analysis with these specific categories:

1. **Formatting Score** (0-100): Clear sections, proper headings, standard structure, no tables/images
2. **Keyword Density** (0-100): Relevant keywords from job description present in resume
3. **Contact Info Score** (0-100): Email, phone, LinkedIn clearly visible
4. **Readability Score** (0-100): Clear language, appropriate length, bullet points
5. **Section Completeness** (0-100): Has Experience, Education, Skills, Summary sections
6. **Quantification Score** (0-100): Use of numbers, percentages, metrics in achievements
7. **Length Score** (0-100): Appropriate length (1-2 pages ideal)
8. **Professional Language** (0-100): Industry-appropriate terminology, no casual language

Also identify:
- **Red Flags**: Specific ATS issues (e.g., "Contains tables", "Missing contact info", "Too many pages")
- **Green Flags**: What's working well (e.g., "Clear section headers", "Quantified achievements")

Return a JSON with this EXACT structure:
{{
  "match_percentage": <number 0-100>,
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "recommendations": ["Actionable specific advice 1", "Actionable advice 2"],
  "analysis_summary": "Concise 2-3 sentence professional summary of the fit.",
  "ats_compatibility_score": <overall ATS score 0-100>,
  "quantification_feedback": ["Specific advice on where to add numbers/metrics"],
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
  "ats_red_flags": ["specific issue 1", "specific issue 2"],
  "ats_green_flags": ["positive aspect 1", "positive aspect 2"]
}}
"""
        response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)
        text = response.text

        # try to extract JSON object from model output
        s, e = text.find("{"), text.rfind("}") + 1
        if s == -1 or e == 0:
            raise ValueError("AI returned no JSON")

        payload = json.loads(text[s:e])

        # Normalize returned fields and ensure types
        match_percentage = float(payload.get("match_percentage", 0.0))
        matched_skills_list = list(payload.get("matched_skills", []))
        missing_skills_list = list(payload.get("missing_skills", []))
        recommendations = list(payload.get("recommendations", []))
        analysis_summary = str(payload.get("analysis_summary", "AI analysis completed."))
        ats_score = float(payload.get("ats_compatibility_score", 0.0))
        quant_feedback = list(payload.get("quantification_feedback", []))
        
        # Extract new ATS breakdown fields
        ats_breakdown = payload.get("ats_breakdown", {})
        ats_red_flags = list(payload.get("ats_red_flags", []))
        ats_green_flags = list(payload.get("ats_green_flags", []))
        
        # DEBUG: Log what AI actually returned
        logger.info(f"AI returned ats_breakdown: {ats_breakdown}")
        logger.info(f"Breakdown is dict: {isinstance(ats_breakdown, dict)}, length: {len(ats_breakdown) if isinstance(ats_breakdown, dict) else 0}")

        return {
            "match_percentage": match_percentage,
            "matched_skills": matched_skills_list,
            "missing_skills": missing_skills_list,
            "recommendations": recommendations,
            "analysis_summary": analysis_summary,
            "ats_compatibility_score": ats_score,
            "quantification_feedback": quant_feedback,
            "ats_breakdown": ats_breakdown if (ats_breakdown and isinstance(ats_breakdown, dict) and len(ats_breakdown) > 0) else {
                # Calculate different scores per category
                "formatting_score": min(100.0, (sum(1 for l in [l.strip() for l in (resume_text or "").splitlines() if l.strip()][:40] if any(k in l.lower() for k in ("experience", "education", "skills", "projects", "summary"))) / 4.0) * 100),
                "keyword_density": float(ats_score),
                "contact_info_score": ((1.0 if re.search(r"[^@]+@[^@]+\.[^@]+", resume_text or "") else 0.0) + (1.0 if re.search(r"\(?\d{3}\)?[-\.\s]?\d{3}[-\.\s]?\d{4}", resume_text or "") else 0.0) + (1.0 if re.search(r"linkedin\.com", resume_text or "", re.I) else 0.0)) / 3.0 * 100,
                "readability_score": min(100.0, (sum(1 for l in [l.strip() for l in (resume_text or "").splitlines() if l.strip()] if l.startswith(("-", "*", "•"))) / max(1, len([l.strip() for l in (resume_text or "").splitlines() if l.strip()]))) * 250),
                "section_completeness": (sum(1 for sec in ["experience", "education", "skills"] if any(sec in l.lower() for l in [l.strip() for l in (resume_text or "").splitlines() if l.strip()][:40])) / 3.0) * 100,
                "quantification_score": min(100.0, len(re.findall(r"\d+%|\$\d+|\d+\+", resume_text or "")) * 10),
                "length_score": 100.0 if 300 <= len((resume_text or "").split()) <= 800 else ((len((resume_text or "").split()) / 300) * 100 if len((resume_text or "").split()) < 300 else max(50.0, 100 - ((len((resume_text or "").split()) - 800) / 20))),
                "professional_language": max(50.0, 100 - (sum(1 for word in ["gonna", "wanna", "yeah", "cool", "awesome"] if word in (resume_text or "").lower()) * 20))
            },
            "ats_red_flags": ats_red_flags if ats_red_flags else ["AI did not provide specific red flags"],
            "ats_green_flags": ats_green_flags if ats_green_flags else ["AI did not provide specific green flags"]
        }

    except Exception as e:
        # Log the reason for fallback
        logger.warning(f"AI analysis unavailable, using deterministic fallback. Reason: {e}")

        # Fallback: compute semantic match (0-100) using your existing helper
        try:
            score = calculate_basic_similarity(resume_text, job_description)
        except Exception:
            score = 0.0

        # Ensure these helper functions exist in your file; if not, implement minimal versions
        try:
            missing_skills_list = get_missing_skills_from_tfidf(resume_text, job_description)
        except Exception:
            missing_skills_list = []

        try:
            matched_skills_list = extract_skills_from_text(resume_text)[:8]
        except Exception:
            matched_skills_list = []

        def formatting_score_from_text(text: str) -> float:
            txt = text or ""
            lines = [l.strip() for l in txt.splitlines() if l.strip()]
            if not lines:
                return 20.0
            headings = 0
            # More extensive keyword list for sections
            section_keywords = ("experience", "work history", "employment", "education", "qualification", 
                               "skills", "technologies", "projects", "certifications", "summary", "profile", "contact")
            for l in lines[:40]:
                if any(k in l.lower() for k in section_keywords):
                    headings += 1
            headings_score = min(1.0, headings / 5.0) # Expect at least 5 main sections
            
            bullet_like = sum(1 for l in lines if l.startswith(("-", "*", "•", "➢", ">")) or re.match(r"^\d+[\).\s]", l))
            bullet_fraction = bullet_like / max(1, len(lines))
            bullet_score = min(1.0, bullet_fraction * 2.5) # Boosted weight for bullets
            
            year_matches = re.findall(r"\b(19|20)\d{2}\b", txt)
            year_score = min(1.0, len(set(year_matches)) / 3.0)
            
            # Simple check for contact info (email/phone)
            has_email = 1.0 if re.search(r"[^@]+@[^@]+\.[^@]+", txt) else 0.0
            has_phone = 1.0 if re.search(r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", txt) else 0.0
            contact_score = (has_email + has_phone) / 2.0

            combined = (0.4 * headings_score) + (0.3 * bullet_score) + (0.1 * year_score) + (0.2 * contact_score)
            return float(max(0.0, min(100.0, round(combined * 100.0))))

        formatting_sc = formatting_score_from_text(resume_text)

        # Detailed ATS breakdown scoring for fallback
        def calculate_detailed_ats_scores(text: str) -> dict:
            txt = text or ""
            lines = [l.strip() for l in txt.splitlines() if l.strip()]
            
            # 1. Formatting Score
            section_keywords = ("experience", "work history", "employment", "education", "qualification", 
                               "skills", "technologies", "projects", "certifications", "summary", "profile", "contact")
            headings = sum(1 for l in lines[:40] if any(k in l.lower() for k in section_keywords))
            formatting_score = min(100.0, (headings / 5.0) * 100)
            
            # 2. Keyword Density (based on job description match)
            keyword_density = float(score)  # Use similarity score as proxy
            
            # 3. Contact Info Score
            has_email = 1.0 if re.search(r"[^@]+@[^@]+\.[^@]+", txt) else 0.0
            has_phone = 1.0 if re.search(r"\(?\d{3}\)?[-.\\s]?\d{3}[-.\\s]?\d{4}", txt) else 0.0
            has_linkedin = 1.0 if re.search(r"linkedin\.com", txt, re.I) else 0.0
            contact_info_score = ((has_email + has_phone + has_linkedin) / 3.0) * 100
            
            # 4. Readability Score
            bullet_like = sum(1 for l in lines if l.startswith(("-", "*", "•", "➢", ">")) or re.match(r"^\d+[\).\s]", l))
            bullet_fraction = bullet_like / max(1, len(lines))
            readability_score = min(100.0, bullet_fraction * 250)
            
            # 5. Section Completeness
            required_sections = ["experience", "education", "skills"]
            found_sections = sum(1 for sec in required_sections if any(sec in l.lower() for l in lines[:40]))
            section_completeness = (found_sections / len(required_sections)) * 100
            
            # 6. Quantification Score
            numbers = re.findall(r"\d+%|\$\d+|\\d+\+", txt)
            quantification_score = min(100.0, len(numbers) * 10)
            
            # 7. Length Score
            word_count = len(txt.split())
            if 300 <= word_count <= 800:
                length_score = 100.0
            elif word_count < 300:
                length_score = (word_count / 300) * 100
            else:
                length_score = max(50.0, 100 - ((word_count - 800) / 20))
            
            # 8. Professional Language
            casual_words = ["gonna", "wanna", "yeah", "cool", "awesome", "stuff"]
            casual_count = sum(1 for word in casual_words if word in txt.lower())
            professional_language = max(50.0, 100 - (casual_count * 20))
            
            return {
                "formatting_score": formatting_score,
                "keyword_density": keyword_density,
                "contact_info_score": contact_info_score,
                "readability_score": readability_score,
                "section_completeness": section_completeness,
                "quantification_score": quantification_score,
                "length_score": length_score,
                "professional_language": professional_language
            }
        
        detailed_scores = calculate_detailed_ats_scores(resume_text)
        
        # Calculate overall ATS score from breakdown
        ats = sum(detailed_scores.values()) / len(detailed_scores)
        
        # Detect red flags
        red_flags = []
        if detailed_scores["contact_info_score"] < 50:
            red_flags.append("Missing or incomplete contact information")
        if detailed_scores["section_completeness"] < 70:
            red_flags.append("Missing standard resume sections")
        if detailed_scores["quantification_score"] < 30:
            red_flags.append("Lacks quantified achievements")
        if detailed_scores["readability_score"] < 50:
            red_flags.append("Limited use of bullet points")
        if detailed_scores["length_score"] < 60:
            red_flags.append("Resume length not optimal (aim for 1-2 pages)")
        
        # Detect green flags
        green_flags = []
        if detailed_scores["formatting_score"] > 70:
            green_flags.append("Clear section headers present")
        if detailed_scores["contact_info_score"] > 80:
            green_flags.append("Complete contact information")
        if detailed_scores["quantification_score"] > 50:
            green_flags.append("Good use of metrics and numbers")
        if detailed_scores["readability_score"] > 70:
            green_flags.append("Well-formatted with bullet points")

        recommendations = [
            "Add clear headings: Experience, Education, Skills, Projects.",
            "Use standard bullet points for readability.",
            "Quantify achievements with numbers (e.g., 'Improved X by Y%').",
            "Ensure contact information is easy to find."
        ]

        return {
            "match_percentage": float(score),
            "matched_skills": matched_skills_list,
            "missing_skills": missing_skills_list,
            "recommendations": recommendations,
            "analysis_summary": f"Fallback analysis: basic similarity {score:.1f}%",
            "ats_compatibility_score": ats,
            "quantification_feedback": ["Consider adding measurable metrics to 2-3 accomplishments to increase impact."],
            "ats_breakdown": detailed_scores,
            "ats_red_flags": red_flags,
            "ats_green_flags": green_flags
        }

# ---------- Routes ----------

@api.get("/")
async def root():
    return {"message": "AI Resume & Job Matcher API"}

# --------- Auth Routes ----------
@api.post("/auth/register", response_model=UserResponse)
async def register(user: UserCreate):
    db_local = get_db()
    if db_local is None:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    
    existing_user = await db_local.users.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_pw = get_password_hash(user.password)
    user_doc = {
        "username": user.username,
        "hashed_password": hashed_pw,
        "email": user.email,
        "created_at": datetime.now(timezone.utc)
    }
    await db_local.users.insert_one(user_doc)
    return UserResponse(username=user.username, email=user.email)

@api.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db_local = get_db()
    if db_local is None:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    user = await db_local.users.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@api.get("/auth/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(username=current_user["username"], email=current_user.get("email"))

# --------- Upload Handler ----------
@api.post("/upload-resume", response_model=Dict[str, str])
async def upload_resume(file: UploadFile = File(...)):
    filename = file.filename or "unknown"
    content_type = file.content_type or "unknown"
    try:
        contents = await file.read()
    except Exception as e:
        logger.error(f"Failed to read uploaded file bytes: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {e}")

    size = len(contents)
    logger.info(f"Upload received: filename={filename}, content_type={content_type}, size={size} bytes")

    if size == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    lower_name = (filename or "").lower()
    text = ""
    errors = []

    # Try PDF extraction
    if lower_name.endswith(".pdf") or content_type == "application/pdf":
        try:
            text = extract_text_from_pdf(contents)
            logger.info(f"PDF extraction success: {len(text)} chars")
        except Exception as e:
            logger.warning(f"PDF extraction failed: {e}")
            errors.append(f"PDF extraction failed: {e}")

    # Try DOCX extraction
    if (not text) and (lower_name.endswith(".docx") or lower_name.endswith(".doc") or content_type in ("application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword")):
        try:
            text = extract_text_from_docx(contents)
            logger.info(f"DOCX extraction success: {len(text)} chars")
        except Exception as e:
            logger.warning(f"DOCX extraction failed: {e}")
            errors.append(f"DOCX extraction failed: {e}")

    # Fallback: try to decode raw bytes as utf-8 or latin-1 text
    if not text:
        try:
            decoded = contents.decode("utf-8", errors="ignore").strip()
            if decoded:
                text = decoded
                logger.info(f"Fallback UTF-8 decode succeeded: {len(text)} chars")
            else:
                decoded2 = contents.decode("latin-1", errors="ignore").strip()
                if decoded2:
                    text = decoded2
                    logger.info(f"Fallback latin-1 decode succeeded: {len(text)} chars")
        except Exception as e:
            logger.warning(f"Fallback decoding error: {e}")
            errors.append(f"Fallback decode failed: {e}")

    if not text or not text.strip():
        err_detail = "; ".join(errors) if errors else "No text content detected in file."
        logger.error(f"Text extraction failed for {filename}: {err_detail}")
        raise HTTPException(status_code=400, detail=f"Unable to extract text: {err_detail}")

    return {"text": text, "filename": filename}

# --------- Robust Analyze Handler (fixed) ----------
@api.post("/analyze")
@limiter.limit("10/minute")
async def analyze_resume_job_match(request: Request, func: Optional[str] = Query(None, description="Optional function name (e.g. 'match')")):
    """
    Defensive analyze endpoint:
    - Reads raw JSON from body (with fallback and logging)
    - Accepts optional ?func=... query param for compatibility with clients
    - Performs manual validation and returns 422 with helpful messages on missing/invalid fields
    - Calls analyze_with_ai (or fallback) and persists result (if DB available)
    """
    # try parse JSON body; if it fails, capture raw body and try to decode+parse to give better diagnostics
    body = None
    try:
        body = await request.json()
    except Exception as e:
        # read raw bytes for debugging
        raw = await request.body()
        try:
            decoded = raw.decode("utf-8", errors="replace")
        except Exception:
            decoded = str(raw)
        logger.error(f"Analyze: failed to parse JSON body via request.json(): {e}; raw body starts: {decoded[:1000]!r}")
        # attempt a tolerant parse
        try:
            body = json.loads(decoded)
            logger.info("Analyze: tolerant json.loads(decoded) succeeded")
        except Exception as e2:
            logger.error(f"Analyze: tolerant json.loads also failed: {e2}")
            raise HTTPException(status_code=422, detail=[{"loc": ["body"], "msg": "Invalid JSON body", "type": "value_error"}])

    logger.info(f"Analyze request body keys: {list(body.keys())} func={func}")

    # Validate fields (return 422 with pydantic-like detail array)
    resume_text = body.get("resume_text")
    job_description = body.get("job_description")
    target_job_title = body.get("target_job_title", "") or ""

    missing_details = []
    if resume_text is None:
        missing_details.append({"loc": ["body", "resume_text"], "msg": "Field required", "type": "value_error.missing"})
    if job_description is None:
        missing_details.append({"loc": ["body", "job_description"], "msg": "Field required", "type": "value_error.missing"})

    if missing_details:
        logger.warning(f"Analyze: missing fields: {missing_details}")
        raise HTTPException(status_code=422, detail=missing_details)

    if not isinstance(resume_text, str) or not resume_text.strip():
        logger.warning("Analyze: resume_text must be a non-empty string")
        raise HTTPException(status_code=422, detail=[{"loc": ["body", "resume_text"], "msg": "resume_text must be a non-empty string", "type": "value_error"}])
    if not isinstance(job_description, str) or not job_description.strip():
        logger.warning("Analyze: job_description must be a non-empty string")
        raise HTTPException(status_code=422, detail=[{"loc": ["body", "job_description"], "msg": "job_description must be a non-empty string", "type": "value_error"}])

    # Preprocess
    r_text = preprocess_text(resume_text)
    jd_text = preprocess_text(job_description)

    try:
        result = await analyze_with_ai(r_text, jd_text, target_job_title)
    except Exception as e:
        logger.error(f"Analyze: AI analysis error: {e}")
        raise HTTPException(status_code=500, detail="Internal analysis error")

    doc = AnalysisResult(
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
    )

    # ---------- FIX: defensive get_db usage (do not use truthy test on DB object) ----------
    try:
        db_conn = None
        try:
            db_conn = get_db()
        except Exception as e_getdb:
            # get_db may raise if env var missing or connection problems; handle gracefully
            logger.warning(f"Analyze: get_db() failed or DB not configured: {e_getdb}")
            db_conn = None

        if db_conn is not None:
            # ensure analysis_results collection exists and insert
            try:
                await db_conn.analysis_results.insert_one(doc.dict())
                logger.info("Analyze: saved analysis result to DB")
            except Exception as e_insert:
                logger.warning(f"Analyze: failed to persist analysis result: {e_insert}")
    except Exception:
        # outer safety net — never crash the endpoint due to persistence
        logger.exception("Unexpected error during DB persistence step")

    return AnalysisResponse(**doc.dict())

@api.get("/analysis/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis_detail(analysis_id: str):
    # ---------- FIX: check get_db() defensively and compare to None ----------
    try:
        try:
            db_local = get_db()
        except Exception as e_db:
            logger.warning(f"get_analysis_detail: DB not available: {e_db}")
            db_local = None

        if db_local is None:
            raise HTTPException(status_code=500, detail="Database not available")

        item = await db_local.analysis_results.find_one({"id": analysis_id})
        if not item:
            raise HTTPException(status_code=404, detail="Analysis not found")
        item.pop("_id", None)
        return AnalysisResponse(**item)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("get_analysis_detail: unexpected error")
        raise HTTPException(status_code=500, detail=str(e))

@api.get("/analysis-history", response_model=List[AnalysisResponse])
async def get_analysis_history():
    # ---------- FIX: get_db() defensively and avoid `if not db` style checks ----------
    try:
        try:
            db_local = get_db()
        except Exception as e_db:
            logger.warning(f"get_analysis_history: DB not available: {e_db}")
            db_local = None

        if db_local is None:
            # If DB not configured, return empty list (frontend handles no-history gracefully)
            return []

        projection = {"resume_text": 0, "job_description": 0}
        cursor = db_local.analysis_results.find({}, projection).sort("created_at", -1).limit(10)
        items = await cursor.to_list(length=None)
        out: List[AnalysisResponse] = []
        for x in items or []:
            x.pop("_id", None)
            x.setdefault("resume_text", "")
            x.setdefault("job_description", "")
            x.setdefault("ats_compatibility_score", 0)
            x.setdefault("quantification_feedback", [])
            x.setdefault("target_job_title", "")
            out.append(AnalysisResponse(**x))
        return out
    except Exception as e:
        logger.exception("get_analysis_history: failed")
        raise HTTPException(status_code=500, detail="Failed to load analysis history")

@api.post("/generate-summary", response_model=SummaryResponse)
@limiter.limit("10/minute")
async def generate_summary(request: Request, payload: SummaryRequest):
    resume_text = preprocess_text(payload.resume_text)
    if not resume_text:
        raise HTTPException(status_code=422, detail=[{"loc": ["body", "resume_text"], "msg": "Resume text is required", "type": "value_error"}])

    try:
        # Try GEMINI_API_KEY first, fallback to EMERGENT_LLM_KEY for backward compatibility
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("EMERGENT_LLM_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY not configured")

        from google import genai
        
        client = genai.Client(api_key=api_key, http_options={'api_version': 'v1'})

        prompt = f"""
Based on the following resume text, write 3 professional, high-impact summary statements for a job application.
Return them as a JSON list in the format: {{ "summaries": ["summary1", "summary2", "summary3"] }}

RESUME TEXT:
{resume_text[:2000]}...
"""
        response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)
        text = response.text
        s, e = text.find("{"), text.rfind("}") + 1
        if s != -1 and e != -1:
            payload = json.loads(text[s:e])
            return SummaryResponse(summaries=payload.get("summaries", []))
        raise ValueError("AI JSON parsing for summary failed")
    except Exception as e:
        logger.error(f"Summary generation failed: {e}")
        return SummaryResponse(summaries=[f"Error generating summaries: {str(e)}"])

@api.get("/health")
async def health():
    try:
        try:
            db_local = get_db()
        except Exception as e_db:
            logger.warning(f"health: DB not available: {e_db}")
            db_local = None

        if db_local is not None:
            # Use command ping (motor/pymongo API)
            await db_local.command("ping")
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# mount router
app.include_router(api)
