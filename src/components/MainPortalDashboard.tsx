import React from 'react';
import { WaterBody, CitizenComplaint, UserRoleType } from '../types/nirikshan';
import { InteractiveIndiaMap } from './InteractiveIndiaMap';
import { 
  Droplets, 
  ShieldCheck, 
  User, 
  Building2, 
  AlertTriangle, 
  Activity, 
  CheckCircle2, 
  Sparkles,
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
  onOpenDirectoryModal,
}) => {
  const greenCount = waterBodies.filter((w) => w.statusColor === 'green').length;
  const blueCount = waterBodies.filter((w) => w.statusColor === 'blue').length;
  const yellowCount = waterBodies.filter((w) => w.statusColor === 'yellow').length;
  const redCount = waterBodies.filter((w) => w.statusColor === 'red').length;
  const greyCount = waterBodies.filter((w) => w.statusColor === 'grey').length;

  return (
    <div className="space-y-6">
      {/* Hero Apex Command Header */}
      <div className="bg-gradient-to-r from-[#0a192f] via-[#10243e] to-[#0047ab] text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-blue-900/50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative overflow-hidden">
        {/* Glow ambient background accent */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-blue-500/15 blur-3xl pointer-events-none"></div>

        <div className="space-y-2.5 max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1 rounded-full text-xs font-mono text-sky-200 border border-white/15">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>NATIONAL WATER INTEGRITY & SURVEILLANCE ECOSYSTEM</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            Nir-ikshan: National Micro-Watershed Grid & Hydrological Surveillance
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Real-time geospatial monitoring, citizen grievance triage, and satellite verification engine. Powered by <strong>ISRO-Bhuvan WBIS Optical Passes</strong>, <strong>India-WRIS / APWRIMS Telemetry</strong>, and verifiable algorithmic water accountability across India.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ISRO-Bhuvan WBIS Integrated</span>
            </span>
            <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5" />
              <span>India-WRIS / APWRIMS Synced</span>
            </span>
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SFIC Theme 2 Water Security</span>
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
              <span>Citizen Surveillance Portal</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectRole('admin')}
            className="w-full px-5 py-3 rounded-2xl bg-blue-600/90 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm border border-blue-400/30 shadow-md flex items-center justify-between gap-3 transition-transform active:scale-95 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-300" />
              <span>State Admin Command (AP Grid)</span>
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
              🟢 PRISTINE / RECHARGED
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1">{greenCount}</div>
          <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Recharge Abundant</p>
        </div>

        {/* Blue */}
        <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-sky-800 uppercase tracking-wider">
              🔵 NORMAL
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-900 mt-1">{blueCount}</div>
          <p className="text-[11px] text-sky-700 mt-0.5 font-medium">Acceptable Quality</p>
        </div>

        {/* Yellow */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
              🟡 MIDDLE PROBLEM
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1">{yellowCount}</div>
          <p className="text-[11px] text-amber-700 mt-0.5 font-medium">Moderate Silt/Waste</p>
        </div>

        {/* Red */}
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider">
              🔴 DANGER ZONE
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-900 mt-1">{redCount}</div>
          <p className="text-[11px] text-rose-700 mt-0.5 font-medium">Severe Hazard / Breach</p>
        </div>

        {/* Grey */}
        <div className="bg-slate-100 border border-slate-300 p-4 rounded-2xl shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
              ⚪ EXTINCT BED
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">{greyCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Existence Se Mit Gaya</p>
        </div>
      </div>

      {/* PRIMARY MAP: ALL-INDIA NATIONAL WATER GRID */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl flex items-center gap-2">
              <span>🇮🇳 National Water Grid & River Basins of India</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive micro-watershed surveillance, satellite optical passes, and real-time hydrological grid.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 text-[#0047ab] border border-sky-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              <span>💧 113 AP Water Grid Reservoirs Integrated</span>
            </span>

            <button
              onClick={() => onSelectRole('admin')}
              className="px-4 py-2 bg-gradient-to-r from-[#0047ab] to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>Open Andhra Pradesh State Command</span>
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

      {/* Regional Catchment Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#0047ab]" />
              <span>National & Andhra Pradesh Water Body Registry ({waterBodies.length})</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Click on any water body on the map or review field test parameters below
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                <th className="p-3">Water Body / Catchment</th>
                <th className="p-3">State / District</th>
                <th className="p-3">Type</th>
                <th className="p-3">Water Level</th>
                <th className="p-3">TDS Level</th>
                <th className="p-3">Waste / Threat</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {waterBodies.slice(0, 10).map((wb) => (
                <tr key={wb.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{wb.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {wb.coordinates.lat}°N, {wb.coordinates.lng}°E
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-800">{wb.district}</span>
                    <span className="text-[11px] text-slate-500 block">{wb.mandal}</span>
                  </td>
                  <td className="p-3 font-mono text-[11px]">{wb.type}</td>
                  <td className="p-3 font-mono font-bold text-[#0047ab]">
                    {wb.waterLevelPercent}%
                  </td>
                  <td className="p-3 font-mono">
                    <span className={wb.tdsPpm > 500 ? 'text-rose-600 font-bold' : 'text-emerald-700'}>
                      {wb.tdsPpm} ppm
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      wb.wasteLevel === 'Heavy' ? 'bg-rose-100 text-rose-800' :
                      wb.wasteLevel === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {wb.wasteLevel}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                      wb.statusColor === 'green' ? 'bg-emerald-100 text-emerald-800' :
                      wb.statusColor === 'blue' ? 'bg-sky-100 text-sky-800' :
                      wb.statusColor === 'yellow' ? 'bg-amber-100 text-amber-800' :
                      wb.statusColor === 'red' ? 'bg-rose-100 text-rose-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {wb.statusColor.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
