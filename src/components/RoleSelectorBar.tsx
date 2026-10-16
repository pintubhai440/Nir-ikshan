import React from 'react';
import { UserRoleType } from '../types/nirikshan';
import { 
  ShieldCheck, 
  User, 
  Building2, 
  UserCheck, 
  Wrench, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  LogOut, 
  Globe
} from 'lucide-react';

interface RoleSelectorBarProps {
  currentRole: UserRoleType;
  onSelectRole: (role: UserRoleType) => void;
  authenticatedRoles: Record<UserRoleType, boolean>;
  onLogoutRole: (role: UserRoleType) => void;
  onOpenLodgeModal: () => void;
  onOpenDirectoryModal: () => void;
}

export const RoleSelectorBar: React.FC<RoleSelectorBarProps> = ({
  currentRole,
  onSelectRole,
  authenticatedRoles,
  onLogoutRole,
  onOpenLodgeModal,
  onOpenDirectoryModal,
}) => {
  const roles = [
    {
      role: 'overview' as UserRoleType,
      num: '0',
      title: 'Portal Home',
      sub: 'All India Map & Grid',
      icon: Globe,
      badge: 'National',
      requiresAuth: false,
      activeColor: 'from-slate-900 to-blue-950',
    },
    {
      role: 'user' as UserRoleType,
      num: '2',
      title: 'Normal User',
      sub: 'Citizen Grievance & Tracker',
      icon: User,
      badge: 'Public',
      requiresAuth: false,
      activeColor: 'from-emerald-600 to-teal-800',
    },
    {
      role: 'admin' as UserRoleType,
      num: '1',
      title: 'State Admin',
      sub: 'AP State Audit & PDF',
      icon: ShieldCheck,
      badge: 'Admin',
      requiresAuth: true,
      activeColor: 'from-[#0047ab] to-blue-800',
    },
    {
      role: 'nodal_vizianagaram' as UserRoleType,
      num: '3',
      title: 'Nodal Officer',
      sub: 'Vizianagaram Circle',
      icon: Building2,
      badge: 'Vizianagaram',
      requiresAuth: true,
      activeColor: 'from-sky-600 to-blue-800',
    },
    {
      role: 'nodal_parvathipuram' as UserRoleType,
      num: '3',
      title: 'Nodal Officer',
      sub: 'Parvathipuram Manyam',
      icon: Building2,
      badge: 'Parvathipuram',
      requiresAuth: true,
      activeColor: 'from-indigo-600 to-purple-800',
    },
    {
      role: 'inspector' as UserRoleType,
      num: '5',
      title: 'Field Inspector',
      sub: 'TDS Machine & Waste Log',
      icon: UserCheck,
      badge: 'Field Sensor',
      requiresAuth: true,
      activeColor: 'from-teal-600 to-emerald-800',
    },
    {
      role: 'engineer' as UserRoleType,
      num: '4',
      title: 'Action Worker',
      sub: 'Strict Work Deadlines',
      icon: Wrench,
      badge: 'Remediation',
      requiresAuth: true,
      activeColor: 'from-amber-600 to-orange-800',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-3.5 sm:p-4 shadow-xs space-y-3 w-full">
      {/* Top Header Row of the Role Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
            DASHBOARD PORTALS & 5 USER ROLES (उपयोगकर्ता भूमिकाएं)
          </span>
          <span className="text-[10px] font-mono bg-blue-50 text-[#0047ab] px-2 py-0.5 rounded font-bold border border-blue-200">
            DIRECT 1-CLICK ACCESS
          </span>
        </div>

        {/* Quick Help & Action CTAs */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLodgeModal}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer animate-pulse"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Lodge Complaint</span>
          </button>

          <button
            onClick={onOpenDirectoryModal}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-200"
          >
            <Phone className="w-3.5 h-3.5 text-[#0047ab]" />
            <span className="hidden sm:inline">Officers Directory</span>
            <span className="sm:hidden">Officers</span>
          </button>

          {currentRole !== 'overview' && currentRole !== 'user' && (
            <button
              onClick={() => onLogoutRole(currentRole)}
              className="flex items-center gap-1 text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
              title="Switch to Portal Home"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Role</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Cards Grid (Fully Visible, No Three-Dots) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {roles.map((item) => {
          const Icon = item.icon;
          const isActive = currentRole === item.role;
          const isAuthed = !item.requiresAuth || authenticatedRoles[item.role];

          return (
            <button
              key={item.role}
              onClick={() => onSelectRole(item.role)}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer group relative overflow-hidden ${
                isActive
                  ? `bg-gradient-to-br ${item.activeColor} text-white shadow-md ring-2 ring-blue-400 border-transparent`
                  : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-300 text-slate-800'
              }`}
            >
              {/* Active Indicator Bar on Top */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/60"></div>
              )}

              {/* Top Icon & Auth Indicator */}
              <div className="flex items-center justify-between w-full mb-1.5">
                <div
                  className={`p-1.5 rounded-xl ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-[#0047ab] shadow-2xs border border-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {item.requiresAuth ? (
                  isAuthed ? (
                    <span title="Authenticated">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-emerald-600'}`}
                      />
                    </span>
                  ) : (
                    <span title="Protected: admin@nir.com / 1234">
                      <Lock
                        className={`w-3.5 h-3.5 ${isActive ? 'text-white/60' : 'text-slate-400'}`}
                      />
                    </span>
                  )
                ) : (
                  <span
                    className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    FREE
                  </span>
                )}
              </div>

              {/* Role Title & Subtitle */}
              <div>
                <h4
                  className={`text-xs font-extrabold truncate ${
                    isActive ? 'text-white' : 'text-slate-900 group-hover:text-[#0047ab]'
                  }`}
                >
                  {item.title}
                </h4>
                <p
                  className={`text-[10px] line-clamp-1 mt-0.5 font-normal ${
                    isActive ? 'text-white/80' : 'text-slate-500'
                  }`}
                >
                  {item.sub}
                </p>
              </div>

              {/* Bottom Tag */}
              <div className="mt-2 pt-1 border-t border-slate-200/40 flex items-center justify-between text-[9px] font-mono">
                <span className={isActive ? 'text-white/90 font-bold' : 'text-slate-400 font-semibold'}>
                  {item.badge}
                </span>
                {isActive && (
                  <span className="bg-white/25 px-1 py-0.2 rounded text-[8px] font-extrabold uppercase">
                    ACTIVE
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
