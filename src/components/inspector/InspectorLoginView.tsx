/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Field Inspector Authentication Portal (CAM-03)
 * Simplified, direct, and intuitive interface for ground field hydrologists.
 * Displays active Nodal Officer dispatches with 1-click launch and clear district selection.
 */

import React, { useState, useMemo } from 'react';
import { SupabaseFieldInspectorRow } from '../../data/allDistrictsTeamData';
import { CitizenComplaint } from '../../types/nirikshan';
import { isComplaintAssignedToInspector } from '../../utils/inspectorFilter';
import { 
  ShieldCheck, 
  MapPin, 
  UserCheck, 
  Search, 
  Sparkles, 
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Droplets
} from 'lucide-react';

interface InspectorLoginViewProps {
  onLogin: (inspector: SupabaseFieldInspectorRow) => void;
  allInspectors: SupabaseFieldInspectorRow[];
  complaints: CitizenComplaint[];
}

export const InspectorLoginView: React.FC<InspectorLoginViewProps> = ({
  onLogin,
  allInspectors,
  complaints,
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Vizianagaram');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Identify which inspectors have active cases dispatched by Nodal Officers
  const dispatchedCases = useMemo(() => {
    const list: Array<{
      complaint: CitizenComplaint;
      assignedInspectorObj?: SupabaseFieldInspectorRow;
      inspectorName: string;
    }> = [];

    complaints.forEach((c) => {
      if (c.status === 'INSPECTOR_ASSIGNED' || c.status === 'SUBMITTED' || c.assignedInspector) {
        const match = allInspectors.find((insp) => isComplaintAssignedToInspector(c, insp));
        list.push({
          complaint: c,
          assignedInspectorObj: match,
          inspectorName: c.assignedInspector || match?.full_name || 'Assigned Officer',
        });
      }
    });

    return list;
  }, [complaints, allInspectors]);

  // Unique list of districts
  const districtList = useMemo(() => {
    const set = new Set<string>();
    allInspectors.forEach((i) => {
      if (i.district) set.add(i.district);
    });
    return Array.from(set).sort();
  }, [allInspectors]);

  // Inspectors for selected district or search
  const filteredInspectors = useMemo(() => {
    return allInspectors.filter((insp) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          insp.full_name?.toLowerCase().includes(q) ||
          insp.district?.toLowerCase().includes(q) ||
          insp.mandal?.toLowerCase().includes(q) ||
          insp.inspector_id?.toLowerCase().includes(q)
        );
      }
      return insp.district.toLowerCase() === selectedDistrict.toLowerCase();
    });
  }, [allInspectors, selectedDistrict, searchQuery]);

  const handleSelectInspector = (inspector: SupabaseFieldInspectorRow) => {
    try {
      localStorage.setItem('nir_logged_in_inspector', JSON.stringify(inspector));
      localStorage.setItem('nir_current_inspector_id', inspector.inspector_id);
    } catch {}
    // Clean login with zero confetti distraction
    onLogin(inspector);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. Clear Header Banner */}
      <div className="bg-[#03045E] text-white rounded-3xl p-6 sm:p-7 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-sky-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ROLE 3: AUTHORIZED FIELD INSPECTOR</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Field Inspector Authentication Workstation
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
              Conduct physical on-site inspections, GPS verification, calibrated TDS water quality testing, and sign off remediation repairs dispatched by the District Nodal Officer.
            </p>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-3.5 text-center text-xs">
            <span className="text-[10px] uppercase font-bold text-sky-200 block">Active Status</span>
            <span className="font-bold text-emerald-300 text-sm block">Ground Ready</span>
            <span className="text-[10px] text-sky-200 block">Andhra Pradesh 26 Districts</span>
          </div>
        </div>
      </div>

      {/* 2. Primary Highlight: Active Nodal Officer Dispatches */}
      {dispatchedCases.length > 0 && (
        <div className="bg-sky-50/70 border border-sky-200 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0077B6] text-white flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <span>Active Grievance Dispatches Assigned by Nodal Officer ({dispatchedCases.length} Pending)</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Immediate Action
                  </span>
                </h2>
                <p className="text-xs text-slate-600">
                  Click on your assigned case to directly launch your field inspection queue:
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            {dispatchedCases.slice(0, 3).map(({ complaint, assignedInspectorObj, inspectorName }) => {
              const matchedOfficer = assignedInspectorObj || allInspectors.find(i => i.full_name === inspectorName) || allInspectors[0];
              return (
                <div
                  key={complaint.id}
                  className="bg-white border border-sky-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#0077B6] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {complaint.id}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>24h SLA Active</span>
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                        {complaint.locationLandmark}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                        {complaint.wasteType || complaint.shortDescription}
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Field Inspector</span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-bold text-slate-800 truncate">
                          {matchedOfficer.full_name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {matchedOfficer.district}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectInspector(matchedOfficer)}
                    className="w-full py-2.5 px-3 bg-[#03045E] hover:bg-[#0077B6] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
                  >
                    <span>👉 Launch Workstation ({matchedOfficer.full_name.split(' ')[0]})</span>
                    <ArrowRight className="w-4 h-4 text-sky-200" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. District & Officer Switcher (Super Simple Dropdown + Cards) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#0077B6]" />
              <span>Switch Officer or Select Another District</span>
            </h3>
            <p className="text-xs text-slate-500">
              Select any authorized field inspector across Andhra Pradesh's 26 districts to view their individual queue.
            </p>
          </div>

          {/* District Dropdown Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Select District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSearchQuery('');
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none cursor-pointer focus:ring-1 focus:ring-[#0077B6]"
            >
              {districtList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Inspectors Grid for Selected District */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredInspectors.map((insp) => (
            <div
              key={insp.inspector_id}
              onClick={() => handleSelectInspector(insp)}
              className="border border-slate-200 hover:border-[#0077B6] bg-slate-50/50 hover:bg-white rounded-2xl p-3.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs group space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#0077B6] bg-blue-50 px-2 py-0.5 rounded">
                  {insp.inspector_id}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {insp.mandal} Mandal
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#0077B6] transition-colors">
                  {insp.full_name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Meter Kit: {insp.meter_id} • {insp.phone}
                </p>
              </div>

              <button
                type="button"
                className="w-full py-1.5 px-3 bg-white group-hover:bg-[#0077B6] border border-slate-200 group-hover:border-[#0077B6] text-slate-700 group-hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <span>Select &amp; Open Workstation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
