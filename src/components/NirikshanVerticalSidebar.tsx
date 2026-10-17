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
  CheckCircle2, 
  ChevronRight,
  X,
  MoreVertical
} from 'lucide-react';

interface NirikshanVerticalSidebarProps {
  currentRole: UserRoleType;
  onSelectRole: (role: UserRoleType) => void;
  authenticatedRoles: Record<UserRoleType, boolean>;
  onLogoutRole: (role: UserRoleType) => void;
  onOpenLodgeModal: () => void;
  onOpenDirectoryModal: () => void;
  totalComplaintsCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const NirikshanVerticalSidebar: React.FC<NirikshanVerticalSidebarProps> = ({
  currentRole,
  onSelectRole,
  authenticatedRoles,
  onLogoutRole,
  onOpenLodgeModal,
  onOpenDirectoryModal,
  totalComplaintsCount,
  isOpen,
  onClose,
}) => {
  const roleItems = [
    {
      role: 'admin' as UserRoleType,
      number: '1',
      title: 'Admin (AP State Map)',
      telugu: 'రాష్ట్ర నిర్వాహకుడు',
      desc: 'State-wide Andhra Pradesh map, Vizianagaram & Parvathipuram oversight',
      icon: ShieldCheck,
      badge: 'State AP',
      requiresAuth: true,
      color: 'blue',
    },
    {
      role: 'user' as UserRoleType,
      number: '2',
      title: 'Normal User (Citizen)',
      telugu: 'ప్రజా పౌరుడు (రైతు)',
      desc: 'No login needed • Auto-GPS hazard complaint & live tracker',
      icon: User,
      badge: 'Public / Free',
      requiresAuth: false,
      color: 'emerald',
    },
    {
      role: 'nodal_vizianagaram' as UserRoleType,
      number: '3',
      title: 'Nodal Officer (Vizianagaram)',
      telugu: 'విజయనగరం నోడల్ అధికారి',
      desc: 'Vizianagaram territory only • Triage complaints & dispatch inspector',
      icon: Building2,
      badge: 'Vizianagaram',
      requiresAuth: true,
      color: 'sky',
    },
    {
      role: 'nodal_parvathipuram' as UserRoleType,
      number: '3',
      title: 'Nodal Officer (Parvathipuram)',
      telugu: 'పార్వతీపురం నోడల్ అధికారి',
      desc: 'Parvathipuram Manyam territory only • Triage & dispatch inspector',
      icon: Building2,
      badge: 'Parvathipuram',
      requiresAuth: true,
      color: 'indigo',
    },
    {
      role: 'inspector' as UserRoleType,
      number: '5',
      title: 'Field Inspector (TDS / Waste)',
      telugu: 'క్షేత్ర స్థాయి తనిఖీదారు',
      desc: 'On-site GPS, machine TDS ppm, waste source pin & validation',
      icon: UserCheck,
      badge: 'Field Sensor',
      requiresAuth: true,
      color: 'teal',
    },
    {
      role: 'engineer' as UserRoleType,
      number: '4',
      title: 'Action Worker / Engineer',
      telugu: 'ఫీల్డ్ ఇంజనీరింగ్ వర్కర్',
      desc: 'Strict deadlines • Accept with Before-photo or Block with reason',
      icon: Wrench,
      badge: 'Action Worker',
      requiresAuth: true,
      color: 'amber',
    },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      }`}
    >
      {/* Semi-transparent Backdrop Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Slide-out Vertical Drawer Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-80 sm:w-88 max-w-[90vw] bg-white border-r border-slate-200 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding Section */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0047ab] via-[#0284c7] to-[#10b981] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-[#1b2a4a]">
                  Nir-ikshan
                </h1>
                <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Govt. of Andhra Pradesh
                </p>
              </div>
            </div>

            {/* Click to Close / Hide Drawer */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-[11px] text-slate-600 bg-blue-50/80 border border-blue-100 p-2 rounded-lg font-medium leading-snug">
            Water Surveillance, Citizen Hazard Grievance & Remedial Engineering System
          </div>

          {/* Prominent Lodge Complain Button */}
          <div className="mt-3">
            <button
              onClick={() => {
                onOpenLodgeModal();
                onClose();
              }}
              className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all hover:scale-101 active:scale-98 animate-pulse cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-white" />
              <span>Lodge Complaint</span>
            </button>
          </div>
        </div>

        {/* Middle Scrollable Section: Vertical User Roles */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="flex items-center justify-between px-2 pt-1 pb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              SELECT ROLE (5 भूमिकाएं)
            </span>
            <span className="text-[10px] font-mono text-[#0047ab] font-bold">
              {currentRole.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>

          {/* Vertical Stack of Roles */}
          <div className="space-y-2">
            {roleItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRole === item.role;
              const isAuthed = !item.requiresAuth || authenticatedRoles[item.role];

              return (
                <button
                  key={item.role}
                  onClick={() => {
                    onSelectRole(item.role);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#0047ab] to-blue-700 text-white border-[#0047ab] shadow-md ring-2 ring-blue-300'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  {/* Icon Box */}
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-50 text-[#0047ab] group-hover:bg-blue-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs font-bold truncate ${
                          isActive ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {item.title}
                      </span>

                      {/* Lock / Auth Status */}
                      {item.requiresAuth ? (
                        isAuthed ? (
                          <CheckCircle2
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? 'text-emerald-300' : 'text-emerald-600'
                            }`}
                          />
                        ) : (
                          <Lock
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? 'text-blue-200' : 'text-slate-400'
                            }`}
                          />
                        )
                      ) : (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                            isActive
                              ? 'bg-emerald-400/20 text-emerald-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          OPEN
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-[10px] mt-0.5 line-clamp-1 ${
                        isActive ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      {item.desc}
                    </p>

                    <div className="mt-1 flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                      <span
                        className={`text-[10px] font-medium ${
                          isActive ? 'text-blue-200' : 'text-slate-400'
                        }`}
                      >
                        {item.telugu}
                      </span>
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 mt-2 transition-transform ${
                      isActive ? 'text-white translate-x-0.5' : 'text-slate-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom User Actions & Directory */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
          {/* Officer Directory button */}
          <button
            onClick={() => {
              onOpenDirectoryModal();
              onClose();
            }}
            className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#0047ab]" />
              <span>Officer Directory & Contacts</span>
            </div>
            <span className="text-[10px] font-mono bg-blue-50 text-[#0047ab] px-1.5 py-0.5 rounded font-bold">
              VERIFIED
            </span>
          </button>

          {/* If currentRole is an authenticated role, provide Exit/Logout button */}
          {currentRole !== 'user' && (
            <button
              onClick={() => {
                onLogoutRole(currentRole);
                onClose();
              }}
              className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Role (Switch to Citizen)</span>
            </button>
          )}

          {/* Credentials info note */}
          <div className="text-[10px] text-slate-500 font-mono text-center pt-1 border-t border-slate-200/60">
            Login: <span className="font-bold text-slate-700">admin@nir.com</span> | Pass: <span className="font-bold text-slate-700">1234</span>
          </div>
        </div>
      </aside>
    </div>
  );
};
