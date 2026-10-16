import React, { useRef } from 'react';
import { 
  Droplets, 
  MapPin, 
  Layers, 
  Sliders, 
  ShieldAlert, 
  CheckCircle2, 
  Database, 
  ExternalLink,
  Activity,
  Award,
  Users,
  ChevronLeft,
  ChevronRight,
  Flame,
  AlertOctagon
} from 'lucide-react';

interface HeaderNavbarProps {
  activeTab: 'map' | 'ledger' | 'assets' | 'simulator' | 'tasks' | 'audit' | 'stakeholders' | 'complaints' | 'sources';
  setActiveTab: (tab: 'map' | 'ledger' | 'assets' | 'simulator' | 'tasks' | 'audit' | 'stakeholders' | 'complaints' | 'sources') => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  activeAlertsCount: number;
  endangeredComplaintsCount: number;
  onOpenReportEndangered: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedRole,
  setSelectedRole,
  activeAlertsCount,
  endangeredComplaintsCount,
  onOpenReportEndangered,
}) => {
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      tabsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  interface NavTabItem {
    id: HeaderNavbarProps['activeTab'];
    num: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isHazard?: boolean;
  }

  const navTabs: NavTabItem[] = [
    { id: 'map', num: '1', label: 'Interactive Water Map', icon: MapPin },
    { id: 'ledger', num: '2', label: 'Water Accountability Ledger', icon: Layers },
    { id: 'assets', num: '3', label: 'Recharge Asset Registry & Field Audit', icon: CheckCircle2 },
    { id: 'simulator', num: '4', label: 'What-If Simulator', icon: Sliders },
    { id: 'tasks', num: '5', label: 'Action Center & Tasks', icon: ShieldAlert },
    { id: 'audit', num: '6', label: '"Did It Work?" Impact Audit', icon: Activity },
    { id: 'stakeholders', num: '7', label: 'Stakeholder Directory', icon: Users },
    { id: 'complaints', num: '8', label: `Endangered Complaints (${endangeredComplaintsCount})`, icon: Flame, isHazard: true },
    { id: 'sources', num: '9', label: 'Data Integrity & WRIS', icon: Database },
  ];

  return (
    <header className="w-full bg-white border-b border-blue-100 shadow-sm sticky top-0 z-40">
      {/* Topmost National Portal Authority Strip */}
      <div className="bg-[#1b2a4a] text-white text-[11px] px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-blue-900/50 font-medium">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1.5 text-blue-200">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            GOVERNMENT OF INDIA • MINISTRY OF JAL SHAKTI • DEPT. OF WATER RESOURCES
          </span>
          <span className="text-blue-400/60 hidden md:inline">|</span>
          <span className="hidden lg:inline text-sky-200">
            SEVA FIRST INNOVATION CHALLENGE (SFIC 2026) • THEME 2: SAMRIDDH ANNADATA, SAMRIDDH BHARAT
          </span>
        </div>

        <div className="flex items-center space-x-3 ml-auto text-xs">
          <span className="bg-blue-900/90 text-sky-200 px-2.5 py-0.5 rounded border border-blue-700/60 font-mono text-[10px] flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-300" />
            South Zone Nodal: IISc Bengaluru
          </span>
          <div className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-mono border border-emerald-700/40">
            <Activity className="w-3 h-3 animate-spin" />
            GRID SURVEILLANCE NODE ACTIVE
          </div>
        </div>
      </div>

      {/* Main Branding & Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Title and Identity */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#0047ab] via-[#0284c7] to-[#0096d6] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-[#1b2a4a]">
                Nir-ikshan
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-[#0047ab] px-2 py-0.5 rounded border border-sky-200">
                Micro-Watershed Ledger
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              National Micro-Watershed Water Accountability, Surveillance Grid & Intervention Engine
            </p>
          </div>
        </div>

        {/* User Role Switcher, Report Endangered Button & Live Alerts */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Report Endangered Zone Button (Requested by User) */}
          <button
            onClick={onOpenReportEndangered}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all hover:shadow-md animate-pulse"
            title="Lodge an urgent public complaint with photo/screenshot evidence"
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>Report Endangered Zone / Complain</span>
          </button>

          {/* Audit Role Selector */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
            <span className="text-slate-500 font-medium px-2 text-[11px]">Audit Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 rounded px-2 py-1 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Watershed Officer (District Level)">Watershed Officer (District Level)</option>
              <option value="Gram Panchayat Water SPOC">Gram Panchayat Water SPOC</option>
              <option value="CGWB Hydrologist">CGWB Hydrologist</option>
              <option value="Community Social Auditor">Community Social Auditor</option>
            </select>
          </div>

          {activeAlertsCount > 0 && (
            <div 
              onClick={() => setActiveTab('map')} 
              className="cursor-pointer flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
              <span>{activeAlertsCount} Stress Alerts</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Module Navigation Tabs with Smooth Horizontal Slider Controls (Roadmap & User Request) */}
      <div className="border-t border-slate-200/80 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-2 relative flex items-center">
          {/* Left Slider Arrow Button */}
          <button
            onClick={() => scrollTabs('left')}
            className="shrink-0 p-1.5 text-slate-600 hover:text-white bg-white hover:bg-[#0047ab] border border-slate-200 rounded-lg shadow-xs transition-colors z-10 mr-1"
            title="Slide left to view previous tabs"
            aria-label="Slide tabs left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Tabs Track */}
          <div
            ref={tabsScrollRef}
            className="flex-1 flex items-center overflow-x-auto space-x-1.5 py-1.5 scrollbar-thin scrollbar-thumb-blue-300 scroll-smooth select-none"
            style={{ scrollbarWidth: 'thin' }}
          >
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? tab.isHazard
                        ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-500'
                        : 'bg-[#0047ab] text-white shadow-sm ring-1 ring-blue-600'
                      : tab.isHazard
                      ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                      : 'text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.isHazard ? 'text-rose-600' : 'text-[#0047ab]'}`} />
                  <span>{tab.num}. {tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Slider Arrow Button */}
          <button
            onClick={() => scrollTabs('right')}
            className="shrink-0 p-1.5 text-slate-600 hover:text-white bg-white hover:bg-[#0047ab] border border-slate-200 rounded-lg shadow-xs transition-colors z-10 ml-1"
            title="Slide right to view next tabs"
            aria-label="Slide tabs right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
