import { Droplets, LogIn, ArrowLeft } from 'lucide-react';
import { UserRoleType } from '../types/nirikshan';
import { useLanguage } from '../context/LanguageContext';

interface NirikshanHeaderProps {
  currentRole: UserRoleType;
  onSelectRole: (role: UserRoleType) => void;
  isLoggedIn: boolean;
  currentUser: { name: string; phone: string } | null;
  onOpenLoginModal: () => void;
  onOpenDrawer: () => void;
  onOpenSupabaseModal?: () => void;
  onOpenSubmissionDossier?: () => void;
}

export const NirikshanHeader: React.FC<NirikshanHeaderProps> = ({
  currentRole,
  onSelectRole,
  isLoggedIn,
  currentUser,
  onOpenLoginModal,
  onOpenDrawer,
  onOpenSubmissionDossier,
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-3 w-full">
        {/* Brand & Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none" 
          onClick={() => onSelectRole('overview')}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#03045E] via-[#0077B6] to-[#00B4D8] flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#03045E]">
                {t('siteTitle')}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#CAF0F8] text-[#03045E] px-2.5 py-0.5 rounded-full border border-[#00B4D8]/30 hidden sm:inline">
                {t('siteSubtitle')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              {t('siteDescription')}
            </p>
          </div>
        </div>

        {/* Right Section: Language Toggle & Login / Hamburger Button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Language Selector (Pure English | Pure Hindi | Pure Telugu) */}
          <div className="flex items-center bg-[#03045E]/10 border border-[#03045E]/20 p-0.5 rounded-xl text-xs font-bold text-slate-700 shadow-2xs">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-[#0077B6] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="English"
            >
              <span className="sm:hidden">EN</span>
              <span className="hidden sm:inline">English</span>
            </button>
            <span className="text-slate-300 px-0.5">|</span>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'hi'
                  ? 'bg-[#0077B6] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="हिन्दी"
            >
              हिन्दी
            </button>
            <span className="text-slate-300 px-0.5">|</span>
            <button
              onClick={() => setLanguage('te')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'te'
                  ? 'bg-[#0077B6] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="తెలుగు"
            >
              తెలుగు
            </button>
          </div>




          {/* Login & Actions Area */}
          {!isLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-2 bg-[#0077B6] hover:bg-[#03045E] text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-[#CAF0F8]" />
                <span>{t('login')}</span>
              </button>

              {currentRole === 'admin' ? (
                <button
                  onClick={() => onSelectRole('overview')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0077B6] border border-sky-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  title="Back to Portal Home"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Portal Home</span>
                </button>
              ) : (
                <button
                  onClick={onOpenDrawer}
                  className="w-10 h-10 rounded-xl bg-[#03045E] hover:bg-[#0077B6] border border-[#00B4D8]/40 flex flex-col items-center justify-center gap-1 transition-all shadow-md active:scale-95 cursor-pointer p-2"
                  title={t('switchPortal')}
                  aria-label="Navigation Menu"
                >
                  <span className="w-5 h-0.5 bg-[#00B4D8] rounded-full transition-all"></span>
                  <span className="w-5 h-0.5 bg-[#00B4D8] rounded-full transition-all"></span>
                  <span className="w-5 h-0.5 bg-[#00B4D8] rounded-full transition-all"></span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-slate-800 truncate max-w-[120px]">
                  {currentUser?.name || t('citizenUser')}
                </span>
              </div>

              {currentRole === 'admin' && (
                <button
                  onClick={() => onSelectRole('overview')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0077B6] border border-sky-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  title="Back to Portal Home"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Portal Home</span>
                </button>
              )}

              <button
                onClick={onOpenDrawer}
                className="w-10 h-10 rounded-xl bg-[#03045E] hover:bg-[#0077B6] border border-[#00B4D8]/40 flex flex-col items-center justify-center gap-1 transition-all shadow-md active:scale-95 cursor-pointer p-2"
                title={t('switchPortal')}
                aria-label="Navigation Menu"
              >
                <span className="w-5 h-0.5 bg-[#00B4D8] rounded-full transition-all"></span>
                <span className="w-5 h-0.5 bg-[#00B4D8] rounded-full transition-all"></span>
                <span className="w-5 h-0.5 bg-[#00B4D8] rounded-full transition-all"></span>
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
