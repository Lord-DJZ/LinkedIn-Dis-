import React, { useState } from 'react';
import {
  FileText,
  Edit3,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Zap,
  Code,
  Database,
  Cpu,
  Briefcase,
  Globe,
  Sliders,
  Sparkles,
  Server,
  MapPin
} from 'lucide-react';

export default function DullnitProfileCVPage({ onStartPipeline, onMethodSwitch }) {
  // Step tracking (1: Upload Document, 2: Pipeline Processing, 3: Candidate Persona, 4: Review & Persist)
  const [currentStep, setCurrentStep] = useState(1);

  // Ingestion Mode: Method B (CV Upload) vs Method A (Manual Entry)
  const [ingestionMethod, setIngestionMethod] = useState('upload'); // 'upload' | 'manual'

  // Form Fields
  const [domain, setDomain] = useState('Software Engineering & AI');
  const [experienceLevel, setExperienceLevel] = useState('Mid-level (3 - 5 Years)');
  const [locationHub, setLocationHub] = useState('Colombo (6.9271° N, 79.8612° E)');
  const [currency, setCurrency] = useState('USD');
  const [functionalArea, setFunctionalArea] = useState('software');

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const steps = [
    { id: 1, title: 'Upload Document' },
    { id: 2, title: 'Pipeline Processing' },
    { id: 3, title: 'Candidate Persona' },
    { id: 4, title: 'Review & Persist' },
  ];

  const functionalAreas = [
    { id: 'software', label: 'Software & AI Engineering', icon: Code },
    { id: 'data', label: 'Data Science & Analytics', icon: Database },
    { id: 'cloud', label: 'Cloud & DevOps', icon: Cpu },
    { id: 'product', label: 'Product & Project Mgmt', icon: Briefcase },
    { id: 'web', label: 'Web & Mobile Systems', icon: Globe },
    { id: 'hr', label: 'HR & Talent Operations', icon: Sliders },
  ];

  // Drag & Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleStartPipeline = (e) => {
    e.preventDefault();
    if (onStartPipeline) {
      onStartPipeline({
        method: ingestionMethod,
        domain,
        experienceLevel,
        locationHub,
        currency,
        functionalArea,
        file: uploadedFile,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#240b3b] py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center font-sans antialiased text-slate-800">
      
      {/* Top Navbar / Platform Brand Header */}
      <div className="w-full max-w-6xl mb-6 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-white font-black text-xl tracking-wider">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>DULLNIT</span>
          </div>
          <span className="bg-[#411961] text-purple-200 border border-purple-400/20 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">
            Talent Platform
          </span>
        </div>

        {/* System Status Pill */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 px-3.5 py-1.5 rounded-full text-xs text-white/90">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium">System Status: Active</span>
        </div>
      </div>

      {/* Main Elevated Modal Card */}
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-950/20 p-6 sm:p-10">
        
        {/* ================= STEPPER HEADER ================= */}
        <div className="w-full border-b border-gray-100 pb-7 mb-8">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, idx) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#1e0a2f] text-white shadow-md'
                          : isCompleted
                          ? 'bg-purple-100 text-[#5925dc] border border-[#7f56d9]'
                          : 'border border-gray-300 text-gray-400 bg-white'
                      }`}
                    >
                      {step.id}
                    </div>
                    <span
                      className={`text-sm tracking-tight ${
                        isActive
                          ? 'font-semibold text-gray-900'
                          : isCompleted
                          ? 'font-medium text-gray-700'
                          : 'font-normal text-gray-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>

                  {idx < steps.length - 1 && (
                    <div className="flex-1 mx-4 h-[1.5px] bg-gray-200 hidden md:block" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ================= 2-COLUMN LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: FORM CARD (Span 8) */}
          <div className="lg:col-span-8 bg-white/80 rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.03)]">
            
            {/* Section 1: Ingestion Method Selection Pills */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">
                Ingestion Method
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setIngestionMethod('upload')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition ${
                    ingestionMethod === 'upload'
                      ? 'bg-[#f4ecfb] border border-[#d8bbf3] text-[#5c248b] shadow-sm ring-2 ring-[#7f56d9]/20'
                      : 'bg-[#f7f8fa] border border-gray-200/80 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FileText className={`w-4 h-4 ${ingestionMethod === 'upload' ? 'text-[#7f56d9]' : 'text-gray-400'}`} />
                  <span>Method B: Upload CV / Resume (Word & PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIngestionMethod('manual')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition ${
                    ingestionMethod === 'manual'
                      ? 'bg-[#f4ecfb] border border-[#d8bbf3] text-[#5c248b] shadow-sm ring-2 ring-[#7f56d9]/20'
                      : 'bg-[#f7f8fa] border border-gray-200/80 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Edit3 className={`w-4 h-4 ${ingestionMethod === 'manual' ? 'text-[#7f56d9]' : 'text-gray-400'}`} />
                  <span>Method A: Manual Profile Entry</span>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Row 2: Target Domain & Experience Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Closest match to candidate industry / domain
                  </label>
                  <div className="relative">
                    <select
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 focus:border-[#7f56d9] pr-10 cursor-pointer"
                    >
                      <option value="Software Engineering & AI">Software Engineering & AI</option>
                      <option value="Data Science & Big Data">Data Science & Big Data</option>
                      <option value="Business Management & IT">Business Management & IT</option>
                      <option value="Education">Education & Academic</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Candidate experience tier
                  </label>
                  <div className="relative">
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 focus:border-[#7f56d9] pr-10 cursor-pointer"
                    >
                      <option value="Entry / Student (0 - 1 Years)">Entry / Student (0 - 1 Years)</option>
                      <option value="Junior (1 - 3 Years)">Junior (1 - 3 Years)</option>
                      <option value="Mid-level (3 - 5 Years)">Mid-level (3 - 5 Years)</option>
                      <option value="Senior (5 - 8 Years)">Senior (5 - 8 Years)</option>
                      <option value="Lead / Specialist (8+ Years)">Lead / Specialist (8+ Years)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 3: Location Coordinates & Salary Currency */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  PostGIS Proximity Anchor & Preferred Currency
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 relative">
                    <select
                      value={locationHub}
                      onChange={(e) => setLocationHub(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 focus:border-[#7f56d9] pr-10 cursor-pointer"
                    >
                      <option value="Colombo (6.9271° N, 79.8612° E)">Colombo (6.9271° N, 79.8612° E) [PostGIS Ready]</option>
                      <option value="Kandy (7.2906° N, 80.6337° E)">Kandy (7.2906° N, 80.6337° E)</option>
                      <option value="Remote - Global">Remote - Worldwide Available</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#7f56d9]/30 focus:border-[#7f56d9] pr-10 cursor-pointer"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="LKR">LKR (Rs)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 4: Functional Area / Skill Cluster Chips */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2.5">
                  Select candidate functional area
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {functionalAreas.map((area) => {
                    const Icon = area.icon;
                    const isSelected = functionalArea === area.id;
                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => setFunctionalArea(area.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
                          isSelected
                            ? 'bg-[#f4ecfb] border border-[#d8bbf3] text-[#5c248b] shadow-sm ring-1 ring-[#7f56d9]/30'
                            : 'bg-[#f7f8fa] border border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#5c248b]' : 'text-gray-400'}`} />
                        <span>{area.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 5: Dynamic Ingestion Box (Upload Dropzone or Manual Notice) */}
              {ingestionMethod === 'upload' ? (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Resume Ingestion & Extraction
                    </label>
                    <span className="text-[11px] text-gray-400">
                      PyMuPDF / docx + Gemini AI Extraction
                    </span>
                  </div>

                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${
                      dragActive
                        ? 'border-[#7f56d9] bg-[#f8f5fe]'
                        : uploadedFile
                        ? 'border-emerald-300 bg-emerald-50/40'
                        : 'border-gray-200 hover:border-purple-300 bg-[#fafafa]'
                    }`}
                  >
                    <input
                      type="file"
                      id="cv-file-upload"
                      className="hidden"
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="cv-file-upload" className="cursor-pointer block">
                      {uploadedFile ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-2" />
                          <p className="text-sm font-semibold text-gray-800">{uploadedFile.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI Pipeline
                          </p>
                          <span className="mt-2 text-xs text-[#7f56d9] font-medium underline">
                            Click to choose a different document
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-11 h-11 rounded-full bg-purple-100/70 text-[#7f56d9] flex items-center justify-center mb-2">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-medium text-gray-800">
                            Click to select or <span className="text-[#7f56d9] font-semibold">drag & drop</span> your CV file
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Supported formats: Word (.docx, .doc) & PDF (.pdf) — Max file size 10MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-purple-900">
                  <p className="font-semibold mb-1">Manual Profile Entry Selected</p>
                  <p className="text-purple-700">
                    You will proceed directly to Step 2 (Candidate Persona) to manually populate biographical, contact, and educational records.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ENGINE STATUS & ARCHITECTURAL LINE ART (Span 4) */}
          <div className="lg:col-span-4 pl-0 lg:pl-4 pt-1 flex flex-col justify-between h-full">
            <div>
              <h2 className="text-3xl font-light text-gray-800 leading-tight">
                About <br />
                <span className="font-normal text-gray-900">Ingestion Engine</span>
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-gray-500 leading-relaxed">
                Authoritative candidate profiles require geocoded location coordinates for PostGIS spatial searches and confirmed skill tags.
              </p>

              {/* Ingestion Engine Telemetry Badge */}
              <div className="mt-5 p-4 rounded-xl bg-purple-50/60 border border-purple-100/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#5925dc]">
                  <Zap className="w-3.5 h-3.5" />
                  <span>PostGIS Proximity Ready</span>
                </div>
                <p className="text-[11px] text-gray-600 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-purple-600" />
                  <span>Colombo (6.9271° N, 79.8612° E) configured</span>
                </p>
                <div className="pt-2 border-t border-purple-100/60 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Target Store:</span>
                  <span className="font-semibold text-gray-700 flex items-center gap-1">
                    <Server className="w-3 h-3 text-emerald-600" />
                    PostgreSQL
                  </span>
                </div>
              </div>
            </div>

            {/* Exact Line-Art Architectural Vector (from Image 2) */}
            <div className="mt-8 flex justify-center lg:justify-end pr-2">
              <svg
                viewBox="0 0 240 220"
                className="w-48 sm:w-56 h-auto text-[#716982] stroke-current fill-none stroke-[1.8]"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Soft background radial wash */}
                <circle cx="120" cy="120" r="80" className="stroke-none fill-[#f8f6fc]" />

                {/* Ground line */}
                <line x1="20" y1="185" x2="220" y2="185" strokeLinecap="round" />
                <line x1="40" y1="192" x2="100" y2="192" strokeLinecap="round" strokeWidth="1.2" />

                {/* Left low building */}
                <rect x="30" y="140" width="45" height="45" rx="1" />
                <g className="fill-current stroke-none">
                  <circle cx="45" cy="155" r="1.3" />
                  <circle cx="60" cy="155" r="1.3" />
                  <circle cx="45" cy="170" r="1.3" />
                  <circle cx="60" cy="170" r="1.3" />
                </g>

                {/* Middle Tall Building */}
                <rect x="45" y="85" width="45" height="100" rx="1" />
                <g className="fill-current stroke-none">
                  <circle cx="60" cy="102" r="1.3" />
                  <circle cx="75" cy="102" r="1.3" />
                  <circle cx="60" cy="118" r="1.3" />
                  <circle cx="75" cy="118" r="1.3" />
                  <circle cx="60" cy="134" r="1.3" />
                  <circle cx="75" cy="134" r="1.3" />
                </g>

                {/* Main Large Building */}
                <rect x="90" y="115" width="70" height="70" rx="1" />
                <line x1="125" y1="98" x2="125" y2="115" />
                <rect x="115" y="160" width="20" height="25" rx="1" />
                <g className="fill-current stroke-none">
                  <circle cx="105" cy="130" r="1.3" />
                  <circle cx="125" cy="130" r="1.3" />
                  <circle cx="145" cy="130" r="1.3" />
                  <circle cx="105" cy="145" r="1.3" />
                  <circle cx="145" cy="145" r="1.3" />
                </g>

                {/* Tree on right */}
                <line x1="185" y1="160" x2="185" y2="185" />
                <path
                  d="M 185,130 
                     A 14,14 0 0,1 200,145 
                     A 12,12 0 0,1 196,165 
                     A 12,12 0 0,1 174,165 
                     A 12,12 0 0,1 170,145 
                     A 14,14 0 0,1 185,130 Z"
                />
                <line x1="185" y1="145" x2="185" y2="168" strokeWidth="1.2" />
                <line x1="185" y1="152" x2="192" y2="148" strokeWidth="1.2" />
              </svg>
            </div>
          </div>

        </div>

        {/* ================= BOTTOM ACTION BAR ================= */}
        <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-end">
          <button
            type="button"
            onClick={handleStartPipeline}
            className="flex items-center gap-2 bg-[#2d0e44] hover:bg-[#200832] active:scale-[0.99] text-white px-7 py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <span>Start Ingestion Pipeline</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
