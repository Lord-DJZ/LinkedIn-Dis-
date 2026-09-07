from fastapi.testclient import TestClient


def test_register_candidate(client: TestClient):
    resp = client.post("/api/v1/auth/register", json={
        "email": "cand_new@example.com",
        "password": "SecurePassword123!",
        "role": "candidate",
        "full_name": "New Candidate"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["role"] == "candidate"
    assert data["profile_id"] is not None


def test_register_recruiter(client: TestClient):
    resp = client.post("/api/v1/auth/register", json={
        "email": "rec_new@example.com",
        "password": "SecurePassword123!",
        "role": "recruiter",
        "full_name": "Recruiter One",
        "company_name": "TalentCorp"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["role"] == "recruiter"


def test_duplicate_registration_fails(client: TestClient):
    payload = {
        "email": "dup@example.com",
        "password": "SecurePassword123!",
        "role": "candidate"
    }
    r1 = client.post("/api/v1/auth/register", json=payload)
    assert r1.status_code == 200

    r2 = client.post("/api/v1/auth/register", json=payload)
    assert r2.status_code == 409
    assert r2.json()["error_code"] == "DUPLICATE_ENTITY"


def test_login_success(client: TestClient):
    # Register first
    client.post("/api/v1/auth/register", json={
        "email": "login_test@example.com",
        "password": "MySecretPassword1!",
        "role": "candidate"
    })

    # Login
    resp = client.post("/api/v1/auth/login", json={
        "email": "login_test@example.com",
        "password": "MySecretPassword1!"
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_invalid_password(client: TestClient):
    client.post("/api/v1/auth/register", json={
        "email": "wrong_pass@example.com",
        "password": "CorrectPassword1!",
        "role": "candidate"
    })
    resp = client.post("/api/v1/auth/login", json={
        "email": "wrong_pass@example.com",
        "password": "WrongPassword99!"
    })
    assert resp.status_code == 401
