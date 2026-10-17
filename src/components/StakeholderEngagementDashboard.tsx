import React, { useState } from 'react';
import { MicroWatershed, StakeholderContact, GramSabhaMeeting, GrievanceSubmission } from '../types/watershed';
import { 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  MessageSquare, 
  Send, 
  Calendar, 
  Building2, 
  Award, 
  Copy, 
  Check, 
  Filter, 
  Search,
  ExternalLink,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StakeholderEngagementDashboardProps {
  watersheds: MicroWatershed[];
  selectedWatershedId: string;
  onSelectWatershed: (id: string) => void;
  userRole: string;
}

export const StakeholderEngagementDashboard: React.FC<StakeholderEngagementDashboardProps> = ({
  watersheds,
  selectedWatershedId,
  onSelectWatershed,
  userRole,
}) => {
  const currentWs = watersheds.find((w) => w.id === selectedWatershedId) || watersheds[0];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  // Grievance / Escalation Modal
  const [escalatingStakeholder, setEscalatingStakeholder] = useState<StakeholderContact | null>(null);
  const [citizenName, setCitizenName] = useState<string>('');
  const [citizenPhone, setCitizenPhone] = useState<string>('');
  const [citizenVillage, setCitizenVillage] = useState<string>(currentWs.district + ' Village Ward');
  const [issueType, setIssueType] = useState<GrievanceSubmission['issueType']>('Broken Check Dam');
  const [issueDescription, setIssueDescription] = useState<string>('');
  
  // Live Grievance Queue
  const [grievances, setGrievances] = useState<GrievanceSubmission[]>([
    {
      id: 'GRV-2026-081',
      watershedId: currentWs.id,
      citizenName: 'Ramesh Gowda',
      citizenPhone: '+91 98450 11223',
      assignedToStakeholderId: 'STK-KLR-02',
      issueType: 'Broken Check Dam',
      description: 'Breached stone masonry on Palavanhalli upstream nala causing runoff waste into road.',
      village: 'Palavanhalli',
      status: 'FORWARDED_TO_PANCHAYAT',
      timestamp: '2026-10-01 14:30 IST',
    },
    {
      id: 'GRV-2026-079',
      watershedId: currentWs.id,
      citizenName: 'Sunita Bai',
      citizenPhone: '+91 97412 88410',
      assignedToStakeholderId: 'STK-KLR-04',
      issueType: 'Choked Recharge Well',
      description: 'Filter media clogged with silt after sudden heavy rain spell; water backing up.',
      village: 'Kundahalli',
      status: 'FIELD_INVESTIGATION',
      timestamp: '2026-09-28 11:15 IST',
    }
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    triggerToast(`Phone number ${phone} copied to clipboard!`);
    setTimeout(() => setCopiedPhoneId(null), 2500);
  };

  const handleOpenEscalateModal = (stakeholder: StakeholderContact) => {
    setEscalatingStakeholder(stakeholder);
    setIssueDescription(`Urgent attention required regarding recharge structure condition in ${currentWs.name}.`);
  };

  const getWhatsAppUrl = (stakeholder: StakeholderContact) => {
    const rawDigits = stakeholder.phone.replace(/[^0-9]/g, '');
    const cleanPhone = rawDigits.startsWith('91') ? rawDigits : `91${rawDigits}`;
    const textMsg = encodeURIComponent(
      `Respected ${stakeholder.name} (${stakeholder.designation}),\n\nI am contacting you regarding micro-watershed water accountability in *${currentWs.name}* (District: ${currentWs.district}, Code: ${currentWs.code}). Current status is *${currentWs.currentStatus.toUpperCase()}* with ${currentWs.needsRepairCount} recharge assets needing desiltation/repairs.\n\nKindly advise on the Gram Sabha / VWSC schedule and maintenance timeline.\n\nSent via Nir-ikshan National Portal.`
    );
    return `https://wa.me/${cleanPhone}?text=${textMsg}`;
  };

  const handleSubmitGrievance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalatingStakeholder) return;

    const newGrv: GrievanceSubmission = {
      id: `GRV-2026-${Math.floor(100 + Math.random() * 900)}`,
      watershedId: currentWs.id,
      citizenName: citizenName || 'Concerned Citizen',
      citizenPhone: citizenPhone || '+91 98000 00000',
      assignedToStakeholderId: escalatingStakeholder.id,
      issueType,
      description: issueDescription,
      village: citizenVillage,
      status: 'SUBMITTED',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST',
    };

    setGrievances([newGrv, ...grievances]);
    setEscalatingStakeholder(null);

    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#0284c7', '#0047ab', '#10b981'],
    });

    triggerToast(`Grievance ${newGrv.id} successfully lodged and dispatched to ${escalatingStakeholder.name}!`);
  };

  const stakeholders = currentWs.stakeholders || [];
  const upcomingMeetings = currentWs.upcomingMeetings || [];

  // Filter
  const filteredStakeholders = stakeholders.filter((s) => {
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.villageOrOffice.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getCategoryBadge = (cat: StakeholderContact['category']) => {
    switch (cat) {
      case 'Gram Panchayat':
        return 'bg-blue-50 text-[#0047ab] border-blue-200';
      case 'Water Committee':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Nodal Officer':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Community Auditor':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1b2a4a] text-white px-5 py-3 rounded-xl shadow-xl border border-sky-400 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div className="text-xs">
            <div className="font-bold text-white">Community Engagement Alert</div>
            <div className="text-blue-200">{toastMessage}</div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-100 text-[#0047ab]">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Stakeholder Engagement & Social Accountability (हितधारक संपर्क एवं जवाबदेही)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Direct public directory connecting Gram Panchayat leaders, Water Committees, and Nodal Officers for micro-watershed action.
              </p>
            </div>
          </div>
        </div>

        {/* Watershed Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600">Watershed:</label>
          <select
            value={currentWs.id}
            onChange={(e) => onSelectWatershed(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg px-3 py-2 cursor-pointer"
          >
            {watersheds.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.district} — {ws.name.split('(')[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Accountability Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Verified Stakeholders</span>
            <UserCheck className="w-4 h-4 text-[#0047ab]" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {stakeholders.length}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Panchayat + VWSC + Nodal
          </span>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
            <span>Grievances Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {stakeholders.reduce((acc, s) => acc + s.grievancesResolvedCount, 0)}
          </div>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">
            Audited physical closures
          </span>
        </div>

        <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-blue-800 font-semibold">
            <span>Upcoming Gram Sabhas</span>
            <Calendar className="w-4 h-4 text-[#0047ab]" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-900 mt-1">
            {upcomingMeetings.length}
          </div>
          <span className="text-[10px] text-blue-600 mt-0.5 block">
            Scheduled public water assemblies
          </span>
        </div>

        <div className="bg-purple-50/70 border border-purple-200 p-3.5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-purple-800 font-semibold">
            <span>South Zone Nodal Liaison</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-sm font-bold text-purple-950 mt-1 truncate">
            IISc Bengaluru
          </div>
          <span className="text-[10px] text-purple-600 mt-0.5 block">
            SFIC South Zone Desk
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, designation, Gram Panchayat, or office..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-slate-800 border-none focus:outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Stakeholders' },
            { id: 'Gram Panchayat', label: '🏛️ Gram Panchayat' },
            { id: 'Water Committee', label: '💧 Water Committee (VWSC)' },
            { id: 'Nodal Officer', label: '🎯 Nodal Officers' },
            { id: 'Community Auditor', label: '👥 Community Auditors' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#0047ab] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stakeholders Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStakeholders.map((person) => (
          <div
            key={person.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
          >
            {/* Top Person Info */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={person.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80'}
                    alt={person.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 shadow-xs"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {person.name}
                    </h3>
                    <div className="text-xs font-semibold text-[#0047ab] mt-0.5 leading-tight">
                      {person.designation}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category & Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadge(person.category)}`}>
                  {person.category}
                </span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {person.grievancesResolvedCount} Resolved
                </span>
              </div>

              {/* Contact Details Block */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 text-xs text-slate-600 font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <a href={`tel:${person.phone}`} className="text-slate-900 font-semibold hover:underline">
                      {person.phone}
                    </a>
                  </div>
                  <button
                    onClick={() => handleCopyPhone(person.phone, person.id)}
                    className="text-[10px] text-slate-400 hover:text-blue-600 p-1 transition-colors"
                    title="Copy phone"
                  >
                    {copiedPhoneId === person.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <a href={`mailto:${person.email}`} className="text-slate-700 hover:underline truncate" title={person.email}>
                    {person.email}
                  </a>
                </div>

                <div className="flex items-start gap-1.5 font-sans text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{person.villageOrOffice}</span>
                </div>

                <div className="flex items-center gap-1.5 font-sans text-[11px] text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{person.availability}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2">
              <a
                href={`tel:${person.phone}`}
                className="py-2 px-2 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                title="Direct Voice Call"
              >
                <Phone className="w-3 h-3 text-blue-600" />
                <span>Call</span>
              </a>

              <a
                href={getWhatsAppUrl(person)}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-2 text-center text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                title="Escalate via WhatsApp"
              >
                <MessageSquare className="w-3 h-3 text-emerald-600" />
                <span>WhatsApp</span>
              </a>

              <button
                onClick={() => handleOpenEscalateModal(person)}
                className="py-2 px-2 text-center text-xs font-bold text-white bg-[#0047ab] hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1"
                title="Log formal community grievance"
              >
                <Send className="w-3 h-3" />
                <span>Lodge</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Public Water Assembly & Gram Sabha Calendar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0047ab]" />
              Scheduled Gram Sabha Water Assemblies & Social Audits
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Public participatory meetings where community water budgets, check dam repairs, and borewell permits are presented.
            </p>
          </div>
          <span className="text-[11px] font-mono bg-blue-50 text-[#0047ab] px-2.5 py-1 rounded border border-blue-200 font-bold">
            STATUTORY SOCIAL AUDIT
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingMeetings.map((mtg) => (
            <div
              key={mtg.id}
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#0047ab] bg-white px-2.5 py-1 rounded border border-slate-200 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {mtg.date}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Est. {mtg.attendeesExpected} Attendees
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {mtg.title}
                </h4>

                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{mtg.location}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                  <strong>Agenda:</strong> {mtg.agenda}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Open to all village residents & farmers
                </span>
                <button
                  onClick={() => triggerToast(`Meeting reminder set for ${mtg.title}`)}
                  className="text-xs font-bold text-[#0047ab] hover:underline"
                >
                  Set Reminder
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Water Grievance Tracker */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Community Water Grievance & Issue Escalation Feed
            </h3>
            <p className="text-xs text-slate-500">
              Citizens and farmers can track status of reported structure damage or water shortages.
            </p>
          </div>
          <span className="text-xs font-mono bg-white px-2.5 py-1 rounded border border-slate-200 text-slate-700 font-semibold">
            {grievances.length} Active Public Issues
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {grievances.map((grv) => (
            <div key={grv.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {grv.id}
                  </span>
                  <span className="font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {grv.issueType}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    grv.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                    grv.status === 'FIELD_INVESTIGATION' ? 'bg-sky-100 text-sky-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {grv.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-slate-800 font-medium pt-0.5">
                  {grv.description}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 text-[11px] text-slate-500 font-mono">
                  <span>Reported by: <strong>{grv.citizenName}</strong> ({grv.village})</span>
                  <span>Time: {grv.timestamp}</span>
                </div>
              </div>

              <div className="shrink-0">
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-semibold">
                  Assigned to Gram Panchayat
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Escalate / Submit Grievance Modal */}
      {escalatingStakeholder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-[#1b2a4a] text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-sky-300 uppercase tracking-wider block">
                  PUBLIC SOCIAL ACCOUNTABILITY TICKET
                </span>
                <h3 className="text-base font-bold text-white">
                  Lodge Community Water Issue
                </h3>
              </div>
              <button
                onClick={() => setEscalatingStakeholder(null)}
                className="text-slate-300 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitGrievance} className="p-5 space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs space-y-1">
                <div className="font-bold text-[#1b2a4a]">
                  Directly Assigned Officer:
                </div>
                <div className="text-slate-700 font-semibold">
                  {escalatingStakeholder.name} — {escalatingStakeholder.designation}
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  {escalatingStakeholder.villageOrOffice}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Your Name (Citizen / Farmer)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full text-xs text-slate-800 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98XXX XXXXX"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    className="w-full text-xs text-slate-800 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Issue Category
                  </label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value as any)}
                    className="w-full text-xs text-slate-800 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="Broken Check Dam">Broken Check Dam / Spillway</option>
                    <option value="Choked Recharge Well">Choked Recharge Well / Filter</option>
                    <option value="Illegal Tanker Extraction">Illegal Commercial Extraction</option>
                    <option value="Silted Lake Inlet">Silted Lake Feeder Canal</option>
                    <option value="Drinking Water Shortage">Drinking Water Shortage</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Village / Locality
                  </label>
                  <input
                    type="text"
                    required
                    value={citizenVillage}
                    onChange={(e) => setCitizenVillage(e.target.value)}
                    className="w-full text-xs text-slate-800 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Issue Description & Landmark Details
                </label>
                <textarea
                  rows={3}
                  required
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Provide precise location, condition of structure, how many families affected..."
                  className="w-full text-xs text-slate-800 border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEscalatingStakeholder(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0047ab] hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Ticket to Official
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
