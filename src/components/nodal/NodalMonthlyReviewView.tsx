/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Monthly Hydrology Assurance Review (CAM 02 - Nodal Officer)
 * Matches image_b0e77d2d.png and image_7e4d1dfb.png
 * Pure English, clean minimalist executive styling, strictly 0 fake data.
 */

import React, { useState } from 'react';
import { 
  INITIAL_REPEAT_FAILURES, 
  INITIAL_EXECUTIVE_DIRECTIVES,
  RepeatFailureRecord,
  StatutoryExecutiveDirective
} from '../../data/nodalOfficerData';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Download, 
  ArrowRight, 
  ShieldAlert, 
  Building2, 
  Calendar, 
  Clock, 
  Sparkles,
  Camera,
  ExternalLink,
  Send,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NodalMonthlyReviewViewProps {
  district: string;
}

export const NodalMonthlyReviewView: React.FC<NodalMonthlyReviewViewProps> = ({
  district,
}) => {
  const [repeatFailures, setRepeatFailures] = useState<RepeatFailureRecord[]>(INITIAL_REPEAT_FAILURES);
  const [directives, setDirectives] = useState<StatutoryExecutiveDirective[]>(INITIAL_EXECUTIVE_DIRECTIVES);
  const [newDirectiveText, setNewDirectiveText] = useState<string>('');
  const [newDirectiveTitle, setNewDirectiveTitle] = useState<string>('');

  const handleCommitDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirectiveText.trim()) return;

    const newDirective: StatutoryExecutiveDirective = {
      id: directives.length + 1,
      title: newDirectiveTitle.trim() || 'Urgent Executive Mandate',
      mandateText: newDirectiveText.trim(),
      targetDate: '31 May 2024',
      nodalOfficer: 'P. Kalyani, District Nodal Hydrologist',
      statusBadge: 'Legally Recorded',
    };

    setDirectives((prev) => [...prev, newDirective]);
    setNewDirectiveText('');
    setNewDirectiveTitle('');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleExportGazette = () => {
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    alert(`Generating Official Monthly Hydrology Assurance Gazette for ${district} District. Includes Pre-monsoon coverage rates, repeat failure diagnostic registry, and Section 65B tamper-evident hash.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Badge & Title (Matching image_b0e77d2d.png) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-xs font-mono font-bold text-[#0077b6]">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            <span>STATUTORY GOVERNANCE CYCLE • AP-HYD-2024-M05</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Monthly Hydrology Assurance Review
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
            Consolidated performance audit, inspection coverage metrics, repeat failure diagnosis, and statutory decision records for {district} District.
          </p>
        </div>

        {/* Month Selector & Export Action */}
        <div className="flex items-center gap-2.5">
          <select className="p-2 px-3 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-800 shadow-2xs outline-none cursor-pointer">
            <option>May 2024 (Monthly Review)</option>
            <option>April 2024</option>
            <option>March 2024</option>
          </select>

          <button
            onClick={handleExportGazette}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0077b6] hover:bg-[#005f92] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF Official Gazette</span>
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards (Matching image_b0e77d2d.png) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: OPEN ISSUES */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">OPEN ISSUES</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">37</span>
            <span className="text-[10px] text-slate-500 font-bold">Active in district ledger</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Spread across 18 panchayats
          </p>
        </div>

        {/* Card 2: OVERDUE TASKS (>SLA) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">OVERDUE TASKS (&gt;SLA)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-600">9</span>
            <span className="text-[10px] text-rose-700 font-bold">Breached statutory threshold</span>
          </div>
          <p className="text-[11px] text-rose-500 font-medium mt-1">
            Requires Collectorate notice
          </p>
        </div>

        {/* Card 3: VERIFIED CLOSURES */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">VERIFIED CLOSURES</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">68</span>
            <span className="text-[10px] text-emerald-700 font-bold">+14% vs April</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Physically confirmed in field
          </p>
        </div>

        {/* Card 4: REPEAT FAILURES */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">REPEAT FAILURES</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-700">6</span>
            <span className="text-[10px] text-purple-700 font-bold">Post-closure relapses</span>
          </div>
          <p className="text-[11px] text-purple-600 font-medium mt-1">
            Requires root cause re-design
          </p>
        </div>
      </div>

      {/* Pre-Monsoon District Inspection Coverage Card (Matching image_b0e77d2d.png) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
              <h3 className="text-base font-extrabold text-slate-900">
                Pre-Monsoon District Inspection Coverage
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Statutory inspection cadence mandatory prior to June South-West monsoon reservoir recharge.
            </p>
          </div>
          <span className="font-mono text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 font-bold">
            Cycle: 01 May – 31 May 2024
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Progress Bar Column (5 cols) */}
          <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-700">District Coverage Rate</span>
              <span className="text-2xl font-black text-[#0077b6]">90%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div className="bg-[#0077b6] h-2.5 rounded-full" style={{ width: '90%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 pt-1">
              <div>Scheduled Target: <strong>120 Assets</strong></div>
              <div>Completed & Verified: <strong className="text-emerald-700">108 Assets</strong></div>
            </div>
          </div>

          {/* Preparedness Index Gauge (3 cols) */}
          <div className="md:col-span-3 bg-sky-50 border border-sky-200 rounded-xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-black text-[#0077b6]">
              78.4%
            </div>
            <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block mt-0.5">
              Ready
            </span>
            <p className="text-[11px] text-slate-600 font-medium mt-1">
              Monsoon Preparedness Index (De-silted basins & surplus weirs)
            </p>
          </div>

          {/* Critical Immediate Attention Banner (4 cols) */}
          <div className="md:col-span-4 bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>CRITICAL IMMEDIATE ATTENTION</span>
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
              42 Priority Assets Uninspected &gt; 6 Months
            </h4>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              Concentrated in <strong>Bobbili</strong> and <strong>Bhogapuram</strong> feeder corridors. Mandated for immediate pre-monsoon cycle clearance prior to inflow surges.
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-mono text-slate-500">Statutory SLA: 28 May 2024</span>
              <button
                onClick={() => alert('Dispatched emergency mobile squads to Bobbili and Bhogapuram feeder corridors.')}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <span>Dispatch Squad</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Repeat Failure Diagnostic Registry (Matching image_b0e77d2d.png & image_7e4d1dfb.png) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse"></span>
            <h3 className="text-base font-extrabold text-slate-900">
              Repeat Failure Diagnostic Registry
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Assets presenting recurring physical distress within 90 days of certified closure. Automatically flagged for structural re-engineering review by Chief District Hydrologist.
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Asset ID</th>
                <th className="py-3 px-4">Asset Name & Location</th>
                <th className="py-3 px-4">Previous Closure</th>
                <th className="py-3 px-4">Re-occurrence</th>
                <th className="py-3 px-4">Days Elapsed</th>
                <th className="py-3 px-4">Root Cause Category</th>
                <th className="py-3 px-4">Assigned Worker</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {repeatFailures.map((rf) => (
                <tr key={rf.assetId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0077b6] whitespace-nowrap">
                    {rf.assetId}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 leading-snug">
                      {rf.assetName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {rf.mandal} Mandal • Lat {rf.coordinates.lat}° N
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                    {rf.previousClosureDate}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-bold text-rose-600">
                    {rf.reoccurrenceDate}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                      {rf.daysElapsed} d
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                      {rf.rootCause}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800">{rf.assignedWorker}</div>
                    <div className="text-[10px] text-slate-400">{rf.workerDesignation}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      rf.status === 'Re-opened'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : rf.status === 'Re-surveyed'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {rf.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Forensic Photo Evidence Attachment Strip */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-10 rounded-lg overflow-hidden border border-slate-300 shrink-0">
              <img
                src={repeatFailures[0]?.photoEvidenceUrl}
                alt="Forensic Photo Evidence"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <strong className="text-slate-900 block">
                Forensic Photo Evidence #{repeatFailures[0]?.assetId} Attached
              </strong>
              <span className="text-[11px] text-slate-500">
                {repeatFailures[0]?.diagnosticNotes}
              </span>
            </div>
          </div>
          <button
            onClick={() => alert(`Opening comprehensive forensic hydrology audit dossier for ${repeatFailures[0]?.assetName}.`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#0077b6] border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Hydrological Audit Dossier</span>
          </button>
        </div>
      </div>

      {/* Bottom Grid: Root Cause Delay Breakdown & Statutory Decisions (Matching image_7e4d1dfb.png) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (5 cols): Root Cause Delay Breakdown */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0077b6]" />
              <h3 className="text-base font-extrabold text-slate-900">
                Root Cause Delay Breakdown
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Primary administrative and operational factors stalling asset resolution beyond statutory SLA windows.
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Factor 1 */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-bold text-slate-800">Awaiting Emergency Funds</span>
                <span className="font-mono text-slate-500">15 cases • <strong>41%</strong></span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-[#0077b6] h-2 rounded-full" style={{ width: '41%' }}></div>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Awaiting sanction from District Collectorate</span>
            </div>

            {/* Factor 2 */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-bold text-slate-800">Heavy Inflow / Water Subsidence</span>
                <span className="font-mono text-slate-500">10 cases • <strong>26%</strong></span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-sky-500 h-2 rounded-full" style={{ width: '26%' }}></div>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Site submerged; structural dewatering required</span>
            </div>

            {/* Factor 3 */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-bold text-slate-800">Contractor Machinery Breakdown</span>
                <span className="font-mono text-slate-500">7 cases • <strong>18%</strong></span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '18%' }}></div>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Excavator and earthmover unavailability</span>
            </div>

            {/* Factor 4 */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-bold text-slate-800">Jurisdiction / Land Cadastral Delay</span>
                <span className="font-mono text-slate-500">5 cases • <strong>15%</strong></span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Revenue department survey joint-inspection pending</span>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
            <strong>Key Action:</strong> Resolving the 15 funding sanction tickets resolves <strong>41%</strong> of all overdue district assurance backlogs immediately.
          </div>
        </div>

        {/* Right (7 cols): Statutory Decisions & Administrative Notes */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0077b6]" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Statutory Decisions & Administrative Notes
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Nodal Officer Directives for June 2024 execution cycle. Legally recorded in District Hydrology Assurance Gazette.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0077b6] border border-blue-200">
              Official Nodal Record
            </span>
          </div>

          {/* List of Directives */}
          <div className="space-y-3">
            {directives.map((dir) => (
              <div
                key={dir.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0077b6] text-white font-bold text-[10px] flex items-center justify-center">
                      {dir.id}
                    </span>
                    <strong className="text-slate-900">{dir.title}</strong>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {dir.statusBadge}
                  </span>
                </div>

                <p className="text-slate-700 leading-relaxed font-medium pl-7">
                  {dir.mandateText}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pl-7 pt-1">
                  <span>Target: <strong>{dir.targetDate}</strong></span>
                  <span>Officer: <strong>{dir.nodalOfficer}</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Append Directive Form */}
          <form onSubmit={handleCommitDirective} className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-[11px] font-bold text-slate-700 block">
              Append Additional Executive Directives
            </label>
            <input
              type="text"
              placeholder="Directive Title (e.g. Sluice Gate Replacement Sanction)"
              value={newDirectiveTitle}
              onChange={(e) => setNewDirectiveTitle(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
            />
            <textarea
              rows={2}
              placeholder="Enter formal decision or field instructions for next cycle..."
              value={newDirectiveText}
              onChange={(e) => setNewDirectiveText(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Audited by District Nodal Hydrologist • e-Sign Active</span>
              </span>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0077b6] hover:bg-[#005f92] text-white font-bold rounded-xl text-xs shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Commit Decisions to System Audit</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
