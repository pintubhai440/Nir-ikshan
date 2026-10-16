import React from 'react';
import { WaterBody, CitizenComplaint, UserRoleType } from '../types/nirikshan';
import { InteractiveIndiaMap } from './InteractiveIndiaMap';
import { useLanguage } from '../context/LanguageContext';
import { 
  Droplets, 
  ShieldCheck, 
  User, 
  Building2, 
  CheckCircle2, 
  ArrowRight
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
  const greenCount = waterBodies.filter((w) => w.statusColor === 'green').length;
  const blueCount = waterBodies.filter((w) => w.statusColor === 'blue').length;
  const yellowCount = waterBodies.filter((w) => w.statusColor === 'yellow').length;
  const redCount = waterBodies.filter((w) => w.statusColor === 'red').length;
  const greyCount = waterBodies.filter((w) => w.statusColor === 'grey').length;

  return (
    <div className="space-y-6">
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

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('bhuvanIntegrated')}</span>
            </span>
            <span className="bg-sky-500/20 text-sky-200 border border-sky-500/30 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5" />
              <span>{t('wrisSynced')}</span>
            </span>
            <span className="bg-purple-500/20 text-purple-200 border border-purple-500/30 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('sficTheme')}</span>
            </span>
          </div>
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

      {/* 5-Color Health Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {/* Green */}
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
              🟢 {t('statusGreenTitle')}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1">{greenCount}</div>
          <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">{t('statusGreenDesc')}</p>
        </div>

        {/* Blue */}
        <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-sky-800 uppercase tracking-wider">
              🔵 {t('statusBlueTitle')}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-900 mt-1">{blueCount}</div>
          <p className="text-[11px] text-sky-700 mt-0.5 font-medium">{t('statusBlueDesc')}</p>
        </div>

        {/* Yellow */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
              🟡 {t('statusYellowTitle')}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1">{yellowCount}</div>
          <p className="text-[11px] text-amber-700 mt-0.5 font-medium">{t('statusYellowDesc')}</p>
        </div>

        {/* Red */}
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider">
              🔴 {t('statusRedTitle')}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-900 mt-1">{redCount}</div>
          <p className="text-[11px] text-rose-700 mt-0.5 font-medium">{t('statusRedDesc')}</p>
        </div>

        {/* Grey */}
        <div className="bg-slate-100 border border-slate-300 p-4 rounded-2xl shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
              ⚪ {t('statusGreyTitle')}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">{greyCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{t('statusGreyDesc')}</p>
        </div>
      </div>

      {/* PRIMARY MAP: ALL-INDIA NATIONAL WATER GRID */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl flex items-center gap-2">
              <span>🇮🇳 {t('nationalMapTitle')}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('nationalMapDesc')}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 text-[#0047ab] border border-sky-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              <span>💧 {t('apReservoirsCount')}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>⛏️ {t('dwlrWellsCount')}</span>
            </span>

            <button
              onClick={() => onSelectRole('admin')}
              className="px-4 py-2 bg-gradient-to-r from-[#0047ab] to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>{t('openApCommand')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <InteractiveIndiaMap
          waterBodies={waterBodies}
          complaints={complaints}
          currentRole="admin"
          onLodgeComplaint={onOpenLodgeModal}
        />
      </div>
    </div>
  );
};
