from app.extraction.rules import RuleBasedResumeParser
from app.normalization.titles import JobTitleNormalizer
from app.normalization.skills import SkillNormalizer
from app.normalization.qualifications import QualificationNormalizer
from app.ai.fake import FakeLLMProvider
from app.schemas.resume import ResumeExtractionResult


def test_spanish_resume_extraction():
    spanish_text = """
    Carlos Gomez
    Ingeniero de Software Backend
    Email: carlos.gomez@empresa.es
    Telefono: +34 612 345 678

    EXPERIENCIA PROFESIONAL
    Desarrollador Backend Senior (2020 - Presente)
    Desarrollo de microservicios con Python, FastAPI y bases de datos PostgreSQL.

    EDUCACION
    Licenciatura en Ciencias de la Computacion, Universidad de Madrid
    """

    # Rule extraction captures email and phone
    rule_res = RuleBasedResumeParser.parse(spanish_text)
    assert rule_res.personal_information.email == "carlos.gomez@empresa.es"

    # Fake LLM provider simulates multilingual translation
    fake_llm = FakeLLMProvider()
    llm_res = fake_llm.generate_structured(spanish_text, ResumeExtractionResult)
    assert llm_res.detected_language == "es"


def test_french_resume_extraction():
    french_text = """
    Pierre Dubois
    Développeur Backend
    Email: pierre.dubois@tech.fr
    Téléphone: +33 1 23 45 67 89

    EXPÉRIENCE
    Ingénieur d'études (2019 - Présent)
    Conception d'APIs en Python et PostgreSQL.
    """

    rule_res = RuleBasedResumeParser.parse(french_text)
    assert rule_res.personal_information.email == "pierre.dubois@tech.fr"

    fake_llm = FakeLLMProvider()
    llm_res = fake_llm.generate_structured(french_text, ResumeExtractionResult)
    assert llm_res.detected_language == "fr"


def test_german_resume_extraction():
    german_text = """
    Hans Mueller
    Backend Entwickler
    Email: hans.mueller@berlin.de
    Telefon: +49 30 1234567

    BERUFSERFAHRUNG
    Softwareentwickler (2018 - Heute)
    Entwicklung von Backend-Systemen mit Python und Docker.
    """

    rule_res = RuleBasedResumeParser.parse(german_text)
    assert rule_res.personal_information.email == "hans.mueller@berlin.de"

    fake_llm = FakeLLMProvider()
    llm_res = fake_llm.generate_structured(german_text, ResumeExtractionResult)
    assert llm_res.detected_language == "de"
