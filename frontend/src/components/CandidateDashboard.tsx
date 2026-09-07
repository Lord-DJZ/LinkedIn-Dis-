import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import type {
  CandidateProfile,
  CandidatePersona,
  ResumeExtractionResult,
} from '../types';
import { CandidatePersonaCard } from './CandidatePersonaCard';
import {
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  MapPin,
  RefreshCw,
  Info,
  ArrowRight,
  ArrowLeft,
  Cpu,
} from 'lucide-react';

interface CandidateDashboardProps {
  onOpenAuth: () => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({ onOpenAuth }) => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [persona, setPersona] = useState<CandidatePersona | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cisco-style Wizard Stepper State: 1: Basics, 2: Functional Areas & Skills, 3: Resume Upload, 4: Reconciled Review
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Basics & Location
  const [fullName, setFullName] = useState<string>('');
  const [headline, setHeadline] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [totalYears, setTotalYears] = useState<number>(4);
  const [city, setCity] = useState<string>('Colombo');
  const [country, setCountry] = useState<string>('Sri Lanka');
  const [latitude, setLatitude] = useState<number | undefined>(6.9271);
  const [longitude, setLongitude] = useState<number | undefined>(79.8612);
  const [availability, setAvailability] = useState<string>('available_now');
  const [visibility, setVisibility] = useState<'public' | 'anonymous' | 'private'>('public');

  // Step 2: Functional Areas (Cisco Pill Toggles) & Skills
  const [selectedFunctionalAreas, setSelectedFunctionalAreas] = useState<string[]>([
    'Backend Engineering',
    'AI & Machine Learning',
  ]);
  const [newSkill, setNewSkill] = useState<string>('');
  const [newSkillYears, setNewSkillYears] = useState<number>(3);

  // Step 3: Resume Upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [pipelineState, setPipelineState] = useState<string | null>(null);
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null);
  const [extractionData, setExtractionData] = useState<ResumeExtractionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const functionalOptions = [
    { id: 'Backend Engineering', label: 'Backend Engineering', icon: '⚙️' },
    { id: 'AI & Machine Learning', label: 'AI & Machine Learning', icon: '🧠' },
    { id: 'Cloud & DevOps', label: 'Cloud & DevOps', icon: '☁️' },
    { id: 'Frontend / Web', label: 'Frontend / Web', icon: '💻' },
    { id: 'Database Architecture', label: 'Database Architecture', icon: '🗄️' },
    { id: 'Full Stack Systems', label: 'Full Stack Systems', icon: '⚡' },
  ];

  const toggleFunctionalArea = (area: string) => {
    if (selectedFunctionalAreas.includes(area)) {
      setSelectedFunctionalAreas(selectedFunctionalAreas.filter((a) => a !== area));
    } else {
      setSelectedFunctionalAreas([...selectedFunctionalAreas, area]);
    }
  };

  const fetchProfileAndPersona = async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await api.getMyProfile();
      setProfile(p);
      setFullName(p.full_name || '');
      setHeadline(p.headline || '');
      setBio(p.bio || '');
      setTotalYears(p.total_years_experience || 4);
      setCity(p.location?.city || 'Colombo');
      setCountry(p.location?.country || 'Sri Lanka');
      setLatitude(p.location?.latitude ?? 6.9271);
      setLongitude(p.location?.longitude ?? 79.8612);
      setAvailability(p.availability_status || 'available_now');
      setVisibility(p.profile_visibility || 'public');

      try {
        const pers = await api.getPersona();
        setPersona(pers);
      } catch (err) {
        setPersona(null);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('401')) {
        setError('Please sign in to view and configure your candidate profile.');
      } else {
        setError(err.message || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndPersona();
  }, []);

  const handleSaveStep1 = async () => {
    try {
      await api.updateProfile({
        full_name: fullName,
        headline,
        bio,
        total_years_experience: totalYears,
        availability_status: availability,
        profile_visibility: visibility,
      });

      if (city || country) {
        await api.setLocation({
          city,
          country,
          latitude: latitude ? Number(latitude) : undefined,
          longitude: longitude ? Number(longitude) : undefined,
        });
      }
      setCurrentStep(2);
    } catch (err: any) {
      alert(err.message || 'Failed to save basic info');
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    try {
      await api.addSkill(newSkill.trim(), 'Core Stack', newSkillYears);
      setNewSkill('');
      setNewSkillYears(3);
      await fetchProfileAndPersona();
    } catch (err: any) {
      alert(err.message || 'Failed to add skill');
    }
  };

  const handleRemoveSkill = async (id: string) => {
    try {
      await api.removeSkill(id);
      await fetchProfileAndPersona();
    } catch (err: any) {
      alert(err.message || 'Failed to remove skill');
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadResume = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setPipelineState('1. Uploading & computing SHA-256 hash...');
    try {
      setPipelineState('2. Extracting raw document text with PyMuPDF...');
      const res = await api.uploadResume(selectedFile);
      setUploadedResumeId(res.id);

      setPipelineState('3. Running deterministic regex rules & Gemini AI structured extraction...');
      const review = await api.getExtractionReview(res.id);
      setExtractionData(review.reconciled_data);
      setPipelineState(null);
      setCurrentStep(4);
    } catch (err: any) {
      alert(err.message || 'Resume extraction failed');
      setPipelineState(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmExtraction = async () => {
    if (!uploadedResumeId || !extractionData) return;
    setLoading(true);
    try {
      await api.confirmExtraction(uploadedResumeId, extractionData);
      alert('Profile confirmed and committed to PostgreSQL database successfully!');
      await fetchProfileAndPersona();
      setCurrentStep(1);
    } catch (err: any) {
      alert(err.message || 'Failed to confirm profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRegeneratePersona = async () => {
    try {
      const newPersona = await api.regeneratePersona();
      setPersona(newPersona);
    } catch (err: any) {
      alert(err.message || 'Failed to regenerate persona');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <RefreshCw className="animate-spin mx-auto text-blue-600 mb-3" size={32} />
        <p className="text-slate-600 font-medium">Connecting to candidate profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="elevated-card max-w-lg mx-auto p-8 text-center my-12">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex-center mx-auto mb-4 border border-blue-200">
          <Info size={28} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 font-heading mb-2">Sign In Required</h3>
        <p className="text-slate-600 text-sm mb-6">{error}</p>
        <button onClick={onOpenAuth} className="neu-btn neu-btn-primary mx-auto">
          Sign In / Register Demo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* 1. CISCO-STYLE PROGRESS STEPPER (Image 1 Inspiration) */}
      <div className="elevated-card p-6">
        <div className="wizard-stepper">
          {/* Step 1 */}
          <div className="step-item" onClick={() => setCurrentStep(1)}>
            <div className={`step-circle ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
              1
            </div>
            <span className={`step-label ${currentStep === 1 ? 'active' : ''}`}>
              Basic details
            </span>
          </div>
          <div className={`step-line ${currentStep > 1 ? 'completed' : ''}`} />

          {/* Step 2 */}
          <div className="step-item" onClick={() => setCurrentStep(2)}>
            <div className={`step-circle ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
              2
            </div>
            <span className={`step-label ${currentStep === 2 ? 'active' : ''}`}>
              Solutions profile
            </span>
          </div>
          <div className={`step-line ${currentStep > 2 ? 'completed' : ''}`} />

          {/* Step 3 */}
          <div className="step-item" onClick={() => setCurrentStep(3)}>
            <div className={`step-circle ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`}>
              3
            </div>
            <span className={`step-label ${currentStep === 3 ? 'active' : ''}`}>
              Document Ingestion
            </span>
          </div>
          <div className={`step-line ${currentStep > 3 ? 'completed' : ''}`} />

          {/* Step 4 */}
          <div className="step-item" onClick={() => setCurrentStep(4)}>
            <div className={`step-circle ${currentStep === 4 ? 'active' : ''}`}>
              4
            </div>
            <span className={`step-label ${currentStep === 4 ? 'active' : ''}`}>
              Review details
            </span>
          </div>
        </div>

        {/* STEPPER CONTENT CONTAINER: 2-Column Cisco Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          {/* Left Form Area (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* STEP 1: ORGANIZATION / BASIC DETAILS */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    Please enter candidate details
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your foundational identity and geographical location for recruiter matching.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="neu-input"
                      placeholder="e.g. Demuni Jayasmith"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Professional Headline
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="neu-input"
                      placeholder="AI Systems Engineer & Backend Architect"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Professional Summary / Bio
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="neu-input"
                    placeholder="Provide a concise summary of your engineering philosophy and core strengths..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Primary Location (City)
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="neu-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="neu-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Total Experience (Yrs)
                    </label>
                    <input
                      type="number"
                      value={totalYears}
                      onChange={(e) => setTotalYears(Number(e.target.value))}
                      className="neu-input"
                    />
                  </div>
                </div>

                {/* PostGIS Coordinates Presets */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex-between mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <MapPin size={13} className="text-red-500" />
                      <span>PostGIS Coordinates (For Radius Discovery)</span>
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setLatitude(6.9271);
                          setLongitude(79.8612);
                          setCity('Colombo');
                        }}
                        className="text-[10px] font-semibold text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200 hover:bg-blue-50"
                      >
                        Preset: Colombo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLatitude(7.2906);
                          setLongitude(80.6337);
                          setCity('Kandy');
                        }}
                        className="text-[10px] font-semibold text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200 hover:bg-blue-50"
                      >
                        Preset: Kandy
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      step="any"
                      value={latitude ?? ''}
                      onChange={(e) => setLatitude(Number(e.target.value))}
                      className="neu-input text-xs"
                      placeholder="Latitude (e.g. 6.9271)"
                    />
                    <input
                      type="number"
                      step="any"
                      value={longitude ?? ''}
                      onChange={(e) => setLongitude(Number(e.target.value))}
                      className="neu-input text-xs"
                      placeholder="Longitude (e.g. 79.8612)"
                    />
                  </div>
                </div>

                {/* Continue button */}
                <div className="flex justify-end pt-3">
                  <button onClick={handleSaveStep1} className="neu-btn neu-btn-primary">
                    <span>Continue</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SOLUTIONS PROFILE / FUNCTIONAL AREAS & SKILLS */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    Select your functional focus areas
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click to toggle key engineering domains (inspired by Cisco ROI functional areas).
                  </p>
                </div>

                {/* Cisco-Style Pill Grid */}
                <div className="flex flex-wrap gap-2.5">
                  {functionalOptions.map((opt) => {
                    const isSelected = selectedFunctionalAreas.includes(opt.id);
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => toggleFunctionalArea(opt.id)}
                        className={`toggle-pill ${isSelected ? 'selected' : ''}`}
                      >
                        <span>{opt.icon}</span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Skills Taxonomy Manager */}
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-blue-600" />
                    <span>Skills & Canonical Aliases</span>
                  </h4>
                  <form onSubmit={handleAddSkill} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="e.g. Python, FastAPI, Docker, PostgreSQL..."
                      className="neu-input text-xs"
                    />
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={newSkillYears}
                      onChange={(e) => setNewSkillYears(Number(e.target.value))}
                      className="neu-input text-xs w-20 text-center"
                      title="Years of experience"
                    />
                    <button type="submit" className="neu-btn neu-btn-primary !py-2 !px-4 text-xs shrink-0">
                      <Plus size={14} />
                      <span>Add Skill</span>
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2">
                    {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.map((s) => (
                        <span key={s.id} className="skill-badge text-xs">
                          <span className="font-bold">{s.normalized_name}</span>
                          {s.original_name !== s.normalized_name && (
                            <span className="text-[10px] text-slate-400">({s.original_name})</span>
                          )}
                          <span className="text-[10px] text-blue-600 font-bold">{s.years_experience}y</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(s.id)}
                            className="text-red-400 hover:text-red-600 ml-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
                    )}
                  </div>
                </div>

                <div className="flex-between pt-4">
                  <button onClick={() => setCurrentStep(1)} className="neu-btn neu-btn-secondary">
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                  <button onClick={() => setCurrentStep(3)} className="neu-btn neu-btn-primary">
                    <span>Next: Document Ingestion</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: RESUME UPLOAD (PDF / DOCX) */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    Document Ingestion & AI Pipeline
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Extract text via PyMuPDF (NO LLM) $\to$ Rule-based extraction $\to$ Gemini AI structured reconciliation.
                  </p>
                </div>

                {/* Drag & Drop Area */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="dropzone"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                  <UploadCloud size={44} className="text-blue-600 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-800">
                    {selectedFile ? selectedFile.name : 'Click to select or drag & drop resume file'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedFile
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                      : 'Supported formats: PDF, DOCX (Max 10MB)'}
                  </p>
                </div>

                {pipelineState && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3">
                    <RefreshCw size={18} className="animate-spin text-blue-600 shrink-0" />
                    <span className="text-xs font-semibold text-blue-800">{pipelineState}</span>
                  </div>
                )}

                <div className="flex-between pt-4">
                  <button onClick={() => setCurrentStep(2)} className="neu-btn neu-btn-secondary">
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleUploadResume}
                    disabled={!selectedFile || isUploading}
                    className="neu-btn neu-btn-primary"
                  >
                    <span>{isUploading ? 'Ingesting...' : 'Ingest & Reconcile with Gemini'}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW RECONCILED FACTS & CONFIRM */}
            {currentStep === 4 && extractionData && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex-between">
                  <div>
                    <span className="provenance-tag provenance-ai">
                      AI + Rule Reconciliation
                    </span>
                    <h3 className="text-base font-bold text-slate-900 font-heading mt-1">
                      Review Extracted Facts
                    </h3>
                    <p className="text-xs text-slate-600">
                      Edit any fields below before committing to authoritative PostgreSQL tables.
                    </p>
                  </div>
                  <button onClick={handleConfirmExtraction} className="neu-btn neu-btn-primary !py-2.5 !px-6 text-xs shadow-md">
                    <CheckCircle2 size={16} />
                    <span>Confirm & Persist Profile</span>
                  </button>
                </div>

                {/* Identity & Skills with Provenance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-400 font-semibold block mb-1">Extracted Candidate Name:</span>
                    <input
                      type="text"
                      value={extractionData.personal_information.full_name || ''}
                      onChange={(e) =>
                        setExtractionData({
                          ...extractionData,
                          personal_information: {
                            ...extractionData.personal_information,
                            full_name: e.target.value,
                          },
                        })
                      }
                      className="neu-input font-bold"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-400 font-semibold block mb-1">Extracted Email:</span>
                    <input
                      type="text"
                      value={extractionData.personal_information.email || ''}
                      onChange={(e) =>
                        setExtractionData({
                          ...extractionData,
                          personal_information: {
                            ...extractionData.personal_information,
                            email: e.target.value,
                          },
                        })
                      }
                      className="neu-input"
                    />
                  </div>
                </div>

                {/* Skills tags with Provenance Badges */}
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Extracted Skills (with Provenance)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {extractionData.skills.map((s, idx) => (
                      <span key={idx} className="skill-badge text-xs">
                        <span>{s.original_name}</span>
                        <span className={`provenance-tag ${s.source === 'rule_based' ? 'provenance-rule' : 'provenance-ai'}`}>
                          {s.source}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Guidance / About Column (Image 1 Cisco Inspiration) */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200">
              <h4 className="text-lg font-bold text-slate-900 font-heading mb-2">
                {currentStep === 1
                  ? 'About Organization'
                  : currentStep === 2
                  ? 'Solutions Profile'
                  : currentStep === 3
                  ? 'Document Ingestion'
                  : 'Review Details'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {currentStep === 1
                  ? 'Enter the basic contact, geographic coordinates, and seniority details to establish your searchable record.'
                  : currentStep === 2
                  ? 'Select your key functional engineering areas and specify your canonical technical proficiencies.'
                  : currentStep === 3
                  ? 'Upload your curriculum vitae. Plain text will be extracted safely without AI first, then analyzed by Gemini.'
                  : 'Verify the reconciled facts. Nothing becomes authoritative until you click Confirm & Persist.'}
              </p>

              {/* Minimal Line Illustration Placeholder */}
              <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-white border border-slate-200 shadow-sm flex-center text-blue-600 mb-2">
                  <Cpu size={36} />
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Dullnit Ingestion Engine
                </span>
              </div>
            </div>

            {/* Profile Completeness Meter */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex-between mb-2">
                <span className="text-xs font-bold text-slate-700">Profile Completeness</span>
                <span className="text-xs font-extrabold text-blue-600">
                  {profile?.completeness_score ?? 95}%
                </span>
              </div>
              <div className="meter-track">
                <div
                  className="meter-fill meter-fill-blue"
                  style={{ width: `${profile?.completeness_score ?? 95}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. "HENRY"-STYLE EXECUTIVE CANDIDATE PERSONA (Image 4 Inspiration) */}
      <div>
        <div className="flex-between mb-4 px-1">
          <div>
            <h3 className="text-xl font-black text-slate-900 font-heading">
              Executive Candidate Persona
            </h3>
            <p className="text-xs text-slate-500">
              Derived non-authoritative representation generated from your verified database facts.
            </p>
          </div>
          <button
            onClick={handleRegeneratePersona}
            className="neu-btn neu-btn-secondary !py-2 text-xs font-bold"
          >
            <RefreshCw size={13} />
            <span>Regenerate with Gemini</span>
          </button>
        </div>

        <CandidatePersonaCard
          persona={persona}
          candidateName={profile?.full_name || 'Demuni Jayasmith'}
          candidateLocation={profile?.location}
          totalYearsExp={profile?.total_years_experience || 4}
          onRegenerate={handleRegeneratePersona}
        />
      </div>
    </div>
  );
};
