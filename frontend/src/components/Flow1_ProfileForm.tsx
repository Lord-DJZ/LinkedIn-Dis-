import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ResumeExtractionResult } from '../types';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Loader2,
  Sparkles,
  FileText,
  Briefcase,
  GraduationCap,
  Trash2,
} from 'lucide-react';

interface Flow1Props {
  onProfileSaved: () => void;
}

interface WorkRole {
  title: string;
  company: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

interface EducationItem {
  institution: string;
  degree: string;
  field_of_study?: string;
  year?: string;
}

// ───────── Section Card Component (Matches Screenshot 1 & INSPIRE.TXT) ─────────
function SectionCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="mb-5 rounded-[22px] border border-black/[0.07] bg-white p-6 shadow-[0_10px_35px_-28px_rgba(24,35,25,0.35)] transition-all hover:border-black/[0.12] sm:p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900 tracking-tight">{title}</h2>
          <p className="text-xs text-black/50 mt-1">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export const Flow1_ProfileForm: React.FC<Flow1Props> = ({ onProfileSaved }) => {
  // Form State (matching INSPIRE.TXT & Screenshot 1)
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');

  // Location
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  // Career Details
  const [totalYears, setTotalYears] = useState<number>(0);
  const [primaryProfession, setPrimaryProfession] = useState('');
  const [seniorityLevel, setSeniorityLevel] = useState('Junior');
  const [availability, setAvailability] = useState<'Available Now' | 'Open to Offers' | 'Unavailable'>('Available Now');
  const [desiredSalary, setDesiredSalary] = useState('');
  const [currency, setCurrency] = useState('USD');

  // Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillDraft, setNewSkillDraft] = useState('');

  // Work History
  const [workHistory, setWorkHistory] = useState<WorkRole[]>([]);

  // Education
  const [education, setEducation] = useState<EducationItem[]>([]);

  // Resume Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineMessage, setPipelineMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load existing profile if any
  useEffect(() => {
    (async () => {
      try {
        await api.ensureCandidateAuth();
        const existing = await api.getMyProfile();
        if (existing) {
          if (existing.full_name) setFullName(existing.full_name);
          if (existing.headline) setHeadline(existing.headline);
          if (existing.bio) setBio(existing.bio);
          if (existing.total_years_experience !== undefined) setTotalYears(existing.total_years_experience);
          if (existing.location) {
            if (existing.location.city) setCity(existing.location.city);
            if (existing.location.country) setCountry(existing.location.country);
            if (existing.location.latitude) setLatitude(existing.location.latitude);
            if (existing.location.longitude) setLongitude(existing.location.longitude);
          }
          if (existing.skills && existing.skills.length > 0) {
            setSkills(existing.skills.map((s: any) => s.normalized_name || s.original_name));
          }
        }
      } catch {
        // guest state
      }
    })();
  }, []);

  // Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    const isImg = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name);
    setPipelineMessage(
      isImg
        ? 'Gemini Multimodal Vision analyzing CV image & extracting facts...'
        : 'Reading document with PyMuPDF / python-docx...'
    );

    try {
      await api.ensureCandidateAuth();
      const uploadRes = await api.uploadResume(file);
      setPipelineMessage('Gemini 2.5 Flash reconciling candidate dossier...');
      
      const reviewRes = await api.getExtractionReview(uploadRes.id);
      const data: ResumeExtractionResult = reviewRes.reconciled_data;

      // Auto-populate form fields from extraction
      if (data.personal_information?.full_name) setFullName(data.personal_information.full_name);
      if (data.professional_information?.headline) setHeadline(data.professional_information.headline);
      if (data.professional_information?.professional_summary) setBio(data.professional_information.professional_summary);
      if (data.personal_information?.city) setCity(data.personal_information.city);
      if (data.personal_information?.country) setCountry(data.personal_information.country);
      if (data.professional_information?.estimated_total_experience_years) {
        setTotalYears(data.professional_information.estimated_total_experience_years);
      }
      if (data.professional_information?.current_title) {
        setPrimaryProfession(data.professional_information.current_title);
      }
      if (data.skills?.length) {
        const extractedSkills = data.skills.map(s => s.original_name);
        setSkills(prev => Array.from(new Set([...prev, ...extractedSkills])));
      }
      if (data.experience?.length) {
        setWorkHistory(data.experience.map(w => ({
          title: w.original_job_title || 'Software Engineer',
          company: w.company || 'Organization',
          start_date: w.start_date || '2022',
          end_date: w.end_date || 'Present',
          description: w.description || '',
        })));
      }
      if (data.education?.length) {
        setEducation(data.education.map(ed => ({
          institution: ed.institution || 'University',
          degree: ed.original_degree || 'Degree',
          field_of_study: ed.field_of_study || '',
          year: ed.end_date ? String(ed.end_date) : '',
        })));
      }

      setPipelineMessage('Extraction completed! All fields populated from your CV.');
      setTimeout(() => setPipelineMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Extraction failed. You can still enter your details manually.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Skill Tags
  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newSkillDraft.trim();
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
      setNewSkillDraft('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Work History Add/Remove
  const handleAddRole = () => {
    setWorkHistory([
      ...workHistory,
      { title: '', company: '', start_date: '', end_date: '', description: '' },
    ]);
  };

  const handleRemoveRole = (idx: number) => {
    setWorkHistory(workHistory.filter((_, i) => i !== idx));
  };

  const handleUpdateRole = (idx: number, field: keyof WorkRole, val: string) => {
    const updated = [...workHistory];
    updated[idx] = { ...updated[idx], [field]: val };
    setWorkHistory(updated);
  };

  // Education Add/Remove
  const handleAddEducation = () => {
    setEducation([
      ...education,
      { institution: '', degree: '', field_of_study: '', year: '' },
    ]);
  };

  const handleRemoveEducation = (idx: number) => {
    setEducation(education.filter((_, i) => i !== idx));
  };

  const handleUpdateEducation = (idx: number, field: keyof EducationItem, val: string) => {
    const updated = [...education];
    updated[idx] = { ...updated[idx], [field]: val };
    setEducation(updated);
  };

  // Save Profile Handler
  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);

    try {
      await api.ensureCandidateAuth();
      await api.updateProfile({
        full_name: fullName,
        headline,
        bio,
        total_years_experience: totalYears,
        availability_status: availability,
        profile_visibility: 'Public',
      });

      await api.setLocation({
        city,
        country,
        latitude: Number(latitude),
        longitude: Number(longitude),
      });

      for (const skill of skills) {
        try {
          await api.addSkill(skill);
        } catch {
          // ignore duplicate
        }
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onProfileSaved();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#f5f7f4] px-4 py-10 font-sans text-[#171917] antialiased sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto w-full max-w-4xl">
        
        {/* ── BREADCRUMBS & PAGE HEADING (Exact Match to Screenshot 1) ── */}
        <div className="mb-8">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#738075]">
            Profile setup
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-[#151815] sm:text-[40px]">
            Build your candidate profile
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">
            Fill in the sections below. Everything you add feeds your AI dossier and helps recruiters find you.
          </p>
        </div>

        {/* ── FEEDBACK ALERTS ── */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Profile successfully updated! Opening your candidate dossier...</span>
          </div>
        )}

        {/* ── SECTION 1: PERSONAL IDENTITY (Exact Match to Screenshot 1) ── */}
        <SectionCard
          title="Personal Identity"
          subtitle="Who you are and how you present yourself."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-black/60 mb-1.5">
                NAME *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Marie Lawson"
                className="w-full bg-white border border-black/15 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-black/60 mb-1.5">
                HEADLINE
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Product Designer"
                className="w-full bg-white border border-black/15 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-black/60 mb-1.5">
                BIO
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="A short paragraph about your background and what you're looking for."
                className="w-full bg-white border border-black/15 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition resize-y"
              />
            </div>
          </div>
        </SectionCard>

        {/* ── SECTION 2: LOCATION (Exact Match to Screenshot 1) ── */}
        <SectionCard
          title="Location"
          subtitle="Where you're based — used for proximity matching."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-black/60 mb-1.5">
                CITY
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="London"
                className="w-full bg-white border border-black/15 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-black/60 mb-1.5">
                COUNTRY
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="United Kingdom"
                className="w-full bg-white border border-black/15 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-black/60 mb-1.5">
                LATITUDE
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                placeholder="51.5074"
                className="w-full bg-white border border-black/15 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-black/60 mb-1.5">
                LONGITUDE
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                placeholder="-0.1278"
                className="w-full bg-white border border-black/15 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
              />
            </div>
          </div>
        </SectionCard>

        {/* ── SECTION 3: CAREER DETAILS ── */}
        <SectionCard
          title="Career Details"
          subtitle="Experience level, domain, and availability status."
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-black/60 mb-1.5">
                TOTAL EXPERIENCE (YEARS)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={totalYears}
                onChange={(e) => setTotalYears(parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-black/15 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-black/60 mb-1.5">
                PRIMARY PROFESSION
              </label>
              <input
                type="text"
                value={primaryProfession}
                onChange={(e) => setPrimaryProfession(e.target.value)}
                placeholder="Software Engineering"
                className="w-full bg-white border border-black/15 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-black/60 mb-1.5">
                SENIORITY LEVEL
              </label>
              <select
                value={seniorityLevel}
                onChange={(e) => setSeniorityLevel(e.target.value)}
                className="w-full bg-white border border-black/15 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition cursor-pointer"
              >
                <option value="Junior">Junior (0-2 yrs)</option>
                <option value="Mid">Mid-Level (3-5 yrs)</option>
                <option value="Senior">Senior (5-8 yrs)</option>
                <option value="Lead">Lead / Principal (8+ yrs)</option>
                <option value="Executive">Executive / Director</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-black/60 mb-1.5">
                AVAILABILITY STATUS
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as any)}
                className="w-full bg-white border border-black/15 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition cursor-pointer"
              >
                <option value="Available Now">Available Now</option>
                <option value="Open to Offers">Open to Offers</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-black/60 mb-1.5">
                DESIRED SALARY
              </label>
              <input
                type="text"
                value={desiredSalary}
                onChange={(e) => setDesiredSalary(e.target.value)}
                placeholder="e.g. 95,000"
                className="w-full bg-white border border-black/15 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-black/60 mb-1.5">
                CURRENCY
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-white border border-black/15 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition cursor-pointer"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="LKR">LKR (Rs)</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {/* ── SECTION 4: SKILLS ── */}
        <SectionCard
          title="Skills"
          subtitle="Add the skills you want to be found for."
        >
          {skills.length === 0 ? (
            <p className="text-xs text-black/40 italic mb-4">No skills added yet. Type a skill and press Enter or upload your CV below.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 bg-gray-100 border border-black/10 text-gray-800 text-xs font-medium px-3.5 py-1.5 rounded-full"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-gray-400 hover:text-black transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input
              type="text"
              value={newSkillDraft}
              onChange={(e) => setNewSkillDraft(e.target.value)}
              placeholder="Add skill (e.g. Python, Docker, Next.js, PyTorch)"
              className="flex-1 bg-white border border-black/15 rounded-lg px-3.5 py-2 text-sm text-gray-900 placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
            />
            <button
              type="submit"
              className="bg-black text-white hover:bg-gray-800 px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </form>
        </SectionCard>

        {/* ── SECTION 5: WORK HISTORY ── */}
        <SectionCard
          title="Work History"
          subtitle="Recent roles — add as many as you need."
          action={
            <button
              type="button"
              onClick={handleAddRole}
              className="text-xs font-semibold text-black hover:text-gray-600 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Role
            </button>
          }
        >
          <div className="space-y-4">
            {workHistory.length === 0 ? (
              <div className="py-7 text-center border-2 border-dashed border-black/10 rounded-xl bg-[#fafafa]">
                <Briefcase className="w-6 h-6 text-black/30 mx-auto mb-2" />
                <p className="text-xs font-medium text-black/50">No professional roles added yet.</p>
                <p className="text-[11px] text-black/35 mt-0.5">Upload your CV below to auto-populate or click "+ Add Role".</p>
              </div>
            ) : (
              workHistory.map((role, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-black/5 space-y-3 relative group">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-gray-500" /> Position #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(idx)}
                      className="text-red-500 hover:text-red-700 text-xs transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={role.title}
                      onChange={(e) => handleUpdateRole(idx, 'title', e.target.value)}
                      placeholder="Job Title (e.g. Lead Fullstack Engineer)"
                      className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs text-gray-900"
                    />
                    <input
                      type="text"
                      value={role.company}
                      onChange={(e) => handleUpdateRole(idx, 'company', e.target.value)}
                      placeholder="Company Name"
                      className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs text-gray-900"
                    />
                  </div>

                  <textarea
                    value={role.description}
                    onChange={(e) => handleUpdateRole(idx, 'description', e.target.value)}
                    rows={2}
                    placeholder="Key contributions and technologies used..."
                    className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs text-gray-900"
                  />
                </div>
              ))
            )}
          </div>
        </SectionCard>

        {/* ── SECTION 6: EDUCATION ── */}
        <SectionCard
          title="Education"
          subtitle="Degrees, diplomas, and academic qualifications."
          action={
            <button
              type="button"
              onClick={handleAddEducation}
              className="text-xs font-semibold text-black hover:text-gray-600 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Qualification
            </button>
          }
        >
          <div className="space-y-4">
            {education.length === 0 ? (
              <div className="py-7 text-center border-2 border-dashed border-black/10 rounded-xl bg-[#fafafa]">
                <GraduationCap className="w-6 h-6 text-black/30 mx-auto mb-2" />
                <p className="text-xs font-medium text-black/50">No academic qualifications added yet.</p>
                <p className="text-[11px] text-black/35 mt-0.5">Upload your CV below to auto-populate or click "+ Add Qualification".</p>
              </div>
            ) : (
              education.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-black/5 space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-gray-500" /> Academic Entry #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="text-red-500 hover:text-red-700 text-xs transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={item.institution}
                      onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)}
                      placeholder="Institution / University"
                      className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs text-gray-900"
                    />
                    <input
                      type="text"
                      value={item.degree}
                      onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                      placeholder="Degree / Diploma"
                      className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs text-gray-900"
                    />
                    <input
                      type="text"
                      value={item.year}
                      onChange={(e) => handleUpdateEducation(idx, 'year', e.target.value)}
                      placeholder="Year (e.g. 2024)"
                      className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs text-gray-900"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        {/* ── SECTION 7: CV UPLOAD BUTTON & DROPZONE (At End of Profile Form as Requested!) ── */}
        <SectionCard
          title="Upload CV / Resume (Alternative Fast-Track)"
          subtitle="Either type your details above or upload your CV here. Our Gemini AI engine parses your document and fills out your profile and dossier automatically."
        >
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all ${
              dragActive
                ? 'border-black bg-gray-50/80 scale-[1.01]'
                : 'border-black/15 hover:border-black/30 bg-[#fafafa]'
            }`}
          >
            <input
              id="resume-file-input"
              type="file"
              accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            <label htmlFor="resume-file-input" className="cursor-pointer block select-none">
              <div className="w-14 h-14 rounded-2xl bg-white border border-black/10 flex items-center justify-center mx-auto mb-3.5 shadow-xs text-gray-800 hover:scale-105 transition-transform">
                {isProcessing ? (
                  <Loader2 className="w-6 h-6 animate-spin text-black" />
                ) : (
                  <UploadCloud className="w-6 h-6 text-black" />
                )}
              </div>
              <p className="text-sm font-bold text-gray-900">
                {selectedFile ? selectedFile.name : 'Click to select or drag & drop your CV file'}
              </p>
              <p className="text-xs text-black/50 mt-1 max-w-sm mx-auto">
                Supported formats: PDF, Word (.docx), and Images / PNG / JPG (.png, .jpg, .webp) — Max 10MB
              </p>
            </label>

            {pipelineMessage && (
              <div className="mt-4 inline-flex items-center gap-2 bg-black text-white text-xs px-4 py-2 rounded-full font-medium shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{pipelineMessage}</span>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── BOTTOM ACTION BAR (Matching INSPIRE.TXT) ── */}
        <div className="mt-10 flex items-center justify-end gap-4 border-t border-black/10 pt-6 pb-16">
          <label
            htmlFor="resume-file-input"
            className="rounded-full border border-black/15 px-6 py-3 text-xs font-semibold hover:bg-black/5 transition cursor-pointer flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Upload CV File</span>
          </label>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveProfile}
            className="rounded-full bg-black hover:bg-gray-800 active:scale-95 text-white px-8 py-3 text-xs font-semibold shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Save & Update Dossier</span>
          </button>
        </div>

      </div>
    </div>
  );
};
