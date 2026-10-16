import React, { useState } from 'react';
import { UserRoleType } from '../types/nirikshan';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, 
  User, 
  Building2, 
  UserCheck, 
  Wrench, 
  ShieldCheck, 
  Globe, 
  MapPin, 
  LogOut, 
  AlertTriangle, 
  Phone, 
  ChevronRight, 
  ChevronDown,
  CheckCircle2,
  Layers
} from 'lucide-react';

interface NirikshanSlideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRoleType;
  onSelectRole: (role: UserRoleType) => void;
  currentUser: { name: string; phone: string } | null;
  onLogout: () => void;
  onOpenLodgeModal: () => void;
  onOpenDirectoryModal: () => void;
  selectedNodalDistrict: string;
  onSelectNodalDistrict: (district: string) => void;
}

export const NirikshanSlideDrawer: React.FC<NirikshanSlideDrawerProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
  currentUser,
  onLogout,
  onOpenLodgeModal,
  onOpenDirectoryModal,
  selectedNodalDistrict,
  onSelectNodalDistrict,
}) => {
  const { t } = useLanguage();
  const [isNodalExpanded, setIsNodalExpanded] = useState(true);

  if (!isOpen) return null;

  const handleRoleClick = (role: UserRoleType) => {
    onSelectRole(role);
    onClose();
  };

  const handleDistrictSelect = (district: string) => {
    onSelectNodalDistrict(district);
    if (district === 'Vizianagaram') {
      onSelectRole('nodal_vizianagaram');
    } else if (district === 'Parvathipuram Manyam') {
      onSelectRole('nodal_parvathipuram');
    } else if (district === 'Visakhapatnam') {
      onSelectRole('nodal_visakhapatnam');
    } else {
      onSelectRole('nodal_vizianagaram');
    }
    onClose();
  };

  const isNodalActive = 
    currentRole === 'nodal_vizianagaram' || 
    currentRole === 'nodal_parvathipuram' || 
    currentRole === 'nodal_visakhapatnam';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-slide-left">
          
          {/* Top Drawer Header (Palette: #03045E & #0077B6) */}
          <div className="bg-gradient-to-r from-[#03045E] via-[#0077B6] to-[#00B4D8] text-white p-5 sm:p-6 shadow-md relative overflow-hidden shrink-0">
            <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#CAF0F8]">
                  {t('commandNav')}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title={t('close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Card */}
            {currentUser && (
              <div className="mt-4 p-3.5 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-xs flex items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#03045E] font-extrabold flex items-center justify-center text-base shadow-sm">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {currentUser.name || t('citizenUser')}
                    </h4>
                    <p className="text-xs text-[#CAF0F8] font-mono mt-0.5">
                      +91 {currentUser.phone || '9848012345'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  title={t('logout')}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Drawer Menu Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#0077B6]" />
                <span>{t('userRolesAndPortals')}</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-[#0077B6] font-bold border border-blue-200">
                {t('directAccess')}
              </span>
            </div>

            {/* Quick Citizen Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <button
                onClick={() => {
                  onOpenLodgeModal();
                  onClose();
                }}
                className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t('lodgeComplaint')}</span>
              </button>

              <button
                onClick={() => {
                  onOpenDirectoryModal();
                  onClose();
                }}
                className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-[#0077B6]" />
                <span>{t('officersDirectory')}</span>
              </button>
            </div>

            {/* 1. Portal Home (National Grid) */}
            <button
              onClick={() => handleRoleClick('overview')}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                currentRole === 'overview'
                  ? 'bg-[#03045E] text-white border-[#03045E] shadow-md'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  currentRole === 'overview' ? 'bg-white/20 text-[#CAF0F8]' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold leading-tight">{t('roleOverview')}</h5>
                  <p className={`text-xs mt-0.5 ${currentRole === 'overview' ? 'text-[#CAF0F8]' : 'text-slate-500'}`}>
                    {t('roleOverviewDesc')}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                currentRole === 'overview' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {t('tagNational')}
              </span>
            </button>

            {/* 2. Normal User (Citizen) */}
            <button
              onClick={() => handleRoleClick('user')}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                currentRole === 'user'
                  ? 'bg-[#0077B6] text-white border-[#0077B6] shadow-md'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  currentRole === 'user' ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#0077B6]'
                }`}>
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold leading-tight">{t('roleUser')}</h5>
                  <p className={`text-xs mt-0.5 ${currentRole === 'user' ? 'text-blue-100' : 'text-slate-500'}`}>
                    {t('roleUserDesc')}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                currentRole === 'user' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {t('tagPublic')}
              </span>
            </button>

            {/* 3. State Admin */}
            <button
              onClick={() => handleRoleClick('admin')}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                currentRole === 'admin'
                  ? 'bg-[#0077B6] text-white border-[#0077B6] shadow-md'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  currentRole === 'admin' ? 'bg-white/20 text-white' : 'bg-sky-50 text-sky-700'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold leading-tight">{t('roleAdmin')}</h5>
                  <p className={`text-xs mt-0.5 ${currentRole === 'admin' ? 'text-sky-100' : 'text-slate-500'}`}>
                    {t('roleAdminDesc')}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                currentRole === 'admin' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {t('tagAdmin')}
              </span>
            </button>

            {/* 4. Nodal Officer (Single menu with 3 District circles) */}
            <div className={`rounded-2xl border transition-all overflow-hidden ${
              isNodalActive
                ? 'border-[#0077B6] bg-blue-50/50 shadow-xs'
                : 'border-slate-200 bg-white'
            }`}>
              <div 
                onClick={() => setIsNodalExpanded(!isNodalExpanded)}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isNodalActive ? 'bg-[#0077B6] text-white' : 'bg-blue-50 text-[#0077B6]'
                  }`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold leading-tight text-slate-900">{t('roleNodal')}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t('roleNodalDesc')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-[#0077B6] font-bold">
                    {t('tagDistrict')}
                  </span>
                  {isNodalExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Sub-District Selection with Strict District Isolation */}
              {isNodalExpanded && (
                <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-slate-100 bg-slate-50/80">
                  <p className="text-[10px] text-slate-500 font-medium px-1">
                    {t('tagStrictIsolation')}
                  </p>

                  {/* Parvathipuram Manyam */}
                  <button
                    onClick={() => handleDistrictSelect('Parvathipuram Manyam')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      currentRole === 'nodal_parvathipuram'
                        ? 'bg-[#0077B6] text-white shadow-xs font-bold'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>Parvathipuram Manyam</span>
                    </div>
                    {currentRole === 'nodal_parvathipuram' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>

                  {/* Vizianagaram */}
                  <button
                    onClick={() => handleDistrictSelect('Vizianagaram')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      currentRole === 'nodal_vizianagaram'
                        ? 'bg-[#0077B6] text-white shadow-xs font-bold'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <span>Vizianagaram Circle</span>
                    </div>
                    {currentRole === 'nodal_vizianagaram' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>

                  {/* Visakhapatnam */}
                  <button
                    onClick={() => handleDistrictSelect('Visakhapatnam')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      currentRole === 'nodal_visakhapatnam'
                        ? 'bg-[#0077B6] text-white shadow-xs font-bold'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Visakhapatnam Circle</span>
                    </div>
                    {currentRole === 'nodal_visakhapatnam' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* 5. Field Inspector (NO MAP) */}
            <button
              onClick={() => handleRoleClick('inspector')}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                currentRole === 'inspector'
                  ? 'bg-[#0077B6] text-white border-[#0077B6] shadow-md'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  currentRole === 'inspector' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold leading-tight">{t('roleInspector')}</h5>
                  <p className={`text-xs mt-0.5 ${currentRole === 'inspector' ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {t('roleInspectorDesc')}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                currentRole === 'inspector' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {t('tagNoMap')}
              </span>
            </button>

            {/* 6. Action Worker (FULL MAP) */}
            <button
              onClick={() => handleRoleClick('engineer')}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                currentRole === 'engineer'
                  ? 'bg-[#0077B6] text-white border-[#0077B6] shadow-md'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  currentRole === 'engineer' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'
                }`}>
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold leading-tight">{t('roleEngineer')}</h5>
                  <p className={`text-xs mt-0.5 ${currentRole === 'engineer' ? 'text-amber-100' : 'text-slate-500'}`}>
                    {t('roleEngineerDesc')}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                currentRole === 'engineer' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {t('tagFullMap')}
              </span>
            </button>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono">{t('siteTitle')} v2.0</span>
            <span className="font-semibold text-slate-700">Govt. of Andhra Pradesh</span>
          </div>

        </div>
      </div>
    </div>
  );
};
