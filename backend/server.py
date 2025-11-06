import os
import io
import re
import uuid
import json
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any
from contextlib import asynccontextmanager 

from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import nltk
import PyPDF2
import docx
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.db import get_db

# --- NEW: Rate Limiting Imports using slowapi ---
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.requests import Request
from motor.motor_asyncio import AsyncIOMotorClient # Ensure motor is imported

try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download("punkt")
try:
    nltk.data.find("corpora/stopwords")
except LookupError:
    nltk.download("stopwords")

# --- NEW: Setup slowapi Limiter ---
# We use the 'get_remote_address' function to identify users by their IP
limiter = Limiter(key_func=get_remote_address, default_limits=["1000/hour"])
# We will apply specific limits to routes using 'Depends'

# --- NEW: Lifespan (just for MongoDB) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to MongoDB
    global db
    try:
        client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
        db = client[os.getenv("DB_NAME", "resume_matcher_db")]
        # Ping the server
        await client.admin.command('ping')
        logging.info("Successfully connected to MongoDB!")
    except Exception as e:
        logging.warning(f"Error connecting to MongoDB: {e}")
        db = None # Handle connection failure gracefully
    
    yield
    
    # No cleanup needed for slowapi


app = FastAPI(title="AI Resume & Job Matcher API", lifespan=lifespan)
api = APIRouter(prefix="/api")

# --- NEW: Add slowapi state and exception handler ---
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


DEFAULT_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https.ai-resume-checker-2003.vercel.app", 
    "https.app-git-main-aftab-pathans-projects-9c06d6e7.vercel.app",
]

# Optionally allow comma-separated extra origins via env (e.g. preview URLs)
_extra = os.getenv("FRONTEND_ORIGINS", "").strip()
if _extra:
    DEFAULT_ORIGINS += [o.strip() for o in _extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^(https?:\/\/localhost(:\d+)?|https:\/\/ai-resume-checker-2003\.vercel\.app|https:\/\/app(?:-[a-z0-9]+)*-aftab-pathans-projects-9c06d6e7\.vercel\.app)$",
    allow_origins=DEFAULT_ORIGINS, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Models (No Change)
# ----------------------------
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

# ----------------------------
# Utilities (No Change)
# ----------------------------
def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        out = []
        for page in reader.pages:
            out.append(page.extract_text() or "")
        return "\n".join(out).strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting PDF text: {e}")

def extract_text_from_docx(file_content: bytes) -> str:
    try:
        d = docx.Document(io.BytesIO(file_content))
        return "\n".join(p.text for p in d.paragraphs).strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting DOCX text: {e}")

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
        logging.warning(f"TFIDF missing skills failed: {e}")
        return ["Communication", "Leadership", "Project Management"]


# ---- AI Analysis (No Change) ----
async def analyze_with_ai(resume_text: str, job_description: str, target_job_title: str) -> Dict[str, Any]:
    try:
        api_key = os.getenv("EMERGENT_LLM_KEY")
        if not api_key:
            raise RuntimeError("EMERGENT_LLM_KEY not configured")

        from emergentintegrations.llm.chat import LlmChat, UserMessage

        chat = LlmChat(
            api_key=api_key,
            session_id=str(uuid.uuid4()),
            system_message="You are an expert HR analyst and career counselor specializing in resume-job matching analysis.",
        ).with_model("gemini", "gemini-2.5-flash")

        prompt = f"""
Analyze the following resume against the job description and provide a detailed assessment in JSON.

TARGET JOB TITLE: {target_job_title}
RESUME:
{resume_text[:2000]}...
JOB DESCRIPTION:
{job_description[:2000]}...

JSON FORMAT:
{{
  "match_percentage": <0-100>,
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "recommendations": ["rec1", "rec2"],
  "analysis_summary": "2-3 sentence summary",
  "ats_compatibility_score": <number 0-100>,
  "quantification_feedback": ["feedback1", "feedback2"]
}}

Focus on:
1. Technical skills alignment
2. Experience relevance
3. Educational background match
4. Soft skills compatibility
5. Industry experience
6. **Evaluate resume formatting and layout for ATS compliance (return as ats_compatibility_score).**
7. **Identify bullet points that lack quantifiable achievements and suggest improvements (return as quantification_feedback).**
"""
        response = await chat.send_message(UserMessage(text=prompt))
        text = str(response)

        s, e = text.find("{"), text.rfind("}") + 1
        if s != -1 and e != -1:
            payload = json.loads(text[s:e])
            return {
                "match_percentage": float(payload.get("match_percentage", 0)),
                "matched_skills": list(payload.get("matched_skills", [])),
                "missing_skills": list(payload.get("missing_skills", [])),
                "recommendations": list(payload.get("recommendations", [])),
                "analysis_summary": str(payload.get("analysis_summary", "AI analysis completed.")),
                "ats_compatibility_score": float(payload.get("ats_compatibility_score", 0)),
                "quantification_feedback": list(payload.get("quantification_feedback", [])),
            }

        raise ValueError("AI JSON parsing failed")

    except Exception as e:
        logging.warning(f"AI analysis unavailable, using basic similarity. Reason: {e}")
        score = calculate_basic_similarity(resume_text, job_description)
        missing_skills_list = get_missing_skills_from_tfidf(resume_text, job_description)
        return {
            "match_percentage": score,
            "matched_skills": extract_skills_from_text(resume_text)[:5],
            "missing_skills": missing_skills_list,
            "recommendations": [
                "Highlight relevant experience more prominently",
                "Add specific technical certifications",
                "Include quantifiable achievements",
            ],
            "analysis_summary": f"Basic analysis completed with {score:.1f}% match score.",
            "ats_compatibility_score": 70.0,
            "quantification_feedback": ["Consider adding metrics to 2-3 key accomplishments."],
        }

# ----------------------------
# Routes
# ----------------------------
@api.get("/")
async def root():
    return {"message": "AI Resume & Job Matcher API"}

@api.post("/upload-resume", response_model=Dict[str, str])
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    content = await file.read()
    name = (file.filename or "").lower()
    if name.endswith(".pdf"):
        text = extract_text_from_pdf(content)
    elif name.endswith((".docx", ".doc")):
        text = extract_text_from_docx(content)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Upload PDF or DOCX.")
    if not text.strip():
        raise HTTPException(status_code=400, detail="No text found in the uploaded file")

    return {"text": text, "filename": file.filename}

# --- UPDATED: Added Rate Limiting with slowapi ---
@api.post("/analyze", response_model=AnalysisResponse, dependencies=[Depends(limiter.limit("10/minute"))])
async def analyze_resume_job_match(request: Request, payload: AnalysisResultCreate):
    resume_text = preprocess_text(payload.resume_text)
    jd_text = preprocess_text(payload.job_description)
    if not resume_text or not jd_text:
        raise HTTPException(status_code=400, detail="Both resume text and job description are required")

    result = await analyze_with_ai(resume_text, jd_text, payload.target_job_title)

    doc = AnalysisResult(
        match_percentage=result["match_percentage"],
        matched_skills=result["matched_skills"],
        missing_skills=result["missing_skills"],
        recommendations=result["recommendations"],
        analysis_summary=result["analysis_summary"],
        resume_text=payload.resume_text,
        job_description=payload.job_description,
        target_job_title=payload.target_job_title,
        ats_compatibility_score=result["ats_compatibility_score"],
        quantification_feedback=result["quantification_feedback"],
    )

    db = get_.db()
    await db.analysis_results.insert_one(doc.dict())

    return AnalysisResponse(**doc.dict())

@api.get("/analysis/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis_detail(analysis_id: str):
    db = get_db()
    item = await db.analysis_results.find_one({"id": analysis_id})
    
    if not item:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    return AnalysisResponse(**item)

@api.get("/analysis-history", response_model=List[AnalysisResponse])
async def get_analysis_history():
    db = get_db()
    
    projection = {
        "resume_text": 0,
        "job_description": 0
    }
    
    # --- BUG FIX: Removed extra dot from db.analysis_results..find ---
    cursor = db.analysis_results.find({}, projection).sort("created_at", -1).limit(10)
    items = await cursor.to_list(length=None)
    
    out: List[AnalysisResponse] = []
    for x in items or []:
        x.pop("_id", None)
        x.setdefault("resume_text", "") 
        x.setdefault("job_description", "")
        x.setdefault("ats_compatibility_score", 0) 
        x.setdefault("quantification_feedback", [])
        out.append(AnalysisResponse(**x))
    return out

# --- UPDATED: Added Rate Limiting with slowapi ---
@api.post("/generate-summary", response_model=SummaryResponse, dependencies=[Depends(limiter.limit("10/minute"))])
async def generate_summary(request: Request, payload: SummaryRequest):
    resume_text = preprocess_text(payload.resume_text)
    if not resume_text:
        raise HTTPException(status_code=400, detail="Resume text is required")

    try:
        api_key = os.getenv("EMERGENT_LLM_KEY")
        if not api_key:
            raise RuntimeError("EMERGENT_LLM_KEY not configured")

        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=api_key,
            session_id=str(uuid.uuid4()),
            system_message="You are an expert resume writer.",
        ).with_model("gemini", "gemini-2.5-flash")

        prompt = f"""
Based on the following resume text, write 3 professional, high-impact summary statements for a job application.
Return them as a JSON list in the format: {{"summaries": ["summary1", "summary2", "summary3"]}}

RESUME TEXT:
{resume_text[:2000]}...
"""
        response = await chat.send_message(UserMessage(text=prompt))
        text = str(response)

        s, e = text.find("{"), text.rfind("}") + 1
        if s != -1 and e != -1:
            payload = json.loads(text[s:e])
            return SummaryResponse(summaries=payload.get("summaries", []))
        
        raise ValueError("AI JSON parsing for summary failed")
        
    except Exception as e:
        logging.error(f"Summary generation failed: {e}")
        # Fallback in case of error
        return SummaryResponse(summaries=[
            f"Error generating summaries: {str(e)}",
        ])


@api.get("/health")
async def health():
    try:
        db = get_db()
        await db.command("ping")
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# mount the /api router LAST so CORS is already in place
app.include_router(api)

# ----------------------------
# Logging
# ----------------------------
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("resume-matcher")