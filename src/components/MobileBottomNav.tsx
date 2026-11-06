import React from 'react';
import { UserRoleType } from '../types/nirikshan';
import { useLanguage } from '../context/LanguageContext';
import { 
  Globe, 
  User, 
  Building2, 
  UserCheck, 
  Wrench, 
  Menu
} from 'lucide-react';

interface MobileBottomNavProps {
  currentRole: UserRoleType;
  onSelectRole: (role: UserRoleType) => void;
  onOpenDrawer: () => void;
  isLoggedIn: boolean;
  onOpenLoginModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentRole,
  onSelectRole,
  onOpenDrawer,
}) => {
  const { language } = useLanguage();

  const isRoleActive = (role: UserRoleType) => {
    if (role === 'nodal') {
      return (
        currentRole === 'nodal' ||
        currentRole === 'nodal_vizianagaram' ||
        currentRole === 'nodal_parvathipuram' ||
        currentRole === 'nodal_visakhapatnam'
      );
    }
    return currentRole === role;
  };

  const navItems = [
    {
      role: 'overview' as UserRoleType,
      labelEn: 'Grid',
      labelHi: 'होम ग्रिड',
      labelTe: 'గ్రిడ్',
      icon: Globe,
    },
    {
      role: 'user' as UserRoleType,
      labelEn: 'Citizen',
      labelHi: 'नागरिक',
      labelTe: 'పౌరుడు',
      icon: User,
    },
    {
      role: 'nodal' as UserRoleType,
      labelEn: 'Nodal',
      labelHi: 'नोडल',
      labelTe: 'నోడల్',
      icon: Building2,
    },
    {
      role: 'inspector' as UserRoleType,
      labelEn: 'Inspector',
      labelHi: 'निरीक्षक',
      labelTe: 'ఇన్‌స్పెక్టర్',
      icon: UserCheck,
    },
    {
      role: 'engineer' as UserRoleType,
      labelEn: 'Worker',
      labelHi: 'कामगार',
      labelTe: 'వర్కర్',
      icon: Wrench,
    },
  ];

  const getLabel = (item: typeof navItems[0]) => {
    if (language === 'hi') return item.labelHi;
    if (language === 'te') return item.labelTe;
    return item.labelEn;
  };

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1.5 transition-all"
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const active = isRoleActive(item.role);
          const Icon = item.icon;
          return (
            <button
              key={item.role}
              onClick={() => {
                onSelectRole(item.role);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
                active 
                  ? 'text-[#0077B6] font-bold' 
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <div className={`p-1 rounded-xl transition-all ${
                  active ? 'bg-[#CAF0F8] text-[#03045E]' : 'bg-transparent text-slate-500'
                }`}>
                  <Icon className={`w-5 h-5 ${active ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                </div>
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0077B6]" />
                )}
              </div>
              <span className={`text-[10px] mt-0.5 leading-tight truncate max-w-[64px] ${
                active ? 'font-bold text-[#0077B6]' : 'text-slate-600'
              }`}>
                {getLabel(item)}
              </span>
            </button>
          );
        })}

        {/* More / Menu Drawer Toggle */}
        <button
          onClick={onOpenDrawer}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-500 hover:text-slate-800 font-medium transition-all cursor-pointer select-none active:scale-95"
          title="More Options"
        >
          <div className="p-1 rounded-xl bg-transparent text-slate-500">
            <Menu className="w-5 h-5 stroke-[1.8]" />
          </div>
          <span className="text-[10px] mt-0.5 leading-tight text-slate-600">
            {language === 'hi' ? 'मेनू' : language === 'te' ? 'మెనూ' : 'Menu'}
          </span>
        </button>
      </div>
    </nav>
  );
};
