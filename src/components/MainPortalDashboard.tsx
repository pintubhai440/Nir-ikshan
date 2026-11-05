import React from 'react';
import { WaterBody, CitizenComplaint, UserRoleType } from '../types/nirikshan';
import { InteractiveIndiaMap } from './InteractiveIndiaMap';
import { useLanguage } from '../context/LanguageContext';
import { 
  User, 
  Building2, 
  ArrowRight,
} from 'lucide-react';

interface MainPortalDashboardProps {
  waterBodies: WaterBody[];
  complaints: CitizenComplaint[];
  onSelectRole: (role: UserRoleType) => void;
  onOpenLodgeModal: () => void;
  onOpenDirectoryModal: () => void;
}

export const MainPortalDashboard: React.FC<MainPortalDashboardProps> = ({
  waterBodies,
  complaints,
  onSelectRole,
  onOpenLodgeModal,
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-[#03045E] via-[#0077B6] to-[#00B4D8] text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-white/20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative overflow-hidden">
        {/* Glow ambient background accent */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-blue-500/15 blur-3xl pointer-events-none"></div>

        <div className="space-y-2.5 max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1 rounded-full text-xs font-mono text-sky-200 border border-white/15">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{t('ecosystemTag')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            {t('heroTitle')}
          </h2>

          <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
            {t('heroDescription')}
          </p>
        </div>

        {/* Quick Portal Switch Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full sm:w-auto shrink-0 relative z-10">
          <button
            onClick={() => onSelectRole('user')}
            className="w-full px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-[#0047ab] font-bold text-xs sm:text-sm shadow-md flex items-center justify-between gap-3 transition-transform active:scale-95 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>{t('btnCitizenPortal')}</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectRole('admin')}
            className="w-full px-5 py-3 rounded-2xl bg-blue-600/90 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm border border-blue-400/30 shadow-md flex items-center justify-between gap-3 transition-transform active:scale-95 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-300" />
              <span>{t('btnAdminPortal')}</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PRIMARY MAP: ALL-INDIA NATIONAL WATER GRID */}
      <div>
        <InteractiveIndiaMap
          waterBodies={waterBodies}
          complaints={complaints}
          currentRole="admin"
          initialStatusFilter="all"
          onStatusFilterChange={() => {}}
          onLodgeComplaint={onOpenLodgeModal}
        />
      </div>
    </div>
  );
};
