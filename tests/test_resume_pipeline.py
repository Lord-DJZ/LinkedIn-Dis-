import io
import pymupdf
from fastapi.testclient import TestClient


def create_test_pdf() -> bytes:
    doc = pymupdf.open()
    page = doc.new_page()
    content = """
    Alex Mercer
    Senior Backend Software Engineer
    Email: alex.mercer@example.com
    Phone: +1 555 123 4567
    Location: Colombo, Sri Lanka

    SUMMARY
    Senior Backend Engineer with 5 years in Python, FastAPI, and Cloud Architecture.

    TECHNICAL SKILLS
    Python, FastAPI, PostgreSQL, Docker, Redis, REST API

    EXPERIENCE
    Global Tech Systems - Senior Software Engineer (2019 - Present)
    Architected high-throughput microservices using FastAPI and optimized database indexing.

    EDUCATION
    University of Colombo - Bachelor of Science in Computer Science (2015 - 2019)
    """
    page.insert_text((50, 50), content)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def test_complete_resume_upload_review_confirm_pipeline(client: TestClient, candidate_auth_headers):
    headers, user, profile = candidate_auth_headers

    # 1. Upload Resume with process_now=True
    pdf_data = create_test_pdf()
    upload_resp = client.post(
        "/api/v1/resumes/upload",
        params={"process_now": True},
        files={"file": ("alex_mercer_resume.pdf", io.BytesIO(pdf_data), "application/pdf")},
        headers=headers
    )
    assert upload_resp.status_code == 201
    resume_id = upload_resp.json()["id"]

    # 2. Check Extraction Review
    review_resp = client.get(
        f"/api/v1/resumes/{resume_id}/extraction",
        headers=headers
    )
    assert review_resp.status_code == 200
    extraction_data = review_resp.json()
    assert extraction_data["status"] == "review_required"
    assert extraction_data["is_confirmed"] is False
    assert len(extraction_data["reconciled_data"]["skills"]) > 0


    # 3. Retrieve Extraction Review
    review_resp = client.get(
        f"/api/v1/resumes/{resume_id}/extraction",
        headers=headers
    )
    assert review_resp.status_code == 200
    reconciled = review_resp.json()["reconciled_data"]
    assert reconciled["personal_information"]["email"] == "alex.mercer@example.com"

    # 4. Candidate edits a field (e.g. adjusts total experience)
    reconciled["professional_information"]["estimated_total_experience_years"] = 5.5
    edit_resp = client.patch(
        f"/api/v1/resumes/{resume_id}/extraction",
        json={"reconciled_data": reconciled},
        headers=headers
    )
    assert edit_resp.status_code == 200
    assert edit_resp.json()["reconciled_data"]["professional_information"]["estimated_total_experience_years"] == 5.5

    # 5. Candidate Confirms Profile
    confirm_resp = client.post(
        f"/api/v1/resumes/{resume_id}/confirm",
        json={"confirmed_data": reconciled},
        headers=headers
    )
    assert confirm_resp.status_code == 200
    confirmed_profile = confirm_resp.json()
    assert confirmed_profile["total_years_experience"] == 5.5
    assert len(confirmed_profile["skills"]) > 0
    assert confirmed_profile["completeness_score"] > 70

    # 6. Check Persona Auto-Generation
    persona_resp = client.get("/api/v1/candidates/persona", headers=headers)
    assert persona_resp.status_code == 200
    persona = persona_resp.json()
    assert "Senior" in persona["seniority_level"] or "Mid-Level" in persona["seniority_level"]
    assert len(persona["top_skills"]) > 0
    assert len(persona["headline"]) > 0
