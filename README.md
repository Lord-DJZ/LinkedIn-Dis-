# Dullnit V1 — Candidate Discovery & Recruitment Matching Platform

A production-grade, backend-first candidate discovery and recruitment matching platform designed with strict deterministic database guarantees, spatial PostGIS filtering, transparent multi-criteria scoring, PyMuPDF / python-docx text extraction, and provider-agnostic Google Gemini AI structured reconciliation.

---

## 1. System Architecture

```
                                  CANDIDATE
                                      │
                      ┌───────────────┴───────────────┐
                      │                               │
                 Manual Entry                    Resume Upload
                      │                               │
                      │                         PDF / DOCX
                      │                               │
                      │                        Text Extraction
                      │                           (NO LLM)
                      │                               │
                      │                          Resume Text
                      │                               │
                      │                    ┌──────────┴──────────┐
                      │                    │                     │
                      │               Rule Parser           Gemini LLM
                      │                    │                     │
                      │                    └──────────┬──────────┘
                      │                               │
                      └─────────────────────── Reconciliation
                                                      │
                                                 Validation
                                                      │
                                                Normalization
                                                      │
                                               Candidate Review
                                                      │
                                                 Confirmation
                                                      │
                                                  PostgreSQL
                                                      │
                                               Candidate Persona
                                                      │
                                               Searchable Profile
                                                      │
                                                      ▼
                                                RECRUITER SEARCH
                                                      │
                                             PostgreSQL + PostGIS
                                                      │
                                                  Ranking
                                                      │
                                                      ▼
                                               Candidate Results
```

### Core Architecture Principles
1. **Authoritative Structured PostgreSQL Data**: AI responses and LLM prose are never treated as authoritative truth. Only candidate-confirmed, validated records inside PostgreSQL represent the candidate profile.
2. **Text Extraction Without LLM**: Resumes (PDF / DOCX) are parsed into raw text using PyMuPDF and `python-docx`. Machine readability is verified; unreadable scanned PDFs trigger an `ocr_required` status rather than silent failure.
3. **Reconciliation Engine**: Deterministic facts (emails, phones, URLs, standard headings) captured via regex and rules are married with semantic contextual facts from Gemini structured output.
4. **Canonical Normalization Layer**: Aliases (e.g. `ReactJS`, `React.js` -> `React`; `Postgres` -> `PostgreSQL`) are normalized to canonical entities with preserved original values and source provenance.
5. **Deterministic PostGIS Spatial Search**: Recruiters search by spatial coordinates (lat/lon) and radius in kilometers using spatial indexes rather than string matching.
6. **Transparent 0–100 Scoring & Ranking**: Candidates who meet hard criteria are scored across skill coverage, experience seniority, education, role match, and proximity with explicit human-readable reasons (e.g., `Matched 2/2 required skills`, `4.0 years experience`, `8.3 km away`).
7. **Zero Secret Leakage**: The Google Gemini API key is managed exclusively server-side via environment variables; it is never exposed in frontend code, client bundles, or browser storage.

---

## 2. Technology Stack

### Backend
- **Framework**: Python 3.12+ / 3.14+, FastAPI (Asynchronous REST API)
- **Validation**: Pydantic V2 & Pydantic-Settings
- **ORM & DB**: SQLAlchemy 2.0, Alembic, PostgreSQL 16 + PostGIS 3.4 (with automatic Haversine fallback on SQLite for zero-configuration local runs)
- **Document Extractors**: PyMuPDF (`fitz`), `python-docx`
- **Security**: Passlib (`bcrypt`), PyJWT (`HS256`), SHA-256 deduplication
- **AI / LLM Integration**: Google Gemini API via official `google-genai` SDK with strict JSON schemas and prompt injection protection; provider-agnostic `LLMProvider` abstraction (`GeminiLLMProvider` & `FakeLLMProvider`)
- **Testing**: Pytest, FastAPI TestClient, SQLite in-memory test harness

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: White Glassmorphism + Subtle Neumorphism (custom CSS design system)
- **Icons**: Lucide React
- **Architecture**: Decoupled API service layer (`frontend/src/services/api.ts`)

---

## 3. Directory Structure

```
Dullnit V1 Project/
├── app/
│   ├── ai/                      # Provider-agnostic LLM layer (Gemini, Fake, Base, Factory)
│   ├── api/v1/                  # REST API routes (auth, candidates, resumes, search, recruiters, admin)
│   ├── core/                    # App settings, security, centralized error handling
│   ├── database/                # Engine, session, Base, and seed routines
│   ├── extraction/              # PDF (PyMuPDF), DOCX (python-docx), and Rule-based parsers
│   ├── models/                  # SQLAlchemy entities (User, Candidate, Skill, Resume, Persona, Audit)
│   ├── normalization/           # Canonical normalizers for skills, qualifications, job titles
│   ├── schemas/                 # Pydantic V2 validation schemas
│   ├── services/                # Business services (Profile, Resume, Reconciliation, Search, Scoring, Persona)
│   ├── storage/                 # Secure file storage abstraction (LocalFileStorage with UUID and hash)
│   └── main.py                  # FastAPI entry point & CORS configuration
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, CandidateDashboard, RecruiterDashboard, AuthModal, AdminModal
│   │   ├── services/            # Frontend API client
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx              # Root component
│   │   └── index.css            # Glassmorphism & Neumorphism design system
│   ├── package.json
│   └── vite.config.ts
├── tests/                       # 27 comprehensive automated tests across all domains
├── docker-compose.yml           # PostgreSQL 16 + PostGIS 3.4 Docker container
├── dullnit.db                   # Local SQLite database (pre-seeded with test data)
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variable templates
└── README.md
```

---

## 4. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### Key Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL or SQLite connection string | `sqlite:///./dullnit.db` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `change-me-to-a-secure-random-secret` |
| `AI_ENABLED` | Toggle AI extraction and persona generation | `true` |
| `AI_PROVIDER` | LLM Provider (`gemini` or `fake`) | `fake` (or `gemini` when key is supplied) |
| `GEMINI_API_KEY` | Google Gemini API key (kept strictly backend-side) | `""` |
| `GEMINI_MODEL` | Primary Gemini model | `gemini-2.5-flash` |
| `AI_FALLBACK_MODEL`| Fallback model for retries | `gemini-1.5-flash` |
| `FILE_UPLOAD_LIMIT`| Maximum allowed CV upload size in bytes | `10485760` (10MB) |

---

## 5. Quick Start Guide

### Step 1: Backend Setup
Ensure you have Python installed. Activate your virtual environment and install dependencies:

```bash
# In project root
python -m venv venv
.\venv\Scripts\activate   # Windows (or source venv/bin/activate on Unix)
pip install -r requirements.txt
```

### Step 2: Initialize & Seed Database
Initialize database tables and seed canonical skills, admin, recruiter, and test candidates (Candidates A, B, C, D):

```bash
python -m app.database.seed
```

### Step 3: Run Backend API Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- **API Base**: `http://localhost:8000`
- **Interactive Swagger Documentation**: `http://localhost:8000/docs`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`
- **Health Check**: `http://localhost:8000/health`

### Step 4: Run Frontend Client
In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 6. Pre-Seeded Demonstration Accounts

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Recruiter** | `recruiter@example.com` | `RecruiterPass123!` | Discovery & candidate search |
| **Candidate A** | `candidate_a@example.com`| `CandidatePass123!` | Python, FastAPI, PostgreSQL, 4 yrs exp, Colombo |
| **Candidate B** | `candidate_b@example.com`| `CandidatePass123!` | Java, Spring Boot, MySQL, 6 yrs exp, Kandy |
| **Candidate C** | `candidate_c@example.com`| `CandidatePass123!` | React, TypeScript, Node.js, 3 yrs exp, Colombo |
| **Candidate D** | `candidate_d@example.com`| `CandidatePass123!` | Python, Django, AWS, 7 yrs exp, Galle |
| **Admin** | `admin@example.com` | `AdminPass123!` | System health & AI diagnostics |

---

## 7. Recruiter Discovery & PostGIS Spatial Queries

Recruiters can query candidates using multi-criteria filters via `POST /api/v1/search/candidates`:

```json
{
  "required_skills": ["Python", "FastAPI"],
  "roles": ["Backend Engineer"],
  "minimum_experience_years": 3.0,
  "latitude": 6.9271,
  "longitude": 79.8612,
  "radius_km": 30.0,
  "availability_status": "available",
  "page": 1,
  "page_size": 20
}
```

### Ranking & Scoring Breakdown (0–100 Scale)
Every candidate returned includes explicit match explanations:
```json
{
  "candidate_id": "84d72851-...",
  "display_name": "Kavinda Perera",
  "headline": "Mid-Level Backend Software Engineer",
  "match_score": 88.5,
  "distance_km": 0.0,
  "match_reasons": [
    "Matched 2/2 required skills (100%)",
    "4.0 years experience satisfies minimum (3.0 yrs)",
    "Located within 30.0km radius (0.0km)",
    "Preferred role matches Backend Engineer"
  ]
}
```

---

## 8. Running Automated Tests

Run the full automated test suite covering authentication, file extraction, rule parsing, multilingual extraction, normalization, resume pipeline reconciliation, PostGIS search, ranking, and security hardening:

```bash
.\venv\Scripts\pytest -v
```

All 27 test cases pass deterministically in under 8 seconds.
