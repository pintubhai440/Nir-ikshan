import React, { useState } from 'react';
import { EndangeredZoneComplaint, MicroWatershed } from '../types/watershed';
import { 
  Flame, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  ExternalLink, 
  Camera, 
  Building, 
  Plus,
  Filter,
  Search
} from 'lucide-react';

interface EndangeredComplaintsFeedProps {
  complaints: EndangeredZoneComplaint[];
  watersheds: MicroWatershed[];
  onOpenReportModal: () => void;
  onSelectWatershed: (id: string) => void;
}

export const EndangeredComplaintsFeed: React.FC<EndangeredComplaintsFeedProps> = ({
  complaints,
  watersheds,
  onOpenReportModal,
  onSelectWatershed,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = complaints.filter((c) => {
    const matchesSeverity = selectedSeverity === 'all' || c.severity === selectedSeverity;
    const matchesSearch =
      c.locationLandmark.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.watershedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hazardType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const getSeverityBadge = (s: EndangeredZoneComplaint['severity']) => {
    switch (s) {
      case 'CRITICAL_HAZARD':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HIGH_ALERT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MODERATE_WATCH':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusBadge = (st: EndangeredZoneComplaint['status']) => {
    switch (st) {
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'EMERGENCY_ACTION_TAKEN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'INSPECTION_ORDERED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PENDING_VERIFICATION':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="p-2 rounded-lg bg-rose-100 text-rose-700">
              <Flame className="w-5 h-5" />
            </span>
            <span>Citizen Endangered Water Zone Complaints</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Crowdsourced community surveillance: Citizens upload screenshots and photos of dried borewells, breached bunds, and toxic influx.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Endangered Zone / Complain</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search complaints by location landmark, watershed, or hazard..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-slate-800 border-none focus:outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-semibold mr-1">Severity:</span>
          {['all', 'CRITICAL_HAZARD', 'HIGH_ALERT', 'MODERATE_WATCH'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                selectedSeverity === sev
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {sev === 'all'
                ? 'All Hazards'
                : sev === 'CRITICAL_HAZARD'
                ? 'Critical 🔴'
                : sev === 'HIGH_ALERT'
                ? 'High Risk 🟠'
                : 'Watch 🟡'}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            {/* Screenshot Evidence Header Image */}
            <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
              <img
                src={item.screenshotUrl}
                alt={item.hazardType}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5">
                <span className="bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/20">
                  {item.id}
                </span>
              </div>
              <div className="absolute top-2.5 right-2.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(item.severity)}`}>
                  {item.severity.replace('_', ' ')}
                </span>
              </div>
              <div className="absolute bottom-2 left-2 right-2 bg-slate-900/75 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded flex items-center justify-between font-mono">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                  {item.gpsCoordinates.lat.toFixed(4)}°N, {item.gpsCoordinates.lng.toFixed(4)}°E
                </span>
                <span className="text-[10px] text-slate-300 truncate max-w-[130px]" title={item.locationLandmark}>
                  {item.locationLandmark}
                </span>
              </div>
            </div>

            {/* Complaint Content */}
            <div className="p-4 space-y-3 flex-1">
              <div>
                <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {item.hazardType}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                  {item.watershedName}
                </h4>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-sans">
                {item.description}
              </p>

              <div className="text-xs space-y-1 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 font-mono text-[11px] text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Reported by:</span>
                  <span className="font-semibold text-emerald-800">Protected Citizen 🔒</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Contact:</span>
                  <span className="font-semibold text-emerald-800 font-mono">Confidential 🔒</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Logged at:</span>
                  <span className="text-slate-500">{item.timestamp}</span>
                </div>
              </div>

              {item.inspectionNotes && (
                <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <strong>Official Action:</strong> {item.inspectionNotes}
                </div>
              )}
            </div>

            {/* Bottom Status Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(item.status)}`}>
                {item.status.replace(/_/g, ' ')}
              </span>
              <button
                onClick={() => onSelectWatershed(item.watershedId)}
                className="text-xs font-bold text-[#0047ab] hover:underline flex items-center gap-1"
              >
                <span>View on Map</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
