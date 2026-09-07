import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import type { ResumeExtractionResult } from '../types';
import {
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Loader2,
  Sparkles,
  Briefcase,
  GraduationCap,
  Trash2,
  Camera,
  ChevronDown,
  ChevronUp,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link2,
  List,
  ListOrdered,
  Undo,
  Redo,
  Edit2,
  Lightbulb,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';

interface Flow1Props {
  onProfileSaved: () => void;
}

interface WorkRole {
  title: string;
  company: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
  collapsed?: boolean;
}

interface EducationItem {
  institution: string;
  degree: string;
  field_of_study?: string;
  year?: string;
}

type WizardStep = 'choice' | 'contacts' | 'experience' | 'education' | 'skills' | 'summary' | 'finalize';

export const Flow1_ProfileForm: React.FC<Flow1Props> = ({ onProfileSaved }) => {
  // Current view step: starts at 'choice' (Image 1 match)
  const [currentStep, setCurrentStep] = useState<WizardStep>('choice');
  const [selectedChoice, setSelectedChoice] = useState<'upload' | 'create'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step tips accordion state
  const [showTips, setShowTips] = useState(false);

  // Identity & Contact details
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  // Gender selection using Image 4 rectangular buttons
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');

  // Location
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  // Experience (Image 2 match)
  const [workHistory, setWorkHistory] = useState<WorkRole[]>([]);

  // Education
  const [education, setEducation] = useState<EducationItem[]>([]);

  // Skills & Tech Stack (Image 3 revision + Image 4 rectangular button style)
  // Must start completely empty until user adds items ("nothing is there just only when we are going to edit at there it is going to be there")
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillDraft, setNewSkillDraft] = useState('');

  // Summary & Photo & Availability
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [totalYears, setTotalYears] = useState<number>(0);
  const [availability, setAvailability] = useState<'Available Now' | 'Open to Offers' | 'Unavailable'>('Available Now');
  const [desiredSalary, setDesiredSalary] = useState('');

  // Upload & Extraction State
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineMessage, setPipelineMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Load existing profile on mount
  useEffect(() => {
    (async () => {
      try {
        await api.ensureCandidateAuth();
        const existing = await api.getMyProfile();
        if (existing) {
          if (existing.full_name) setFullName(existing.full_name);
          if (existing.headline) setHeadline(existing.headline);
          if (existing.bio) setBio(existing.bio);
          if (existing.avatar_url) setAvatarUrl(existing.avatar_url);
          if (existing.phone) setPhone(existing.phone);
          if (existing.date_of_birth) setDateOfBirth(existing.date_of_birth);
          if (existing.gender) setGender(existing.gender as any);
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
          if (existing.experiences && existing.experiences.length > 0) {
            setWorkHistory(
              existing.experiences.map((e: any) => ({
                title: e.original_job_title || (e as any).title || '',
                company: e.company,
                location: (e as any).location || '',
                start_date: e.start_date || '',
                end_date: e.end_date || '',
                is_current: e.is_current || false,
                description: e.description || '',
                collapsed: false,
              }))
            );
          }
          if (existing.education && existing.education.length > 0) {
            setEducation(
              existing.education.map((ed: any) => ({
                institution: ed.institution,
                degree: ed.original_degree || ed.normalized_degree_type || '',
                field_of_study: ed.field_of_study || '',
                year: ed.end_date ? String(ed.end_date) : '',
              }))
            );
          }
        }
      } catch {
        // guest state
      }
    })();
  }, []);

  // ── Drag & Drop Handlers for "I already have a resume" ──
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
    setIsProcessing(true);
    const isImg = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name);

    if (isImg) {
      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);
    }

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

      // Auto-populate extracted data
      if (data.personal_information?.full_name) setFullName(data.personal_information.full_name);
      if (data.professional_information?.headline) setHeadline(data.professional_information.headline);
      if (data.professional_information?.professional_summary) setBio(data.professional_information.professional_summary);
      if (data.personal_information?.city) setCity(data.personal_information.city);
      if (data.personal_information?.country) setCountry(data.personal_information.country);
      if (data.personal_information?.phone) setPhone(data.personal_information.phone);
      if ((data.personal_information as any)?.date_of_birth) setDateOfBirth((data.personal_information as any).date_of_birth);
      if ((data.personal_information as any)?.gender) setGender((data.personal_information as any).gender);
      if ((data.personal_information as any)?.avatar_url) setAvatarUrl((data.personal_information as any).avatar_url);

      if (data.professional_information?.estimated_total_experience_years) {
        setTotalYears(data.professional_information.estimated_total_experience_years);
      }
      if (data.professional_information?.current_title && !headline) {
        setHeadline(data.professional_information.current_title);
      }
      if (data.skills?.length) {
        const extractedSkills = data.skills.map((s) => s.original_name);
        setSkills((prev) => Array.from(new Set([...prev, ...extractedSkills])));
      }
      if (data.experience?.length) {
        setWorkHistory(
          data.experience.map((w) => ({
            title: w.original_job_title || 'Software Engineer',
            company: w.company || 'Organization',
            location: '',
            start_date: w.start_date || '2022',
            end_date: w.end_date || 'Present',
            is_current: !w.end_date || w.end_date.toLowerCase().includes('present'),
            description: w.description || '',
            collapsed: false,
          }))
        );
      }
      if (data.education?.length) {
        setEducation(
          data.education.map((ed) => ({
            institution: ed.institution || 'University',
            degree: ed.original_degree || 'Degree',
            field_of_study: ed.field_of_study || '',
            year: ed.end_date ? String(ed.end_date) : '',
          }))
        );
      }

      setPipelineMessage('Extraction completed! All details populated.');
      setTimeout(() => {
        setPipelineMessage(null);
        // Advance to step 1 (Contacts) of progressive wizard so candidate can review each step
        setCurrentStep('contacts');
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Extraction failed. You can still fill details step-by-step.');
      setCurrentStep('contacts');
    } finally {
      setIsProcessing(false);
    }
  };

  // Avatar Upload
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);
    }
  };

  // ── Work Experience Operations ──
  const handleAddRole = () => {
    setWorkHistory([
      ...workHistory,
      {
        title: '',
        company: '',
        location: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: '',
        collapsed: false,
      },
    ]);
  };

  const handleRemoveRole = (idx: number) => {
    setWorkHistory(workHistory.filter((_, i) => i !== idx));
  };

  const handleUpdateRole = (idx: number, field: keyof WorkRole, val: any) => {
    const updated = [...workHistory];
    updated[idx] = { ...updated[idx], [field]: val };
    setWorkHistory(updated);
  };

  const toggleCollapseRole = (idx: number) => {
    const updated = [...workHistory];
    updated[idx] = { ...updated[idx], collapsed: !updated[idx].collapsed };
    setWorkHistory(updated);
  };

  // ── AI Helper to Generate Bullet Points ──
  const handleGenerateExperienceBullets = (idx: number) => {
    const role = workHistory[idx];
    const roleTitle = role.title.trim() || 'Software Engineer';
    const comp = role.company.trim() || 'Engineering Org';

    setIsAiGenerating(true);
    setTimeout(() => {
      const sampleBullets = [
        `• Designed and deployed scalable high-availability services at ${comp}, reducing p99 latency by 35%.`,
        `• Spearheaded cross-functional architectural initiatives for ${roleTitle} responsibilities, boosting reliability.`,
        `• Collaborated with product and infrastructure teams to automate deployment workflows, cutting turnaround time in half.`,
      ].join('\n');

      handleUpdateRole(idx, 'description', role.description ? `${role.description}\n${sampleBullets}` : sampleBullets);
      setIsAiGenerating(false);
    }, 600);
  };

  // ── AI Helper to Generate Summary ──
  const handleGenerateSummary = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const titleStr = headline || 'Software Engineer';
      const skillSnippet = skills.slice(0, 3).join(', ') || 'modern engineering';
      const generated = `Accomplished ${titleStr} with a strong track record of engineering robust systems and driving scalable technical solutions. Skilled in ${skillSnippet}, with deep focus on reliability, pragmatic problem-solving, and continuous technical improvement.`;
      setBio(generated);
      setIsAiGenerating(false);
    }, 600);
  };

  // ── Education Operations ──
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

  // ── Skills Operations (Image 3 revision + Image 4 rectangular button design) ──
  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newSkillDraft.trim();
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
      setNewSkillDraft('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // ── Save Profile Handler (Persists state to backend) ──
  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      setErrorMessage('Please provide your Full Name in Contact Information.');
      setCurrentStep('contacts');
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);

    const statusMap: Record<string, string> = {
      'Available Now': 'available',
      'Open to Offers': 'open',
      Unavailable: 'not_looking',
    };

    try {
      await api.ensureCandidateAuth();
      await api.updateProfile({
        full_name: fullName,
        headline,
        bio,
        avatar_url: avatarUrl || undefined,
        phone: phone || undefined,
        date_of_birth: dateOfBirth || undefined,
        gender: gender || undefined,
        total_years_experience: totalYears,
        availability_status: statusMap[availability] || 'available',
        profile_visibility: 'public',
      });

      await api.setLocation({
        city,
        country,
        latitude: Number(latitude),
        longitude: Number(longitude),
      });

      // Persist skills
      for (const skill of skills) {
        try {
          await api.addSkill(skill);
        } catch {
          // ignore duplicate
        }
      }

      // Persist experience
      for (const exp of workHistory) {
        if (exp.company && exp.title) {
          try {
            await api.addExperience({
              company: exp.company,
              original_job_title: exp.title,
              location: exp.location,
              start_date: exp.start_date,
              end_date: exp.is_current ? 'Present' : exp.end_date,
              is_current: exp.is_current,
              description: exp.description,
            });
          } catch {
            // ignore duplicate
          }
        }
      }

      // Persist education
      for (const edu of education) {
        if (edu.institution && edu.degree) {
          try {
            await api.addEducation({
              institution: edu.institution,
              original_degree: edu.degree,
              field_of_study: edu.field_of_study,
              end_date: edu.year,
            });
          } catch {
            // ignore duplicate
          }
        }
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onProfileSaved();
      }, 900);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // Step definition sequence
  const stepsList: { key: WizardStep; label: string; index: number }[] = [
    { key: 'contacts', label: 'Contacts', index: 1 },
    { key: 'experience', label: 'Experience', index: 2 },
    { key: 'education', label: 'Education', index: 3 },
    { key: 'skills', label: 'Skills', index: 4 },
    { key: 'summary', label: 'Summary', index: 5 },
    { key: 'finalize', label: 'Finalize', index: 6 },
  ];

  const currentStepObj = stepsList.find((s) => s.key === currentStep);
  const currentStepIndex = currentStepObj ? currentStepObj.index : 0;

  const goToNextStep = () => {
    if (currentStep === 'contacts') setCurrentStep('experience');
    else if (currentStep === 'experience') setCurrentStep('education');
    else if (currentStep === 'education') setCurrentStep('skills');
    else if (currentStep === 'skills') setCurrentStep('summary');
    else if (currentStep === 'summary') setCurrentStep('finalize');
    else if (currentStep === 'finalize') handleSaveProfile();
  };

  const goToPrevStep = () => {
    if (currentStep === 'contacts') setCurrentStep('choice');
    else if (currentStep === 'experience') setCurrentStep('contacts');
    else if (currentStep === 'education') setCurrentStep('experience');
    else if (currentStep === 'skills') setCurrentStep('education');
    else if (currentStep === 'summary') setCurrentStep('skills');
    else if (currentStep === 'finalize') setCurrentStep('summary');
  };

  const getNextButtonLabel = () => {
    switch (currentStep) {
      case 'contacts':
        return 'Next: Experience';
      case 'experience':
        return 'Next: Education';
      case 'education':
        return 'Next: Skills';
      case 'skills':
        return 'Next: Summary';
      case 'summary':
        return 'Next: Finalize';
      case 'finalize':
        return 'Save & Publish Dossier';
      default:
        return 'Next';
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN 0: RESUME INPUT SELECTION (EXACT MATCH TO SOLID BLUE REFERENCE)
  // ═══════════════════════════════════════════════════════════════════════════
  if (currentStep === 'choice') {
    const handleContinueChoice = () => {
      if (selectedChoice === 'upload') {
        fileInputRef.current?.click();
      } else {
        setCurrentStep('contacts');
      }
    };

    return (
      <div className="fixed inset-0 z-30 bg-[#1E70F9] flex flex-col items-center justify-start sm:justify-center p-4 pt-24 sm:pt-20 pb-8 sm:pb-12 font-sans antialiased text-[#111827] overflow-y-auto select-none">
        {/* Hidden File Input for Resume Upload */}
        <input
          id="choice-resume-file-input"
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        {/* Floating Large Centered Pure White Card (No borders, soft shadow only) */}
        <div className="w-full max-w-[820px] sm:max-w-[880px] md:max-w-[920px] bg-white rounded-[28px] sm:rounded-[36px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.22),0_10px_25px_-10px_rgba(0,0,0,0.12)] border-0 py-12 sm:py-16 md:py-20 px-6 sm:px-14 md:px-16 flex flex-col items-center text-center transition-all my-auto">
          
          {/* Header Title */}
          <h1 className="text-[28px] sm:text-[34px] md:text-[38px] font-bold text-[#111827] tracking-tight font-sans">
            Input your resume
          </h1>

          {/* Subtitle */}
          <p className="text-[14px] sm:text-[15.5px] text-[#94A3B8] font-normal mt-2.5 sm:mt-3 mb-8 sm:mb-12">
            Choose how you want to get started.
          </p>

          {/* Status / Processing Feedback */}
          {isProcessing && (
            <div className="mb-6 p-3.5 px-5 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-2.5 text-xs font-semibold text-[#1D4ED8] animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-[#1E70F9]" />
              <span>{pipelineMessage || 'Processing resume file...'}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-3.5 px-5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Selection Option Cards (Two Compact Boxes) */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 w-full mb-8 sm:mb-12">
            
            {/* Option 1: Upload Resume */}
            <div
              id="option-upload-resume"
              role="button"
              tabIndex={0}
              onClick={() => setSelectedChoice('upload')}
              onDoubleClick={() => {
                setSelectedChoice('upload');
                fileInputRef.current?.click();
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => {
                setSelectedChoice('upload');
                handleDrop(e);
              }}
              className={`w-[145px] h-[142px] sm:w-[162px] sm:h-[158px] rounded-[20px] sm:rounded-[24px] flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all select-none ${
                dragActive
                  ? 'border-2 border-[#1E70F9] bg-blue-100/60 ring-4 ring-blue-100 shadow-sm'
                  : selectedChoice === 'upload'
                  ? 'border-[1.5px] sm:border-2 border-[#1E70F9] bg-[#F0F7FF] shadow-xs'
                  : 'border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] shadow-2xs'
              }`}
            >
              {/* Monochrome Black/Slate Document Upload Icon */}
              <div className="mb-2.5 sm:mb-3 text-[#1E293B]">
                <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 sm:w-8 sm:h-8">
                  <path
                    d="M6 3.5C6 2.67 6.67 2 7.5 2H17.5L23 7.5V24.5C23 25.33 22.33 26 21.5 26H7.5C6.67 26 6 25.33 6 24.5V3.5Z"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17.5 2V8H23"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14.5 20.5V13M14.5 13L10.5 17M14.5 13L18.5 17"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <span className="text-[13.5px] sm:text-[14.5px] font-semibold text-[#1E293B] leading-tight">
                Upload Resume
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#94A3B8] mt-1 leading-tight max-w-[125px]">
                Upload your existing resume
              </span>
            </div>

            {/* Option 2: Create Resume */}
            <div
              id="option-create-resume"
              role="button"
              tabIndex={0}
              onClick={() => setSelectedChoice('create')}
              onDoubleClick={() => setCurrentStep('contacts')}
              className={`w-[145px] h-[142px] sm:w-[162px] sm:h-[158px] rounded-[20px] sm:rounded-[24px] flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all select-none ${
                selectedChoice === 'create'
                  ? 'border-[1.5px] sm:border-2 border-[#1E70F9] bg-[#F0F7FF] shadow-xs'
                  : 'border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] shadow-2xs'
              }`}
            >
              {/* Monochrome Black/Slate Document Edit Icon */}
              <div className="mb-2.5 sm:mb-3 text-[#1E293B]">
                <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 sm:w-8 sm:h-8">
                  <path
                    d="M18 13.5V4C18 3.17 17.33 2.5 16.5 2.5H6.5C5.67 2.5 5 3.17 5 4V24C5 24.83 5.67 25.5 6.5 25.5H12"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M8.5 8.5H14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M8.5 12.5H12.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M8.5 16.5H11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  <path
                    d="M14 22.5L13 24.5L15 23.5L22 16.5C22.4 16.1 22.4 15.5 22 15.1L20.4 13.5C20 13.1 19.4 13.1 19 13.5L14 18.5V22.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <span className="text-[13.5px] sm:text-[14.5px] font-semibold text-[#1E293B] leading-tight">
                Create Resume
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#94A3B8] mt-1 leading-tight max-w-[125px]">
                Build your resume step by step
              </span>
            </div>

          </div>

          {/* Continue Pill Button (Exact same blue color as background) */}
          <button
            id="choice-btn-continue"
            type="button"
            onClick={handleContinueChoice}
            disabled={isProcessing}
            className="h-[48px] sm:h-[50px] px-12 sm:px-14 rounded-full bg-[#1E70F9] hover:bg-[#165FD8] text-white font-medium text-[15px] sm:text-[15.5px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Continue</span>
            )}
          </button>

        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PROGRESSIVE STEP-BY-STEP CENTERED WIZARD (IMAGES 2, 3, 4 MATCH)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#FAF7F2] py-8 sm:py-10 px-4 sm:px-6 font-sans text-[#141413] antialiased">
      <div className="max-w-3xl mx-auto">

        {/* ── TOP STEPPER PROGRESS BAR (IMAGE 2 MATCH) ── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setCurrentStep('choice')}
              className="text-xs font-semibold text-[#64748B] hover:text-[#141413] flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Choose Method
            </button>
            <span className="text-xs font-bold text-[#64748B]">
              Step {currentStepIndex} of 6
            </span>
          </div>

          {/* Stepper Track Line with Nodes */}
          <div className="relative flex items-center justify-between mt-4">
            {/* Connecting Track Line */}
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#E2E8F0] -translate-y-1/2 z-0" />
            
            {/* Active Progress Fill Line */}
            <div
              className="absolute top-1/2 left-0 h-[2px] bg-[#0091FF] -translate-y-1/2 z-0 transition-all duration-300"
              style={{
                width: `${((currentStepIndex - 1) / (stepsList.length - 1)) * 100}%`,
              }}
            />

            {/* Step Nodes */}
            {stepsList.map((step) => {
              const isActive = step.key === currentStep;
              const isPast = step.index < currentStepIndex;

              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => setCurrentStep(step.key)}
                  className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                >
                  <span
                    className={`text-[11px] sm:text-xs font-bold mb-2 transition-colors ${
                      isActive
                        ? 'text-[#0091FF]'
                        : isPast
                        ? 'text-[#1E293B]'
                        : 'text-[#94A3B8]'
                    }`}
                  >
                    {step.label}
                  </span>
                  
                  {/* Circle Indicator */}
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'border-2 border-[#0091FF] bg-white ring-4 ring-[#0091FF]/20 scale-110'
                        : isPast
                        ? 'bg-[#0091FF] text-white'
                        : 'border-2 border-[#CBD5E1] bg-white'
                    }`}
                  >
                    {isPast && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    {isActive && <div className="w-2 h-2 rounded-full bg-[#0091FF]"></div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── STEP HEADER: TITLE + EDIT PENCIL + TIPS PILL ── */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E293B] font-serif">
                {currentStep === 'contacts' && 'Contacts'}
                {currentStep === 'experience' && 'Experience'}
                {currentStep === 'education' && 'Education'}
                {currentStep === 'skills' && 'Skills'}
                {currentStep === 'summary' && 'Summary'}
                {currentStep === 'finalize' && 'Finalize'}
              </h1>
              <Edit2 className="w-4 h-4 text-[#94A3B8]" />
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              {currentStep === 'contacts' && 'Enter your contact details so employers and recruiters can reach you.'}
              {currentStep === 'experience' && 'List your work experience starting with the most recent position first.'}
              {currentStep === 'education' && 'List your degrees, academic achievements, and formal education.'}
              {currentStep === 'skills' && 'Add your technical stack, languages, and proficiencies below.'}
              {currentStep === 'summary' && 'A concise summary of your technical depth, identity, and career goals.'}
              {currentStep === 'finalize' && 'Review your verified dossier before publishing for recruiter discovery.'}
            </p>
          </div>

          {/* Tips Pill (Image 2 match: 💡 Experience tips ⌵) */}
          <button
            type="button"
            onClick={() => setShowTips(!showTips)}
            className="shrink-0 inline-flex items-center gap-1.5 bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>
              {currentStep === 'experience' && 'Experience tips'}
              {currentStep === 'contacts' && 'Contact tips'}
              {currentStep === 'education' && 'Education tips'}
              {currentStep === 'skills' && 'Skills tips'}
              {currentStep === 'summary' && 'Summary tips'}
              {currentStep === 'finalize' && 'Review tips'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTips ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Collapsible Tips Alert Box */}
        {showTips && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs leading-relaxed animate-fadeIn">
            {currentStep === 'contacts' && (
              <p>
                <strong>Contact Advice:</strong> Ensure your phone number, city, and email are accurate. Recruiters rely on geographical proximity and clear communication channels to initiate interviews.
              </p>
            )}
            {currentStep === 'experience' && (
              <p>
                <strong>Experience Advice:</strong> Use clear action verbs, quantify impact (e.g. latency reduction, team growth, revenue scale), and highlight key technologies in bullet points.
              </p>
            )}
            {currentStep === 'education' && (
              <p>
                <strong>Education Advice:</strong> Include formal degree titles, academic institutions, and graduation years. You can add relevant honors or major focus areas.
              </p>
            )}
            {currentStep === 'skills' && (
              <p>
                <strong>Skills Advice:</strong> Only include technologies and stacks you are comfortable being interviewed on. Clean, rectangular tags are indexed directly into the recruiter search engine.
              </p>
            )}
            {currentStep === 'summary' && (
              <p>
                <strong>Summary Advice:</strong> Keep it between 2 to 4 sentences. Outline your core specializations, engineering philosophy, and the highest-impact projects you have spearheaded.
              </p>
            )}
            {currentStep === 'finalize' && (
              <p>
                <strong>Final Review:</strong> Double-check all entries. Once you click "Save & Publish Dossier", your candidate persona will be generated and made available to hiring organizations.
              </p>
            )}
          </div>
        )}

        {/* Error / Alert Feedback */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile successfully published! Opening your dossier...</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 1: CONTACTS (With Image 4 Exact Rectangular Gender Buttons)
        ═══════════════════════════════════════════════════════════════════ */}
        {currentStep === 'contacts' && (
          <div className="bg-white rounded-[24px] border border-[#E8E2D9] p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* Full Name & Professional Headline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jessica Patrick"
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:border-[#0091FF] focus:ring-2 focus:ring-[#0091FF]/20 focus:outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Senior Distributed Systems Engineer"
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:border-[#0091FF] focus:ring-2 focus:ring-[#0091FF]/20 focus:outline-none transition font-medium"
                />
              </div>
            </div>

            {/* Phone, Email & Date of Birth */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#64748B]" /> Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 707-723-4127"
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:border-[#0091FF] focus:ring-2 focus:ring-[#0091FF]/20 focus:outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#64748B]" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. jessica@example.com"
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:border-[#0091FF] focus:ring-2 focus:ring-[#0091FF]/20 focus:outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#64748B]" /> Date of Birth
                </label>
                <input
                  type="text"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  placeholder="e.g. Jan 12, 1981"
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:border-[#0091FF] focus:ring-2 focus:ring-[#0091FF]/20 focus:outline-none transition font-medium"
                />
              </div>
            </div>

            {/* Location (City & Country) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#64748B]" /> City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. San Francisco"
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:border-[#0091FF] focus:ring-2 focus:ring-[#0091FF]/20 focus:outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. United States"
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:border-[#0091FF] focus:ring-2 focus:ring-[#0091FF]/20 focus:outline-none transition font-medium"
                />
              </div>
            </div>

            {/* ── GENDER SELECTION (EXACT MATCH IMAGE 4 RECTANGULAR BUTTONS) ── */}
            <div className="pt-2 border-t border-[#F1F5F9]">
              <label className="block text-sm font-bold text-[#1E293B] mb-3">
                What is your gender ?
              </label>
              
              <div className="grid grid-cols-3 gap-3">
                {/* Male Button */}
                <button
                  type="button"
                  onClick={() => setGender(gender === 'male' ? '' : 'male')}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    gender === 'male'
                      ? 'bg-[#00BFA5] text-white shadow-sm border border-[#00BFA5]'
                      : 'bg-[#F4EFEA] hover:bg-[#EAE5DE] text-[#1E293B] border border-transparent'
                  }`}
                >
                  <span>Male</span>
                  <span className="text-base leading-none">♂</span>
                </button>

                {/* Female Button */}
                <button
                  type="button"
                  onClick={() => setGender(gender === 'female' ? '' : 'female')}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    gender === 'female'
                      ? 'bg-[#00BFA5] text-white shadow-sm border border-[#00BFA5]'
                      : 'bg-[#F4EFEA] hover:bg-[#EAE5DE] text-[#1E293B] border border-transparent'
                  }`}
                >
                  <span>Female</span>
                  <span className="text-base leading-none">♀</span>
                </button>

                {/* Other Button */}
                <button
                  type="button"
                  onClick={() => setGender(gender === 'other' ? '' : 'other')}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    gender === 'other'
                      ? 'bg-[#00BFA5] text-white shadow-sm border border-[#00BFA5]'
                      : 'bg-[#F4EFEA] hover:bg-[#EAE5DE] text-[#1E293B] border border-transparent'
                  }`}
                >
                  <span>Other</span>
                  <span className="text-base leading-none">⚧</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 2: EXPERIENCE (IMAGE 2 EXACT MATCH)
        ═══════════════════════════════════════════════════════════════════ */}
        {currentStep === 'experience' && (
          <div className="space-y-5">
            {workHistory.length === 0 ? (
              <div className="bg-white rounded-[24px] border-2 border-dashed border-[#E8E2D9] p-10 text-center">
                <Briefcase className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                <h3 className="text-sm font-bold text-[#1E293B]">No work experience listed yet</h3>
                <p className="text-xs text-[#64748B] mt-1 mb-4">
                  Add your current or past positions to demonstrate your career path.
                </p>
                <button
                  type="button"
                  onClick={handleAddRole}
                  className="bg-[#0091FF] hover:bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add work experience
                </button>
              </div>
            ) : (
              workHistory.map((role, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-[24px] border border-[#E8E2D9] shadow-xs p-6 sm:p-7 space-y-4 transition-all"
                >
                  {/* Card Header (Image 2 match: Role, Company \n MM/YYYY - MM/YYYY + Collapse + Trash) */}
                  <div className="flex items-start justify-between pb-3 border-b border-[#F1F5F9]">
                    <div>
                      <h2 className="text-sm font-bold text-[#1E293B]">
                        {role.title || 'Junior Accountant'}, {role.company || 'Company name'}
                      </h2>
                      <p className="text-xs text-[#94A3B8] font-medium mt-0.5">
                        {role.start_date || 'MM/YYYY'} - {role.is_current ? 'Present' : (role.end_date || 'MM/YYYY')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleCollapseRole(idx)}
                        className="text-[#94A3B8] hover:text-[#1E293B] p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                        title={role.collapsed ? 'Expand' : 'Collapse'}
                      >
                        {role.collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveRole(idx)}
                        className="text-[#94A3B8] hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {!role.collapsed && (
                    <div className="space-y-4 pt-1 animate-fadeIn">
                      {/* Job Title & Employer (Image 2 match) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                            Job title
                          </label>
                          <input
                            type="text"
                            value={role.title}
                            onChange={(e) => handleUpdateRole(idx, 'title', e.target.value)}
                            placeholder="e.g. Junior Accountant"
                            className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:border-[#0091FF] focus:ring-2 focus:ring-[#0091FF]/20 focus:outline-none transition font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                            Employer
                          </label>
                          <input
                            type="text"
                            value={role.company}
                            onChange={(e) => handleUpdateRole(idx, 'company', e.target.value)}
                            placeholder="e.g. Company name"
                            className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:border-[#0091FF] focus:ring-2 focus:ring-[#0091FF]/20 focus:outline-none transition font-medium"
                          />
                        </div>
                      </div>

                      {/* Location & Dates (Image 2 match) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div>
                          <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                            Location
                          </label>
                          <input
                            type="text"
                            value={role.location || ''}
                            onChange={(e) => handleUpdateRole(idx, 'location', e.target.value)}
                            placeholder="San Francisco, CA, USA"
                            className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:border-[#0091FF] focus:ring-2 focus:ring-[#0091FF]/20 focus:outline-none transition font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                            Start date
                          </label>
                          <input
                            type="text"
                            value={role.start_date || ''}
                            onChange={(e) => handleUpdateRole(idx, 'start_date', e.target.value)}
                            placeholder="MM/YYYY"
                            className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:border-[#0091FF] focus:ring-2 focus:ring-[#0091FF]/20 focus:outline-none transition font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                            End date
                          </label>
                          <input
                            type="text"
                            disabled={role.is_current}
                            value={role.is_current ? 'Present' : (role.end_date || '')}
                            onChange={(e) => handleUpdateRole(idx, 'end_date', e.target.value)}
                            placeholder="MM/YYYY"
                            className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:border-[#0091FF] focus:ring-2 focus:ring-[#0091FF]/20 focus:outline-none transition font-medium disabled:bg-slate-100 disabled:text-slate-400"
                          />
                        </div>
                      </div>

                      {/* Currently work here Checkbox (Image 2 match) */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id={`current-work-${idx}`}
                          checked={role.is_current || false}
                          onChange={(e) => handleUpdateRole(idx, 'is_current', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-[#0091FF] focus:ring-[#0091FF] cursor-pointer"
                        />
                        <label htmlFor={`current-work-${idx}`} className="text-xs font-medium text-[#1E293B] cursor-pointer">
                          Currently work here
                        </label>
                      </div>

                      {/* Description Box with Formatting Toolbar + Generate with AI (Image 2 match) */}
                      <div className="space-y-1.5 pt-2">
                        <label className="block text-xs font-bold text-[#1E293B]">
                          Description
                        </label>

                        <div className="border border-[#CBD5E1] rounded-xl bg-white overflow-hidden focus-within:border-[#0091FF] focus-within:ring-2 focus-within:ring-[#0091FF]/20 transition">
                          
                          {/* Mini Formatting Toolbar (Image 2 match) */}
                          <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-3 py-2 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1 text-[#64748B]">
                              <button
                                type="button"
                                title="Bold"
                                onClick={() => {
                                  handleUpdateRole(idx, 'description', (role.description || '') + '**bold** ');
                                }}
                                className="p-1 hover:text-[#1E293B] hover:bg-slate-200 rounded cursor-pointer transition"
                              >
                                <Bold className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Italic"
                                onClick={() => {
                                  handleUpdateRole(idx, 'description', (role.description || '') + '*italic* ');
                                }}
                                className="p-1 hover:text-[#1E293B] hover:bg-slate-200 rounded cursor-pointer transition"
                              >
                                <Italic className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Underline"
                                className="p-1 hover:text-[#1E293B] hover:bg-slate-200 rounded cursor-pointer transition"
                              >
                                <Underline className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Strikethrough"
                                className="p-1 hover:text-[#1E293B] hover:bg-slate-200 rounded cursor-pointer transition"
                              >
                                <Strikethrough className="w-3.5 h-3.5" />
                              </button>
                              <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />
                              <button
                                type="button"
                                title="Link"
                                className="p-1 hover:text-[#1E293B] hover:bg-slate-200 rounded cursor-pointer transition"
                              >
                                <Link2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Bullet List"
                                onClick={() => {
                                  handleUpdateRole(idx, 'description', (role.description || '') + '\n• ');
                                }}
                                className="p-1 hover:text-[#1E293B] hover:bg-slate-200 rounded cursor-pointer transition"
                              >
                                <List className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Numbered List"
                                onClick={() => {
                                  handleUpdateRole(idx, 'description', (role.description || '') + '\n1. ');
                                }}
                                className="p-1 hover:text-[#1E293B] hover:bg-slate-200 rounded cursor-pointer transition"
                              >
                                <ListOrdered className="w-3.5 h-3.5" />
                              </button>
                              <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />
                              <button
                                type="button"
                                title="Undo"
                                className="p-1 hover:text-[#1E293B] hover:bg-slate-200 rounded cursor-pointer transition"
                              >
                                <Undo className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Redo"
                                className="p-1 hover:text-[#1E293B] hover:bg-slate-200 rounded cursor-pointer transition"
                              >
                                <Redo className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* + Generate with AI Button (Image 2 match) */}
                            <button
                              type="button"
                              disabled={isAiGenerating}
                              onClick={() => handleGenerateExperienceBullets(idx)}
                              className="inline-flex items-center gap-1.5 bg-[#EEF2F6] hover:bg-[#E2E8F0] text-[#334155] px-3 py-1 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
                            >
                              {isAiGenerating ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0091FF]" />
                              ) : (
                                <Sparkles className="w-3.5 h-3.5 text-[#0091FF]" />
                              )}
                              <span>Generate with AI</span>
                            </button>
                          </div>

                          {/* Textarea */}
                          <textarea
                            rows={4}
                            value={role.description || ''}
                            onChange={(e) => handleUpdateRole(idx, 'description', e.target.value)}
                            placeholder="• Helped with monthly financial reports and data entry&#10;• Watched over team budgets and reported issues&#10;• Entered 150+ invoices weekly using accounting software"
                            className="w-full px-4 py-3 text-xs text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none resize-y font-medium leading-relaxed"
                          />
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              ))
            )}

            {/* + Add Work Experience link (Image 2 match: blue text with plus) */}
            <button
              type="button"
              onClick={handleAddRole}
              className="text-xs sm:text-sm font-bold text-[#0091FF] hover:underline inline-flex items-center gap-1.5 cursor-pointer py-1"
            >
              <Plus className="w-4 h-4" /> Add work experience
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 3: EDUCATION
        ═══════════════════════════════════════════════════════════════════ */}
        {currentStep === 'education' && (
          <div className="space-y-5">
            {education.length === 0 ? (
              <div className="bg-white rounded-[24px] border-2 border-dashed border-[#E8E2D9] p-10 text-center">
                <GraduationCap className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                <h3 className="text-sm font-bold text-[#1E293B]">No degrees or education added yet</h3>
                <p className="text-xs text-[#64748B] mt-1 mb-4">
                  Add your university degree, high school, or certification program.
                </p>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="bg-[#0091FF] hover:bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add education
                </button>
              </div>
            ) : (
              education.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-[24px] border border-[#E8E2D9] shadow-xs p-6 sm:p-7 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#1E293B]">
                      <GraduationCap className="w-4 h-4 text-[#0091FF]" />
                      <span>{item.degree || 'Degree Program'} - {item.institution || 'School Name'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="text-[#94A3B8] hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                        School / Institution
                      </label>
                      <input
                        type="text"
                        value={item.institution}
                        onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)}
                        placeholder="e.g. Stanford University"
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:border-[#0091FF] focus:ring-2 focus:ring-[#0091FF]/20 focus:outline-none transition font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                        Degree
                      </label>
                      <input
                        type="text"
                        value={item.degree}
                        onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                        placeholder="e.g. B.S. in Computer Science"
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:border-[#0091FF] focus:ring-2 focus:ring-[#0091FF]/20 focus:outline-none transition font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                        Field of Study
                      </label>
                      <input
                        type="text"
                        value={item.field_of_study || ''}
                        onChange={(e) => handleUpdateEducation(idx, 'field_of_study', e.target.value)}
                        placeholder="e.g. Artificial Intelligence & Distributed Systems"
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:border-[#0091FF] focus:ring-2 focus:ring-[#0091FF]/20 focus:outline-none transition font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                        Graduation Year / Dates
                      </label>
                      <input
                        type="text"
                        value={item.year || ''}
                        onChange={(e) => handleUpdateEducation(idx, 'year', e.target.value)}
                        placeholder="e.g. 2023"
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:border-[#0091FF] focus:ring-2 focus:ring-[#0091FF]/20 focus:outline-none transition font-medium"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}

            <button
              type="button"
              onClick={handleAddEducation}
              className="text-xs sm:text-sm font-bold text-[#0091FF] hover:underline inline-flex items-center gap-1.5 cursor-pointer py-1"
            >
              <Plus className="w-4 h-4" /> Add education
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 4: SKILLS & TECH STACK (RECTANGULAR BUTTON-LIKE TAGS, NOT BUBBLES)
            - STARTS COMPLETELY EMPTY ("make sure nothing is there just only when
              we are going to edit at there it is going to be there")
            - EXACT RECTANGULAR BUTTON-LIKE DESIGN MATCHING IMAGE 4
        ═══════════════════════════════════════════════════════════════════ */}
        {currentStep === 'skills' && (
          <div className="bg-white rounded-[24px] border border-[#E8E2D9] p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* Input to add skills */}
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-2">
                Add Technical Skills & Stacks
              </label>
              
              <form onSubmit={handleAddSkill} className="flex gap-2">
                <input
                  type="text"
                  value={newSkillDraft}
                  onChange={(e) => setNewSkillDraft(e.target.value)}
                  placeholder="Type a skill (e.g. Python, FastAPI, Docker, PyTorch, React)..."
                  className="flex-1 bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:border-[#0091FF] focus:ring-2 focus:ring-[#0091FF]/20 focus:outline-none transition font-medium"
                />
                
                {/* Rectangular Button design matching Image 4 */}
                <button
                  type="submit"
                  className="bg-[#00BFA5] hover:bg-[#00A892] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs transition active:scale-98 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Skill
                </button>
              </form>
            </div>

            {/* Rendered Skills: Rectangular Button-Like Tags (NOT BUBBLES) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
                  Your Added Tech Stack ({skills.length})
                </span>
                {skills.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSkills([])}
                    className="text-[11px] text-red-600 hover:underline font-semibold cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {skills.length === 0 ? (
                <div className="py-8 px-4 text-center border-2 border-dashed border-[#E2E8F0] rounded-xl bg-[#FAF7F2]">
                  <Layers className="w-6 h-6 text-[#94A3B8] mx-auto mb-2" />
                  <p className="text-xs font-medium text-[#64748B]">
                    Nothing is here yet. Type any skill above and click "Add Skill".
                  </p>
                </div>
              ) : (
                /* Rectangular Button-like Tags (Image 4 match: rectangular with rounded-xl, NOT AI bubbles) */
                <div className="flex flex-wrap gap-2.5">
                  {skills.map((skill) => (
                    <div
                      key={skill}
                      className="bg-[#F4EFEA] hover:bg-[#EAE5DE] text-[#1E293B] border border-[#E8E2D9] rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-2 shadow-2xs transition group"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-[#94A3B8] group-hover:text-red-600 hover:scale-110 transition cursor-pointer p-0.5"
                        title={`Remove ${skill}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Suggestions (Rendered in the exact same rectangular button design) */}
            <div className="pt-4 border-t border-[#F1F5F9]">
              <span className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2.5">
                Quick Add Suggestions
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Python',
                  'FastAPI',
                  'PostgreSQL',
                  'Docker',
                  'PyTorch',
                  'React',
                  'TypeScript',
                  'Redis',
                  'AWS',
                  'Machine Learning',
                  'Git',
                  'REST API',
                ]
                  .filter((s) => !skills.includes(s))
                  .slice(0, 8)
                  .map((suggested) => (
                    <button
                      key={suggested}
                      type="button"
                      onClick={() => setSkills([...skills, suggested])}
                      className="bg-[#F8FAFC] hover:bg-[#EEF2F6] text-[#475569] border border-[#CBD5E1] rounded-xl px-3 py-1.5 text-xs font-medium transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3 h-3 text-[#64748B]" />
                      <span>{suggested}</span>
                    </button>
                  ))}
              </div>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 5: SUMMARY & PHOTO & AVAILABILITY
        ═══════════════════════════════════════════════════════════════════ */}
        {currentStep === 'summary' && (
          <div className="bg-white rounded-[24px] border border-[#E8E2D9] p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* Portrait Photo Row */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9]">
              <div className="relative group shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Candidate portrait"
                    className="w-20 h-20 rounded-2xl object-cover object-center border border-[#D9D1C7] shadow-xs"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-[#EAE5DE] border border-[#D9D1C7] flex items-center justify-center text-xl font-bold text-[#635B53]">
                    {fullName ? fullName[0] : '•'}
                  </div>
                )}
                <label
                  htmlFor="summary-avatar-input"
                  className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer text-white text-xs font-semibold"
                >
                  <Camera className="w-5 h-5" />
                </label>
                <input
                  id="summary-avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
              </div>

              <div className="flex-1 w-full space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E293B]">Profile Portrait</span>
                  <label
                    htmlFor="summary-avatar-input"
                    className="text-xs font-semibold text-[#0091FF] hover:underline cursor-pointer"
                  >
                    Upload photo
                  </label>
                </div>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Or paste an image URL (e.g. https://...)"
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-xs text-[#1E293B] focus:border-[#0091FF] focus:ring-2 focus:ring-[#0091FF]/20 focus:outline-none transition font-medium"
                />
                <p className="text-[11px] text-[#64748B]">
                  Displayed in candidate search cards. Auto-extracted if you uploaded an image CV.
                </p>
              </div>
            </div>

            {/* Executive Bio with Generate with AI */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#1E293B]">
                  Professional Summary
                </label>

                <button
                  type="button"
                  disabled={isAiGenerating}
                  onClick={handleGenerateSummary}
                  className="inline-flex items-center gap-1.5 bg-[#EEF2F6] hover:bg-[#E2E8F0] text-[#334155] px-3 py-1 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
                >
                  {isAiGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0091FF]" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-[#0091FF]" />
                  )}
                  <span>Generate with AI</span>
                </button>
              </div>

              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A concise summary of your technical depth, leadership strengths, and career aspirations..."
                className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-3 text-xs text-[#1E293B] focus:border-[#0091FF] focus:ring-2 focus:ring-[#0091FF]/20 focus:outline-none transition font-medium resize-y leading-relaxed"
              />
            </div>

            {/* Availability Status (Using Image 4 Rectangular Button Design) */}
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-2.5">
                Availability Status
              </label>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'Available Now', label: 'Available Now' },
                  { key: 'Open to Offers', label: 'Open to Offers' },
                  { key: 'Unavailable', label: 'Unavailable' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setAvailability(opt.key as any)}
                    className={`py-3 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center cursor-pointer ${
                      availability === opt.key
                        ? 'bg-[#00BFA5] text-white shadow-sm border border-[#00BFA5]'
                        : 'bg-[#F4EFEA] hover:bg-[#EAE5DE] text-[#1E293B] border border-transparent'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Years of Experience & Desired Compensation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                  Total Years of Experience
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={totalYears}
                  onChange={(e) => setTotalYears(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 5"
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:border-[#0091FF] focus:ring-2 focus:ring-[#0091FF]/20 focus:outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                  Target Compensation
                </label>
                <input
                  type="text"
                  value={desiredSalary}
                  onChange={(e) => setDesiredSalary(e.target.value)}
                  placeholder="e.g. $160,000"
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:border-[#0091FF] focus:ring-2 focus:ring-[#0091FF]/20 focus:outline-none transition font-medium"
                />
              </div>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 6: FINALIZE & LIVE PREVIEW
        ═══════════════════════════════════════════════════════════════════ */}
        {currentStep === 'finalize' && (
          <div className="bg-white rounded-[24px] border border-[#E8E2D9] p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* Dossier Summary Card */}
            <div className="bg-[#FAF7F2] rounded-2xl border border-[#E8E2D9] p-6">
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-[#E8E2D9]">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-20 h-20 rounded-2xl object-cover border border-[#D9D1C7] shadow-xs"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-[#0B0C10] text-white flex items-center justify-center font-bold text-2xl">
                    {fullName ? fullName[0] : '•'}
                  </div>
                )}

                <div className="text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl font-bold text-[#1E293B]">{fullName || 'Untitled Candidate'}</h2>
                    {gender && (
                      <span className="bg-[#00BFA5] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg shadow-2xs">
                        {gender === 'male' && 'Male ♂'}
                        {gender === 'female' && 'Female ♀'}
                        {gender === 'other' && 'Other ⚧'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-[#0091FF]">{headline || 'Software Engineer'}</p>
                  <p className="text-[11px] text-[#64748B]">
                    {[city, country].filter(Boolean).join(', ') || 'Remote'} • {totalYears} years experience
                  </p>
                </div>
              </div>

              {/* Bio snippet */}
              {bio && (
                <div className="pt-4 pb-2 text-xs text-[#475569] leading-relaxed">
                  <p>{bio}</p>
                </div>
              )}

              {/* Skills preview */}
              {skills.length > 0 && (
                <div className="pt-4 border-t border-[#E8E2D9]">
                  <span className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                    Technical Stack ({skills.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span
                        key={s}
                        className="bg-white border border-[#CBD5E1] text-[#1E293B] text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Work history count */}
              <div className="pt-4 border-t border-[#E8E2D9] grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#64748B] block text-[11px]">Experience Entries</span>
                  <span className="font-bold text-[#1E293B]">{workHistory.length} roles documented</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[11px]">Academic Degrees</span>
                  <span className="font-bold text-[#1E293B]">{education.length} credentials</span>
                </div>
              </div>
            </div>

            {/* Ready indicator */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Your resume profile is ready to be published into the candidate registry. Click below to finalize.
              </span>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            BOTTOM NAVIGATION BAR (IMAGE 2 EXACT MATCH)
            - LEFT: [ Back ] (Rounded white button with subtle border)
            - RIGHT: [ Next: <Step> ] (Solid vibrant blue/emerald rounded button)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="mt-8 flex items-center justify-between border-t border-[#E2E8F0] pt-6 pb-12">
          
          {/* Back Button */}
          <button
            type="button"
            onClick={goToPrevStep}
            className="rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#334155] px-6 py-2.5 text-xs sm:text-sm font-semibold transition cursor-pointer shadow-2xs"
          >
            Back
          </button>

          {/* Next Button */}
          <button
            type="button"
            disabled={isSaving}
            onClick={goToNextStep}
            className="rounded-xl bg-[#0091FF] hover:bg-blue-600 active:scale-98 text-white px-7 py-2.5 text-xs sm:text-sm font-bold shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin text-white" />}
            <span>{getNextButtonLabel()}</span>
          </button>

        </div>

      </div>
    </div>
  );
};
