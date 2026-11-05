import React from 'react';
import { UserRoleType } from '../types/nirikshan';
import { 
  Menu, 
  Droplets, 
  AlertTriangle, 
  Phone, 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  Wrench, 
  User,
  Compass,
  MoreVertical
} from 'lucide-react';

interface NirikshanTopBarProps {
  currentRole: UserRoleType;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenLodgeModal: () => void;
  onOpenDirectoryModal: () => void;
  totalComplaintsCount: number;
}

export const NirikshanTopBar: React.FC<NirikshanTopBarProps> = ({
  currentRole,
  isSidebarOpen,
  onToggleSidebar,
  onOpenLodgeModal,
  onOpenDirectoryModal,
  totalComplaintsCount,
}) => {
  const getRoleBadge = (role: UserRoleType) => {
    switch (role) {
      case 'admin':
        return {
          title: 'State Admin (AP Map)',
          icon: ShieldCheck,
          bg: 'bg-blue-100 text-[#0047ab] border-blue-300',
        };
      case 'nodal_vizianagaram':
        return {
          title: 'Nodal Officer • Vizianagaram',
          icon: Building2,
          bg: 'bg-sky-100 text-sky-800 border-sky-300',
        };
      case 'nodal_parvathipuram':
        return {
          title: 'Nodal Officer • Parvathipuram Manyam',
          icon: Building2,
          bg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        };
      case 'inspector':
        return {
          title: 'Field Inspector (TDS / Waste)',
          icon: UserCheck,
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'engineer':
        return {
          title: 'Action Worker (सफाई व मरम्मत)',
          icon: Wrench,
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      default:
        return {
          title: 'Normal Citizen User',
          icon: User,
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
        };
    }
  };

  const badgeInfo = getRoleBadge(currentRole);
  const BadgeIcon = badgeInfo.icon;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs w-full">
      {/* Top Official Strip */}
      <div className="bg-[#1b2a4a] text-white text-[11px] px-3 sm:px-4 py-1 flex items-center justify-between border-b border-blue-900/60 font-medium">
        <div className="flex items-center space-x-2 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="text-sky-200 text-[10px] sm:text-[11px] truncate">
            GOVT. OF ANDHRA PRADESH • WATER RESOURCES DEPT • VIZIANAGARAM & PARVATHIPURAM MANYAM
          </span>
        </div>

        <button
          onClick={onOpenDirectoryModal}
          className="text-[10px] font-bold text-amber-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer shrink-0 ml-2"
        >
          <Phone className="w-3 h-3" />
          <span className="hidden sm:inline">Helpline Directory</span>
        </button>
      </div>

      {/* Main Bar */}
      <div className="px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3 w-full">
        {/* Left: Three Dot Button & Active Role Indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* THREE DOT BUTTON (Click to open vertical menu, click again to close) */}
          <button
            onClick={onToggleSidebar}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0047ab] border border-blue-200 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer font-bold active:scale-95"
            title="Three Dot Menu: Select 5 Roles (तीन डॉट मेनू: 5 भूमिकाएं चुनें)"
          >
            <MoreVertical className="w-5 h-5 text-[#0047ab]" />
            <span className="text-xs font-bold hidden sm:inline">Roles Menu</span>
          </button>

          {/* Active Dashboard Badge */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 hidden md:inline">Current View:</span>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${badgeInfo.bg}`}>
              <BadgeIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-none">{badgeInfo.title}</span>
            </div>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLodgeModal}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lodge Complain</span>
            <span className="sm:hidden">Complain</span>
          </button>

          <button
            onClick={onOpenDirectoryModal}
            className="hidden sm:flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-[#0047ab]" />
            <span>Officers</span>
          </button>
        </div>
      </div>
    </header>
  );
};
