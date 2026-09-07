import httpx

client = httpx.Client(base_url='http://127.0.0.1:8000/api/v1', timeout=60.0)

# 1. Register or Login candidate
print('1. Authenticating Candidate...')
auth_res = client.post('/auth/login', json={
    'email': 'demuni.test@dullnit.com',
    'password': 'CandidatePassword123!'
})
if auth_res.status_code != 200:
    auth_res = client.post('/auth/register', json={
        'email': 'demuni.test@dullnit.com',
        'password': 'CandidatePassword123!',
        'role': 'candidate',
        'full_name': 'Demuni Jayasmith'
    })
token = auth_res.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}
print('   Candidate authenticated, token received.')

# 2. Upload sample resume PDF
print('2. Uploading storage/sample_resume.pdf with live Gemini processing...')
with open('storage/sample_resume.pdf', 'rb') as f:
    upload_res = client.post(
        '/resumes/upload',
        params={'process_now': True},
        files={'file': ('demuni_resume.pdf', f, 'application/pdf')},
        headers=headers
    )
upload_json = upload_res.json()
resume_id = upload_json['id']
status = upload_json['status']
print(f'   Resume uploaded. ID: {resume_id}, Status: {status}')

# 3. Retrieve extraction review
print('3. Fetching Extraction Review (AI + Rule Reconciliation)...')
review_res = client.get(f'/resumes/{resume_id}/extraction', headers=headers)
review_data = review_res.json()['reconciled_data']
print('   Extracted Name:', review_data['personal_information']['full_name'])
print('   Extracted Email:', review_data['personal_information']['email'])
print('   Extracted Phone:', review_data['personal_information']['phone'])
print('   Extracted City:', review_data['personal_information']['city'])
print('   Extracted Skills count:', len(review_data['skills']))
print('   Extracted Skills:', [s['original_name'] for s in review_data['skills'][:6]])
print('   Extracted Experience count:', len(review_data['experience']))
print('   Extracted Education count:', len(review_data['education']))

# 4. Candidate Confirms Profile
print('4. Confirming Extracted Profile...')
confirm_res = client.post(
    f'/resumes/{resume_id}/confirm',
    json={'confirmed_data': review_data},
    headers=headers
)
confirmed_profile = confirm_res.json()
print('   Profile Confirmed!')
print('   Authoritative Skills:', [s['normalized_name'] for s in confirmed_profile['skills'][:6]])
print('   Total Experience:', confirmed_profile['total_years_experience'], 'years')
print('   Profile Completeness:', confirmed_profile['completeness_score'], '%')

# 5. Fetch Auto-generated Candidate Persona
print('5. Fetching Derived Candidate Persona...')
persona_res = client.get('/candidates/persona', headers=headers)
persona = persona_res.json()
print('   Persona Headline:', persona['headline'])
print('   Persona Seniority:', persona['seniority_level'])
print('   Persona Top Skills:', persona['top_skills'])
print('   Persona Summary:', persona['summary'])

# 6. Recruiter searches for this candidate
print('6. Recruiter Discovery Test (PostGIS + Ranking)...')
rec_login = client.post('/auth/login', json={'email': 'recruiter@example.com', 'password': 'RecruiterPass123!'})
rec_token = rec_login.json()['access_token']
rec_headers = {'Authorization': f'Bearer {rec_token}'}

search_res = client.post('/search/candidates', json={
    'required_skills': ['Python', 'FastAPI'],
    'latitude': 6.9271,
    'longitude': 79.8612,
    'radius_km': 30.0
}, headers=rec_headers)
search_items = search_res.json()['items']
demuni_match = next((c for c in search_items if 'Demuni' in c['display_name']), None)
if demuni_match:
    print('   SUCCESS: Discovered in Recruiter Search!')
    print('   Match Score:', demuni_match['match_score'], '%')
    print('   Match Reasons:', demuni_match['match_reasons'])
else:
    print('   Candidate not found in search results. Results returned:', len(search_items))
