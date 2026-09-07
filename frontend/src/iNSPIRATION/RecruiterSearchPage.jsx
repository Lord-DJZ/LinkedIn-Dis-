import React, { useState } from 'react';
import {
  Search,
  Bookmark,
  Briefcase,
  DollarSign,
  Calendar,
  MessageSquare,
  Users,
  MapPin,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Plus,
  EyeOff,
  FileText
} from 'lucide-react';

export default function RecruiterSearchPage({ candidatesData, onSaveCandidate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(3); // Card 3 open by default matching screenshot
  const [selectedFilterCount, setSelectedFilterCount] = useState(0);

  // Accordion open/close states for left filters
  const [openFilters, setOpenFilters] = useState({
    lists: false,
    topics: false,
    budget: false,
    date: false,
    comments: false,
    audience: false,
    location: false,
    exclusive: false,
  });

  const toggleFilter = (key) => {
    setOpenFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Default candidate items matching the exact 1:1 layout
  const candidates = candidatesData || [
    {
      id: 1,
      name: 'Daniel Shapiro',
      badge: 'Dullnit Verified Talent',
      bio: 'World Renowned Harvard Expert and Best-Selling Author on Collaboration, Communication and Teamwork',
      tags: ['Authors', 'Business Speakers', 'Business Consulting Speakers'],
      fee: 'Request fee',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      commentCount: 3,
      listCount: 0,
    },
    {
      id: 2,
      name: 'Frances Townsend',
      badge: null,
      bio: 'National Security Analyst, CBS News; Assistant to the President for Homeland Security and Counterterrorism (2004-2008)',
      tags: ['Authors', 'Business Speakers', 'Business Consulting Speakers'],
      fee: '$25K - $40K',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
      commentCount: 11,
      listCount: 2,
    },
    {
      id: 3,
      name: 'Gary Player',
      badge: null,
      bio: 'Legendary Professional Golfer; "The Black Knight"',
      tags: ['Athlete Speakers', 'Business Speakers', 'Celebrity Speakers'],
      fee: 'Over $70,000',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      commentCount: 0,
      listCount: 0,
    },
    {
      id: 4,
      name: 'Eugene Robinson',
      badge: null,
      bio: 'Pulitzer Prize-winning Columnist, The Washington Post; Political Analyst, MSNBC',
      tags: ['Anti-Racism Speakers', 'Authors', 'Black History Month Speakers'],
      fee: null,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      commentCount: 0,
      listCount: 0,
    },
    {
      id: 5,
      name: 'Obi Felten',
      badge: null,
      bio: 'CEO, Flourish Labs; Head of Getting Moonshots Ready for Contact with the Real World, X (2012-2021)',
      tags: ['Anti-Racism Speakers', 'Authors', 'Black History Month Speakers'],
      fee: 'Under $25,000',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      commentCount: 0,
      listCount: 0,
    },
    {
      id: 6,
      name: 'Eugene Robinson',
      badge: null,
      bio: 'Pulitzer Prize-winning Columnist, The Washington Post and Political Analyst, MSNBC',
      tags: [],
      fee: 'Under $25,000',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      commentCount: 0,
      listCount: 0,
    },
  ];

  // Saved talent lists (for the popover)
  const savedLists = [
    { title: 'All saved speakers', count: 14 },
    { title: 'Q3 Speakers', count: 3 },
    { title: 'My favorite list of speakers', count: '-', isPrivate: true },
    { title: 'Memphis Shuffle Event', count: 15 },
    { title: 'Political & Sport', count: 28 },
  ];

  const filterCategories = [
    { id: 'lists', label: "Speaker's lists", icon: Bookmark },
    { id: 'topics', label: 'Topics & types', icon: Briefcase },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'date', label: 'Date', icon: Calendar },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'audience', label: 'Audience', icon: Users },
    { id: 'location', label: 'Traveling from', icon: MapPin },
    { id: 'exclusive', label: 'WSB Exclusive', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 font-sans antialiased">
      
      {/* ================= TOP SEARCH HEADER ================= */}
      <div className="w-full bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-[1380px] mx-auto pl-64">
          <div className="relative max-w-xl">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword"
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/30 transition shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* ================= MAIN 2-COLUMN VIEW ================= */}
      <div className="max-w-[1380px] mx-auto flex items-start">
        
        {/* ================= LEFT FILTER SIDEBAR ================= */}
        <aside className="w-64 flex-shrink-0 bg-white min-h-screen border-r border-gray-200 p-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-2 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-900 tracking-tight">Filters</h2>
            <span className="text-[11px] text-gray-400 font-medium">
              {selectedFilterCount} selected
            </span>
          </div>

          {/* Accordion List */}
          <div className="divide-y divide-gray-100">
            {filterCategories.map((item) => {
              const Icon = item.icon;
              const isOpen = openFilters[item.id];
              return (
                <div key={item.id} className="py-3">
                  <button
                    type="button"
                    onClick={() => toggleFilter(item.id)}
                    className="w-full flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-2.5 text-xs text-gray-700 group-hover:text-purple-700 font-medium transition">
                      <Icon className="w-4 h-4 text-[#4338ca] flex-shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-[#4338ca]" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-[#4338ca]" />
                    )}
                  </button>

                  {/* Expandable options (shown when clicked) */}
                  {isOpen && (
                    <div className="mt-2.5 pl-6 space-y-1.5 text-xs text-gray-500">
                      <label className="flex items-center gap-2 cursor-pointer hover:text-gray-800">
                        <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-0" />
                        <span>Option 1</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:text-gray-800">
                        <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-0" />
                        <span>Option 2</span>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* ================= RIGHT RESULTS LIST ================= */}
        <main className="flex-1 p-6 lg:p-8">
          
          {/* Section Counter */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              All speakers ({candidates.length > 5 ? 712 : candidates.length})
            </h3>
          </div>

          {/* Candidate Card List */}
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 transition hover:shadow-sm"
              >
                <div className="flex items-start gap-4">
                  
                  {/* Candidate Avatar */}
                  <img
                    src={candidate.avatar}
                    alt={candidate.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0 shadow-sm"
                  />

                  {/* Middle Info Column */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-sm font-bold text-gray-900">
                        {candidate.name}
                      </h4>
                      {candidate.badge && (
                        <span className="bg-[#fef3c7] text-[#92400e] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          {candidate.badge}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-gray-600 leading-relaxed max-w-2xl">
                      {candidate.bio}
                    </p>

                    {/* Blue Tag Links */}
                    {candidate.tags && candidate.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#2563eb]">
                        {candidate.tags.map((tag, idx) => (
                          <span key={idx} className="hover:underline cursor-pointer">
                            {tag}{idx < candidate.tags.length - 1 ? ',' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Actions & Pricing Column */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      {/* Price / Fee Status */}
                      {candidate.fee && (
                        <span className="text-xs font-semibold text-gray-800">
                          {candidate.fee === 'Request fee' ? (
                            <span className="text-[#2563eb] hover:underline cursor-pointer font-medium">
                              Request fee
                            </span>
                          ) : (
                            candidate.fee
                          )}
                        </span>
                      )}

                      {/* Interactive "Save ∨" Button & Popover */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveDropdownId(
                              activeDropdownId === candidate.id ? null : candidate.id
                            )
                          }
                          className="flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm transition"
                        >
                          <span>Save</span>
                          <ChevronDown className="w-3 h-3 text-gray-500" />
                        </button>

                        {/* POPOVER DROPDOWN MENU (Matches screenshot Gary Player state 1:1) */}
                        {activeDropdownId === candidate.id && (
                          <div className="absolute right-0 top-9 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-2.5 text-xs text-gray-700">
                            {/* Create List Item */}
                            <button
                              type="button"
                              className="w-full px-4 py-2 flex items-center gap-2 text-left hover:bg-gray-50 text-[#1e1b4b] font-medium"
                            >
                              <Plus className="w-3.5 h-3.5 text-[#4338ca]" />
                              <span>Create speaker list</span>
                            </button>

                            <div className="h-[1px] bg-gray-100 my-1.5" />

                            {/* List options with live counters */}
                            <div className="space-y-0.5">
                              {savedLists.map((list, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  className="w-full px-4 py-1.5 flex items-center justify-between text-left hover:bg-gray-50 transition"
                                >
                                  <div className="flex items-center gap-1.5 truncate pr-2">
                                    <span className="truncate">{list.title}</span>
                                    {list.isPrivate && (
                                      <EyeOff className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                    )}
                                  </div>
                                  <span className="text-gray-400 text-[11px] font-normal">
                                    {list.count}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* More Options Button */}
                      <button
                        type="button"
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Bottom Metadata (Lists & Comments Badges) */}
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      {candidate.listCount > 0 && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>{candidate.listCount} lists</span>
                        </div>
                      )}
                      {candidate.commentCount > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{candidate.commentCount}</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </main>
      </div>

    </div>
  );
}
