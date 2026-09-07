import React from 'react';
import { Share2, Download, FileText, ArrowRight } from 'lucide-react';

export default function CandidatePersonaPage({ personaData, onExport, onShare }) {
  // Default data matching the 1:1 design layout (can be dynamically overridden by props from your CV pipeline)
  const data = personaData || {
    name: 'Marie — The artist',
    roleTagline: 'Looking to sell her art easily online and gain exposure as an up and coming artist.',
    age: 26,
    maritalStatus: 'Single',
    occupation: 'Artist/Art Buyer',
    location: 'London, UK',
    income: '£32,000',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
    
    bioP1: `Julia is an artist in London. She graduated 4 years ago from art school and has been making art since joining a local studio 12 months ago.`,
    bioP1Highlight: 'graduated 4 years ago',
    bioP2: `Although she loves the people she works with, she has been giving serious thought to her future. While the studio that she works at is growing, she's worried that she won't develop a name for herself if she continues working with others. She's considering selling her art online and wants a reputable place to sell her pieces while gaining good exposure.`,
    
    needs: [
      'To find the right website which offers the facilities she wants.',
      'To find a way to fund her artworks without incurring lots of debt.'
    ],
    
    bubbleStats: {
      primary: { percent: '65%', label: 'Artworks', color: '#7b71c7' },
      secondary: { percent: '22%', label: 'Bedding', color: '#38bdf8' },
      tertiary: { percent: '13%', label: 'Lighting', color: '#fb7185' },
      caption: 'The 3 most popular categories of homewares'
    },
    
    painPoints: [
      "Concerned that she'll need to manage mailing artworks and won't be able to afford the website fees",
      "Worried that she's one of many artists and won't get enough exposure",
      "Doesn't want the service to take too high a percentage of her sales"
    ],
    
    idealExperience: [
      'Mail her pieces internationally and ensure they arrive safely',
      'Manage her inventory easily from her iPhone',
      'Make great money to sustain her passion making art'
    ],
    
    quotes: [
      {
        text: `It's important that I can connect with the buyers`,
        highlight: 'connect with the buyers'
      },
      {
        text: `"I really just need an easy way to promote my art and keep prospective buyers up to date"`
      },
      {
        text: `"The hardest part is managing the actual transaction."`,
        hasPointer: true
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#ececf0] text-slate-800 font-sans pb-16 antialiased">
      
      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="w-full bg-transparent px-8 py-5 flex items-center justify-between border-b border-gray-200/60">
        <div className="w-24"></div> {/* Left spacer */}
        
        {/* Centered Serif Title */}
        <h1 className="font-serif text-2xl font-bold text-gray-900 tracking-tight">
          Persona
        </h1>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Overlapping team avatar chips */}
          <div className="flex -space-x-2 mr-2">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"
              alt="Reviewer"
              className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-sm"
            />
            <img
              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&q=80"
              alt="Reviewer"
              className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-sm"
            />
          </div>

          <button
            type="button"
            onClick={onShare}
            className="flex items-center gap-1.5 bg-[#2d2838] hover:bg-[#1f1b27] text-white text-xs font-medium px-3 py-1.5 rounded-md transition shadow-sm"
          >
            <Share2 className="w-3 h-3" />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={onExport}
            className="text-xs text-gray-500 hover:text-gray-800 font-medium px-2 py-1.5 transition"
          >
            Export
          </button>
        </div>
      </header>

      {/* ================= BENTO GRID CONTAINER ================= */}
      <main className="max-w-[1360px] mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================= COLUMN 1: CANDIDATE PROFILE & DEMOGRAPHICS (Span 3) ================= */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-200/70 overflow-hidden">
            {/* Candidate Photo */}
            <div className="w-full aspect-[4/4.5] overflow-hidden bg-gray-100">
              <img
                src={data.avatarUrl}
                alt={data.name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Profile Info */}
            <div className="p-6">
              <h2 className="font-serif text-xl font-bold text-gray-900 tracking-tight">
                {data.name}
              </h2>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed font-normal">
                {data.roleTagline}
              </p>

              {/* Demographics Key-Values */}
              <div className="mt-6 pt-5 border-t border-gray-100 space-y-2 text-xs text-gray-700">
                <p>
                  <strong className="font-semibold text-gray-900">Age:</strong> {data.age}
                </p>
                <p>
                  <strong className="font-semibold text-gray-900">Marital status:</strong> {data.maritalStatus}
                </p>
                <p>
                  <strong className="font-semibold text-gray-900">Occupation:</strong> {data.occupation}
                </p>
                <p>
                  <strong className="font-semibold text-gray-900">Location:</strong> {data.location}
                </p>
                <p>
                  <strong className="font-semibold text-gray-900">Income:</strong> {data.income}
                </p>
              </div>
            </div>
          </div>

          {/* ================= COLUMN 2: BIO, NEEDS & BRAND BADGES (Span 3) ================= */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Bio Card */}
            <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-200/70">
              <h3 className="font-serif text-base font-bold text-gray-900 mb-3">Bio</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Julia is an artist in London. She{' '}
                <mark className="bg-[#ff4081]/25 text-gray-900 px-1 py-0.5 rounded font-medium">
                  {data.bioP1Highlight}
                </mark>{' '}
                from art school and has been making art since joining a local studio 12 months ago.
              </p>
              <p className="mt-3 text-xs text-gray-600 leading-relaxed">
                {data.bioP2}
              </p>
            </div>

            {/* Needs Card */}
            <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-200/70">
              <h3 className="font-serif text-base font-bold text-gray-900 mb-3">Needs</h3>
              <ul className="list-disc list-outside pl-4 space-y-2 text-xs text-gray-600 leading-relaxed">
                {data.needs.map((need, idx) => (
                  <li key={idx}>{need}</li>
                ))}
              </ul>
            </div>

            {/* Brand / Partner / Tech Stack Cards */}
            <div className="flex items-center gap-3">
              {/* HAUS Logo Card */}
              <div className="w-24 h-16 bg-black rounded-lg flex flex-col items-center justify-center text-white shadow-sm">
                <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 3.5L17 11v7H7v-7l5-4.5z" />
                </svg>
                <span className="text-[11px] font-black tracking-widest uppercase">HAUS</span>
              </div>

              {/* Gloop Logo Card */}
              <div className="w-28 h-16 bg-black rounded-lg flex items-center justify-center text-white shadow-sm px-2">
                <span className="font-serif italic text-lg font-bold tracking-tight">Gloop</span>
              </div>
            </div>

          </div>

          {/* ================= COLUMN 3: CATEGORIES BUBBLE CHART, PAIN POINTS, IDEAL EXP (Span 3) ================= */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Visual Bubble Breakdown Chart */}
            <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-200/70 text-center">
              <div className="relative w-48 h-40 mx-auto">
                {/* 65% Primary Purple Bubble */}
                <div className="absolute right-1 top-2 w-28 h-28 rounded-full bg-[#7568be] text-white flex flex-col items-center justify-center shadow-md z-20">
                  <span className="text-xl font-bold leading-tight">{data.bubbleStats.primary.percent}</span>
                  <span className="text-[10px] font-normal">{data.bubbleStats.primary.label}</span>
                </div>

                {/* 22% Secondary Blue Bubble */}
                <div className="absolute left-3 bottom-0 w-20 h-20 rounded-full bg-[#38bdf8] text-white flex flex-col items-center justify-center shadow-sm z-10">
                  <span className="text-sm font-bold leading-tight">{data.bubbleStats.secondary.percent}</span>
                  <span className="text-[9px] font-normal">{data.bubbleStats.secondary.label}</span>
                </div>

                {/* 13% Tertiary Coral Bubble */}
                <div className="absolute left-6 top-0 w-14 h-14 rounded-full bg-[#fb7185] text-white flex flex-col items-center justify-center shadow-sm z-0">
                  <span className="text-xs font-bold leading-tight">{data.bubbleStats.tertiary.percent}</span>
                  <span className="text-[8px] font-normal leading-tight">{data.bubbleStats.tertiary.label}</span>
                </div>
              </div>

              <p className="mt-3 text-[11px] text-gray-500 font-normal">
                {data.bubbleStats.caption}
              </p>
            </div>

            {/* Pain Points Card */}
            <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-200/70">
              <h3 className="font-serif text-base font-bold text-gray-900 mb-3">Pain points</h3>
              <ul className="list-disc list-outside pl-4 space-y-2.5 text-xs text-gray-600 leading-relaxed">
                {data.painPoints.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>

            {/* Ideal Experience Card */}
            <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-200/70">
              <h3 className="font-serif text-base font-bold text-gray-900 mb-3">Ideal experience</h3>
              <ul className="list-disc list-outside pl-4 space-y-2.5 text-xs text-gray-600 leading-relaxed">
                {data.idealExperience.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

          </div>

          {/* ================= COLUMN 4: RESEARCH, QUOTES & GROWTH LINE CHART (Span 3) ================= */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Header / Research Title */}
            <div className="text-center pt-1 pb-1">
              <h3 className="font-serif text-base font-bold text-gray-900">Research</h3>
              <p className="text-[11px] text-gray-400">2 cards, 1 document</p>
            </div>

            {/* Quotes Card */}
            <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-200/70 relative">
              <h4 className="font-serif text-sm font-bold text-gray-900 mb-4">Quotes</h4>

              <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
                {/* Quote 1 with cyan highlight */}
                <p>
                  "It's important that I can{' '}
                  <mark className="bg-[#38bdf8]/35 text-gray-900 px-1 py-0.5 rounded font-medium">
                    connect with the buyers
                  </mark>
                  "
                </p>

                {/* Quote 2 */}
                <p>
                  "I really just need an easy way to promote my art and keep prospective buyers up to date"
                </p>

                {/* Quote 3 with pointer indicator */}
                <div className="relative">
                  <p className="text-gray-700 font-medium">
                    "The hardest part is managing the actual transaction."
                  </p>
                  {/* Subtle pointing arrow matching screenshot */}
                  <div className="hidden xl:flex items-center gap-1 text-[#64b5a0] absolute -right-6 top-1/2 -translate-y-1/2">
                    <span className="w-5 h-[1px] bg-[#64b5a0]"></span>
                    <span className="text-[10px]">◀</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Survey Results Document Card */}
            <div className="bg-white rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-200/70 flex items-center gap-3">
              {/* Document Icon Box */}
              <div className="w-10 h-11 rounded bg-[#ff8a80]/20 border border-[#ff8a80]/30 flex flex-col items-center justify-center text-[#d32f2f]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-semibold text-gray-900">Survey results</h5>
                <p className="text-[10px] text-gray-400">3 words</p>
              </div>
            </div>

            {/* Growth / Sales Curve Line Chart Card */}
            <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-200/70">
              <h5 className="text-[11px] font-semibold text-gray-700 mb-3">E-Commerce Sales</h5>
              
              {/* Vector SVG Line Chart */}
              <div className="w-full">
                <svg viewBox="0 0 240 140" className="w-full h-auto text-gray-400 text-[8px]">
                  {/* Y Axis Guide Lines */}
                  <line x1="30" y1="15" x2="230" y2="15" stroke="#f1f1f4" strokeWidth="1" />
                  <text x="5" y="18" fill="#9ca3af">120.0M</text>

                  <line x1="30" y1="35" x2="230" y2="35" stroke="#f1f1f4" strokeWidth="1" />
                  <text x="5" y="38" fill="#9ca3af">100.0M</text>

                  <line x1="30" y1="55" x2="230" y2="55" stroke="#f1f1f4" strokeWidth="1" />
                  <text x="5" y="58" fill="#9ca3af">80.0M</text>

                  <line x1="30" y1="75" x2="230" y2="75" stroke="#f1f1f4" strokeWidth="1" />
                  <text x="5" y="78" fill="#9ca3af">60.0M</text>

                  <line x1="30" y1="95" x2="230" y2="95" stroke="#f1f1f4" strokeWidth="1" />
                  <text x="5" y="98" fill="#9ca3af">40.0M</text>

                  <line x1="30" y1="115" x2="230" y2="115" stroke="#f1f1f4" strokeWidth="1" />
                  <text x="5" y="118" fill="#9ca3af">20.0M</text>

                  {/* Red Upward Curve Line */}
                  <path
                    d="M 32,110 
                       C 55,108 80,105 105,98 
                       C 115,95 125,100 135,92 
                       C 150,80 170,68 190,50 
                       C 205,35 220,25 230,18"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Bottom Baseline */}
                  <line x1="30" y1="120" x2="230" y2="120" stroke="#d1d5db" strokeWidth="1" />

                  {/* X Axis Year Labels */}
                  <g fill="#9ca3af" fontSize="6.5">
                    <text x="32" y="130" transform="rotate(-90 32,130)">2000</text>
                    <text x="52" y="130" transform="rotate(-90 52,130)">2002</text>
                    <text x="72" y="130" transform="rotate(-90 72,130)">2004</text>
                    <text x="92" y="130" transform="rotate(-90 92,130)">2006</text>
                    <text x="112" y="130" transform="rotate(-90 112,130)">2008</text>
                    <text x="132" y="130" transform="rotate(-90 132,130)">2010</text>
                    <text x="152" y="130" transform="rotate(-90 152,130)">2012</text>
                    <text x="172" y="130" transform="rotate(-90 172,130)">2014</text>
                    <text x="192" y="130" transform="rotate(-90 192,130)">2016</text>
                    <text x="212" y="130" transform="rotate(-90 212,130)">2017</text>
                  </g>
                </svg>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
