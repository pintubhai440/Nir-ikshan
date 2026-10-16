import React from 'react';
import { UserRoleType } from '../types/nirikshan';
import { 
  Droplets, 
  ShieldCheck, 
  User, 
  Building2, 
  UserCheck, 
  Wrench, 
  AlertTriangle, 
  Phone, 
  Lock, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';

interface NirikshanNavbarProps {
  currentRole: UserRoleType;
  onSelectRole: (role: UserRoleType) => void;
  authenticatedRoles: Record<UserRoleType, boolean>;
  onLogoutRole: (role: UserRoleType) => void;
  onOpenLodgeModal: () => void;
  onOpenDirectoryModal: () => void;
  totalComplaintsCount: number;
}

export const NirikshanNavbar: React.FC<NirikshanNavbarProps> = ({
  currentRole,
  onSelectRole,
  authenticatedRoles,
  onLogoutRole,
  onOpenLodgeModal,
  onOpenDirectoryModal,
  totalComplaintsCount,
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -220, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 220, behavior: 'smooth' });
  };

  const roleNavItems = [
    {
      role: 'user' as UserRoleType,
      number: '2',
      label: 'Normal User (Citizen)',
      icon: User,
      requiresAuth: false,
    },
    {
      role: 'admin' as UserRoleType,
      number: '1',
      label: 'Admin (AP State Map)',
      icon: ShieldCheck,
      requiresAuth: true,
    },
    {
      role: 'nodal_vizianagaram' as UserRoleType,
      number: '3',
      label: 'Nodal Officer (Vizianagaram)',
      icon: Building2,
      requiresAuth: true,
    },
    {
      role: 'nodal_parvathipuram' as UserRoleType,
      number: '3',
      label: 'Nodal Officer (Parvathipuram)',
      icon: Building2,
      requiresAuth: true,
    },
    {
      role: 'inspector' as UserRoleType,
      number: '5',
      label: 'Field Inspector (TDS / Waste)',
      icon: UserCheck,
      requiresAuth: true,
    },
    {
      role: 'engineer' as UserRoleType,
      number: '4',
      label: 'Action Worker / Engineer',
      icon: Wrench,
      requiresAuth: true,
    },
  ];

  return (
    <header className="w-full bg-white border-b border-blue-100 shadow-sm sticky top-0 z-40">
      {/* Topmost Official Strip */}
      <div className="bg-[#1b2a4a] text-white text-[11px] px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-blue-900/60 font-medium">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1.5 text-sky-200">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            GOVT. OF ANDHRA PRADESH • WATER RESOURCES DEPARTMENT • SEVA FIRST WATER GRID
          </span>
          <span className="text-blue-400/60 hidden md:inline">|</span>
          <span className="hidden lg:inline text-blue-200 font-mono text-[10px]">
            JURISDICTION: VIZIANAGARAM & PARVATHIPURAM MANYAM DISTRICTS
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs ml-auto">
          <button
            onClick={onOpenDirectoryModal}
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-sky-200 px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer"
          >
            <Phone className="w-3 h-3 text-amber-300" />
            <span>Official Helpline & Contacts</span>
          </button>
        </div>
      </div>

      {/* Main Branding & Quick Actions Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Title and Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0047ab] via-[#0284c7] to-[#10b981] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-[#1b2a4a]">
                Nir-ikshan
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                5-Role Ecosystem
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Andhra Pradesh Water Surveillance, Citizen Hazard Grievance & Remedial Engineering Engine
            </p>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenLodgeModal}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-102 active:scale-98 animate-pulse"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Lodge Complaint</span>
          </button>

          {/* If protected role is logged in, show sign-out option */}
          {currentRole !== 'user' && (
            <button
              onClick={() => onLogoutRole(currentRole)}
              className="flex items-center gap-1 text-slate-500 hover:text-rose-600 px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-rose-50 transition-colors"
              title="Sign Out to Normal User"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Role</span>
            </button>
          )}
        </div>
      </div>

      {/* 5-User Dashboard Switcher Tabs with Horizontal Slider Controls */}
      <div className="border-t border-slate-200 bg-slate-50/80">
        <div className="max-w-7xl mx-auto px-2 relative flex items-center">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="p-1.5 text-slate-600 hover:text-white bg-white hover:bg-[#0047ab] border border-slate-200 rounded-lg shadow-2xs mr-1 transition-colors"
            title="Slide left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Tabs */}
          <div
            ref={scrollRef}
            className="flex-1 flex items-center overflow-x-auto space-x-1.5 py-1.5 scrollbar-none scroll-smooth select-none"
          >
            {roleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRole === item.role;
              const isAuthed = !item.requiresAuth || authenticatedRoles[item.role];

              return (
                <button
                  key={item.role}
                  onClick={() => onSelectRole(item.role)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#0047ab] text-white shadow-sm ring-1 ring-blue-600'
                      : 'text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#0047ab]'}`} />
                  <span>{item.label}</span>
                  {item.requiresAuth && !isAuthed && (
                    <Lock className={`w-3 h-3 ${isActive ? 'text-blue-200' : 'text-slate-400'}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="p-1.5 text-slate-600 hover:text-white bg-white hover:bg-[#0047ab] border border-slate-200 rounded-lg shadow-2xs ml-1 transition-colors"
            title="Slide right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
