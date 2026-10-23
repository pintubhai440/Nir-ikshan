import React, { useState, useEffect } from 'react';
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
  ChevronRight, 
  ChevronDown,
  CheckCircle2,
  Lock,
  LogIn,
  Paperclip
} from 'lucide-react';

interface NirikshanSlideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRoleType;
  onSelectRole: (role: UserRoleType) => void;
  currentUser: { name: string; phone: string } | null;
  onLogout: () => void;
  onOpenLodgeModal?: () => void;
  onOpenDirectoryModal?: () => void;
  selectedNodalDistrict: string;
  onSelectNodalDistrict: (district: string) => void;
  isLoggedIn?: boolean;
  onOpenLogin?: () => void;
  onOpenSupabaseModal?: () => void;
  onOpenSubmissionDossier?: () => void;
}

export const NirikshanSlideDrawer: React.FC<NirikshanSlideDrawerProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
  currentUser,
  onLogout,
  selectedNodalDistrict,
  onSelectNodalDistrict,
  isLoggedIn = false,
  onOpenLogin,
  onOpenSupabaseModal,
  onOpenSubmissionDossier,
}) => {
  const { language, t } = useLanguage();
  const [isNodalExpanded, setIsNodalExpanded] = useState(true);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
    <div className="fixed inset-0 z-50 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Blurred Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Slide-in Drawer Container (Compact, Website-proportioned width) */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-sm sm:max-w-[390px] bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
          
          {/* ============================================================== */}
          {/* COMPACT TOP HEADER: Matches Nirikshan Header Height & Styling   */}
          {/* ============================================================== */}
          <div className="bg-gradient-to-r from-[#03045E] via-[#0077B6] to-[#0096C7] text-white p-3.5 px-4 shadow-sm relative overflow-hidden shrink-0">
            {/* Ambient soft glow */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-lg pointer-events-none" />

            {/* Top row: Status & Close */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#CAF0F8]">
                  {t('commandNav', 'COMMAND NAVIGATION')}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10 active:scale-95"
                title={t('close', 'Close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Profile Card (Compact) */}
            {currentUser ? (
              <div className="mt-2.5 p-2 px-3 rounded-xl bg-white/15 border border-white/20 backdrop-blur-xs flex items-center justify-between gap-2.5 relative z-10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white text-[#03045E] font-extrabold flex items-center justify-center text-xs shadow-xs shrink-0">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'N'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white leading-tight truncate">
                      {currentUser.name || t('verifiedCitizen', 'Verified Citizen')}
                    </h4>
                    <p className="text-[11px] text-[#CAF0F8] font-mono truncate">
                      {currentUser.phone ? `+91 ${currentUser.phone}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#E63946] hover:bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs shrink-0 active:scale-95"
                  title={t('logout', 'Logout')}
                >
                  <LogOut className="w-3 h-3" />
                  <span>{t('logout', 'Logout')}</span>
                </button>
              </div>
            ) : (
              /* Unauthenticated Quick Info */
              <div className="mt-2.5 p-2 px-3 rounded-xl bg-white/15 border border-white/20 backdrop-blur-xs flex items-center justify-between gap-2 relative z-10">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs shrink-0">
                    <Lock className="w-3 h-3" />
                  </span>
                  <p className="text-[11px] text-white font-medium truncate">
                    {language === 'hi' ? 'सरकारी कर्मचारी? लॉगिन करें' : language === 'te' ? 'ప్రభుత్వ ఉద్యోగి? లాగిన్ అవ్వండి' : 'Govt. employee? Sign in'}
                  </p>
                </div>
                {onOpenLogin && (
                  <button
                    onClick={() => {
                      onOpenLogin();
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs shrink-0 active:scale-95"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>{t('login', 'Login')}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* DRAWER MENU BODY: 2 Distinct Categories (Sleek & Proportional)  */}
          {/* 1. PUBLIC USE (Portal Home & Normal User)                      */}
          {/* 2. GOVERNMENT USE (State Admin, Nodal, Inspector, Action Worker)*/}
          {/* ============================================================== */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/60">
            
            {/* ------------------------------------------------------------ */}
            {/* CATEGORY 1: PUBLIC USE (सार्वजनिक उपयोग)                    */}
            {/* ------------------------------------------------------------ */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1 pb-1">
                <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#0077B6]" />
                  <span>{language === 'hi' ? 'सार्वजनिक उपयोग (Public Use)' : language === 'te' ? 'ప్రజా ఉపయోగం (Public Use)' : 'PUBLIC USE'}</span>
                </span>
                <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {language === 'hi' ? 'ओपन एक्सेस' : 'OPEN ACCESS'}
                </span>
              </div>

              {/* 1. Portal Home (National Overview) */}
              <button
                onClick={() => handleRoleClick('overview')}
                className={`w-full text-left p-2.5 px-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  currentRole === 'overview'
                    ? 'bg-[#03045E] text-white border-[#03045E] shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    currentRole === 'overview' ? 'bg-white/20 text-[#CAF0F8]' : 'bg-blue-50 text-[#0077B6]'
                  }`}>
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs sm:text-[13px] font-bold leading-tight truncate">
                      {t('roleOverview', 'Portal Home')}
                    </h5>
                    <p className={`text-[11px] mt-0.5 truncate ${currentRole === 'overview' ? 'text-[#CAF0F8]' : 'text-slate-500'}`}>
                      {t('roleOverviewDesc', 'All India Map & National Grid')}
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                  currentRole === 'overview' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {t('tagNational', 'NATIONAL')}
                </span>
              </button>

              {/* 2. Normal User (Citizen) */}
              <button
                onClick={() => handleRoleClick('user')}
                className={`w-full text-left p-2.5 px-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  currentRole === 'user'
                    ? 'bg-[#0077B6] text-white border-[#0077B6] shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    currentRole === 'user' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs sm:text-[13px] font-bold leading-tight truncate">
                      {t('roleUser', 'Normal User (Citizen)')}
                    </h5>
                    <p className={`text-[11px] mt-0.5 truncate ${currentRole === 'user' ? 'text-blue-100' : 'text-slate-500'}`}>
                      {t('roleUserDesc', 'Citizen Grievance & Tracker')}
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                  currentRole === 'user' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {t('tagPublic', 'PUBLIC')}
                </span>
              </button>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* CATEGORY 2: GOVERNMENT USE (सरकारी उपयोग)                    */}
            {/* Strictly for Govt. Employees Only                           */}
            {/* ------------------------------------------------------------ */}
            <div className="space-y-1.5 pt-1.5 border-t border-slate-200">
              <div className="flex items-center justify-between px-1 pb-1">
                <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#03045E]" />
                  <span>{language === 'hi' ? 'सरकारी उपयोग (Govt. Use)' : language === 'te' ? 'ప్రభుత్వ ఉపయోగం (Govt. Use)' : 'GOVERNMENT USE'}</span>
                </span>
                <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-amber-700" />
                  <span>{language === 'hi' ? 'केवल सरकारी कर्मचारी' : 'GOV EMPLOYEES ONLY'}</span>
                </span>
              </div>

              {/* 1. State Admin */}
              <button
                onClick={() => handleRoleClick('admin')}
                className={`w-full text-left p-2.5 px-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  currentRole === 'admin'
                    ? 'bg-[#0077B6] text-white border-[#0077B6] shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    currentRole === 'admin' ? 'bg-white/20 text-white' : 'bg-sky-50 text-sky-700'
                  }`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-xs sm:text-[13px] font-bold leading-tight truncate">
                        {t('roleAdmin', 'State Admin')}
                      </h5>
                      {!isLoggedIn && (
                        <span title="Govt. Login Required" className="inline-flex">
                          <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] mt-0.5 truncate ${currentRole === 'admin' ? 'text-sky-100' : 'text-slate-500'}`}>
                      {t('roleAdminDesc', 'AP State Audit & Highlighting')}
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                  currentRole === 'admin' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {t('tagAdmin', 'ADMIN')}
                </span>
              </button>

              {/* 2. Nodal Officer (District In-Charge) */}
              <button
                onClick={() => handleRoleClick('nodal')}
                className={`w-full text-left p-2.5 px-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  currentRole === 'nodal' || currentRole.startsWith('nodal_')
                    ? 'bg-[#0077B6] text-white border-[#0077B6] shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    currentRole === 'nodal' || currentRole.startsWith('nodal_') ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#0077B6]'
                  }`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-xs sm:text-[13px] font-bold leading-tight truncate">
                        {t('roleNodal', 'Nodal Officer')}
                      </h5>
                      {!isLoggedIn && (
                        <span title="Govt. Login Required" className="inline-flex">
                          <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] mt-0.5 truncate ${currentRole === 'nodal' || currentRole.startsWith('nodal_') ? 'text-blue-100' : 'text-slate-500'}`}>
                      {t('roleNodalDesc', 'District In-Charge (26 Circles)')}
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                  currentRole === 'nodal' || currentRole.startsWith('nodal_') ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {t('tagDistrict', 'DISTRICT')}
                </span>
              </button>

              {/* 3. Field Inspector */}
              <button
                onClick={() => handleRoleClick('inspector')}
                className={`w-full text-left p-2.5 px-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  currentRole === 'inspector'
                    ? 'bg-[#0077B6] text-white border-[#0077B6] shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    currentRole === 'inspector' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-xs sm:text-[13px] font-bold leading-tight truncate">
                        {t('roleInspector', 'Field Inspector')}
                      </h5>
                      {!isLoggedIn && (
                        <span title="Govt. Login Required" className="inline-flex">
                          <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] mt-0.5 truncate ${currentRole === 'inspector' ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {t('roleInspectorDesc', 'TDS Machine, Waste Log & Photos')}
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                  currentRole === 'inspector' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {t('tagNoMap', 'NO MAP')}
                </span>
              </button>

              {/* 4. Action Worker */}
              <button
                onClick={() => handleRoleClick('engineer')}
                className={`w-full text-left p-2.5 px-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  currentRole === 'engineer'
                    ? 'bg-[#0077B6] text-white border-[#0077B6] shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    currentRole === 'engineer' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'
                  }`}>
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-xs sm:text-[13px] font-bold leading-tight truncate">
                        {t('roleEngineer', 'Action Worker')}
                      </h5>
                      {!isLoggedIn && (
                        <span title="Govt. Login Required" className="inline-flex">
                          <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] mt-0.5 truncate ${currentRole === 'engineer' ? 'text-amber-100' : 'text-slate-500'}`}>
                      {t('roleEngineerDesc', 'Strict Deadlines & Proof Upload')}
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                  currentRole === 'engineer' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {t('tagFullMap', 'FULL MAP')}
                </span>
              </button>

              {/* Supporting Materials (Architecture, Workflow, Screenshots) */}
              {onOpenSubmissionDossier && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSubmissionDossier();
                  }}
                  className="w-full text-left p-2.5 px-3 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all cursor-pointer flex items-center justify-between shadow-2xs mt-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Paperclip className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs sm:text-[13px] font-extrabold text-amber-900 leading-tight truncate">
                        Supporting Materials Dossier
                      </h5>
                      <p className="text-[11px] text-amber-700 mt-0.5 truncate">
                        Architecture, Workflow & Screenshot Guide
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded font-black bg-amber-200/80 text-amber-900 shrink-0">
                    SUBMISSION
                  </span>
                </button>
              )}
            </div>

          </div>



          {/* ============================================================== */}
          {/* COMPACT DRAWER FOOTER                                          */}
          {/* ============================================================== */}
          <div className="p-3 px-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
            <span className="font-mono">{t('siteTitle', 'Nir-ikshan')} v2.0</span>
            <span className="font-semibold text-slate-700">Govt. of Andhra Pradesh</span>
          </div>

        </div>
      </div>
    </div>
  );
};
