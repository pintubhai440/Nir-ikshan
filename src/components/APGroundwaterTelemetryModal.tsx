import React, { useState, useMemo } from 'react';
import { 
  AP_GROUNDWATER_DTWL_2026, 
  APGroundwaterDtwlRecord,
  getGroundwaterDistrictSummary 
} from '../data/apGroundwaterDtwl2026';
import { 
  X, 
  Search, 
  Download, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Layers, 
  ArrowUpDown,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';

interface APGroundwaterTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStation: (record: APGroundwaterDtwlRecord) => void;
}

export const APGroundwaterTelemetryModal: React.FC<APGroundwaterTelemetryModalProps> = ({
  isOpen,
  onClose,
  onSelectStation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'blue' | 'green' | 'yellow' | 'red'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('asc');

  const districtSummaries = useMemo(() => getGroundwaterDistrictSummary(), []);
  const allDistricts = useMemo(() => Object.keys(districtSummaries).sort(), [districtSummaries]);

  // Overall Statistics
  const overallStats = useMemo(() => {
    const total = AP_GROUNDWATER_DTWL_2026.length;
    const avgDtwl = (AP_GROUNDWATER_DTWL_2026.reduce((acc, c) => acc + c.dtwlMbgl, 0) / total).toFixed(2);
    const critical = AP_GROUNDWATER_DTWL_2026.filter(r => r.dtwlMbgl > 10.0).length;
    const safe = AP_GROUNDWATER_DTWL_2026.filter(r => r.dtwlMbgl <= 5.0).length;
    const shallow = AP_GROUNDWATER_DTWL_2026.filter(r => r.dtwlMbgl < 2.0).length;
    const stressed = AP_GROUNDWATER_DTWL_2026.filter(r => r.dtwlMbgl > 5.0 && r.dtwlMbgl <= 10.0).length;
    
    // Deepest and Shallowest
    const sorted = [...AP_GROUNDWATER_DTWL_2026].sort((a, b) => a.dtwlMbgl - b.dtwlMbgl);
    const shallowest = sorted[0];
    const deepest = sorted[sorted.length - 1];

    return { total, avgDtwl, critical, safe, shallow, stressed, shallowest, deepest };
  }, []);

  // Filtered & Sorted list
  const filteredRecords = useMemo(() => {
    let result = AP_GROUNDWATER_DTWL_2026.filter((rec) => {
      if (selectedDistrict !== 'all') {
        const matchesDistrict = rec.district === selectedDistrict || `${rec.district} (${rec.state})` === selectedDistrict;
        if (!matchesDistrict) return false;
      }
      if (statusFilter !== 'all' && rec.statusColor !== statusFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchVillage = rec.village.toLowerCase().includes(q);
        const matchBlock = rec.block.toLowerCase().includes(q);
        const matchDistrict = rec.district.toLowerCase().includes(q);
        const matchState = rec.state.toLowerCase().includes(q);
        const matchDtwl = rec.dtwlMbgl.toString().includes(q);
        if (!matchVillage && !matchBlock && !matchDistrict && !matchState && !matchDtwl) return false;
      }
      return true;
    });

    if (sortOrder === 'asc') {
      result = [...result].sort((a, b) => a.dtwlMbgl - b.dtwlMbgl);
    } else if (sortOrder === 'desc') {
      result = [...result].sort((a, b) => b.dtwlMbgl - a.dtwlMbgl);
    }

    return result;
  }, [selectedDistrict, statusFilter, searchTerm, sortOrder]);

  const handleExportCSV = () => {
    const headers = ['STATE_UT', 'DISTRICT', 'BLOCK', 'VILLAGE', 'LATITUDE', 'LONGITUDE', 'DATE', 'DTWL_MBGL', 'AQUIFER_STATUS'];
    const rows = filteredRecords.map(r => [
      r.state,
      `"${r.district}"`,
      `"${r.block}"`,
      `"${r.village}"`,
      r.lat,
      r.lng,
      r.date,
      r.dtwlMbgl,
      `"${r.statusLabel}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AP_PreMonsoon_2026_Groundwater_DWLR_${filteredRecords.length}_Wells.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-0.5 rounded-full text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>OFFICIAL CGWB & AP GROUND WATER TELEMETRY</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Depth to Water Level (Pre-Monsoon Jan 2026)</span>
              <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border border-cyan-500/30">
                {AP_GROUNDWATER_DTWL_2026.length} Active DWLR Stations
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Unconfined aquifer depth below ground level (mbgl) recorded on 10-01-2026 across {allDistricts.length} monitored districts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              title={`Download CSV of all ${AP_GROUNDWATER_DTWL_2026.length} wells`}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Macro Summary Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 p-4 sm:p-5 bg-slate-900/60 border-b border-slate-800 text-xs">
          <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Stations</span>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">{overallStats.total}</div>
            <span className="text-[10px] text-slate-400 font-mono">{allDistricts.length} Districts Covered</span>
          </div>

          <div className="bg-blue-950/40 border border-blue-800/40 p-3 rounded-2xl">
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400">Avg Water Table</span>
            <div className="text-xl sm:text-2xl font-black text-sky-300 font-mono mt-0.5">{overallStats.avgDtwl} m</div>
            <span className="text-[10px] text-sky-400/80 font-mono">Below Ground Level</span>
          </div>

          <div className="bg-cyan-950/40 border border-cyan-800/40 p-3 rounded-2xl">
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">Shallow (&lt;2.0m)</span>
            <div className="text-xl sm:text-2xl font-black text-cyan-300 font-mono mt-0.5">{overallStats.shallow}</div>
            <span className="text-[10px] text-cyan-400/80 font-mono">Min: {overallStats.shallowest.dtwlMbgl}m ({overallStats.shallowest.village})</span>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-800/40 p-3 rounded-2xl">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Safe (2 - 5m)</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono mt-0.5">{overallStats.safe}</div>
            <span className="text-[10px] text-emerald-400/80 font-mono">Sustainable Storage</span>
          </div>

          <div className="bg-amber-950/40 border border-amber-800/40 p-3 rounded-2xl">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Stressed (5 - 10m)</span>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-0.5">{overallStats.stressed}</div>
            <span className="text-[10px] text-amber-400/80 font-mono">Moderate Drawdown</span>
          </div>

          <div className="bg-rose-950/40 border border-rose-800/40 p-3 rounded-2xl">
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">Critical (&gt;10m)</span>
            <div className="text-xl sm:text-2xl font-black text-rose-300 font-mono mt-0.5">{overallStats.critical}</div>
            <span className="text-[10px] text-rose-400/80 font-mono">Max: {overallStats.deepest.dtwlMbgl}m ({overallStats.deepest.village})</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Village, Block, District, or Depth..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* District Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Districts ({overallStats.total} Stations)</option>
              {allDistricts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist} ({districtSummaries[dist]?.count} stations, avg: {districtSummaries[dist]?.avgDtwl}m)
                </option>
              ))}
            </select>
          </div>

          {/* Status Color Pills */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 gap-1 overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({filteredRecords.length})
            </button>
            <button
              onClick={() => setStatusFilter('blue')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === 'blue' ? 'bg-sky-500 text-slate-950 font-black' : 'text-sky-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span>&lt;2m Shallow</span>
            </button>
            <button
              onClick={() => setStatusFilter('green')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === 'green' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-emerald-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>2-5m Safe</span>
            </button>
            <button
              onClick={() => setStatusFilter('yellow')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === 'yellow' ? 'bg-amber-400 text-slate-950 font-black' : 'text-amber-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>5-10m Stressed</span>
            </button>
            <button
              onClick={() => setStatusFilter('red')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === 'red' ? 'bg-rose-500 text-white font-black' : 'text-rose-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
              <span>&gt;10m Critical</span>
            </button>
          </div>

          {/* Sort order */}
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
            <span>Sort by Depth: {sortOrder === 'asc' ? 'Shallowest ↑' : 'Deepest ↓'}</span>
          </button>
        </div>

        {/* Wells Table / Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <AlertTriangle className="w-10 h-10 mx-auto text-amber-400 opacity-60" />
              <p className="font-bold text-base">No groundwater telemetry stations found</p>
              <p className="text-xs text-slate-500">Try adjusting your district or search keywords.</p>
            </div>
          ) : (
            <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-800/90 text-slate-300 font-bold uppercase tracking-wider text-[11px] sticky top-0 backdrop-blur-sm z-10 border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">Village / Monitoring Point</th>
                    <th className="py-3 px-3">Block / Mandal</th>
                    <th className="py-3 px-3">District</th>
                    <th className="py-3 px-3 font-mono">Coordinates</th>
                    <th className="py-3 px-3 font-mono text-right">DTWL (mbgl)</th>
                    <th className="py-3 px-3">Aquifer Condition</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {filteredRecords.map((rec, index) => {
                    const isCritical = rec.dtwlMbgl > 10.0;
                    const isShallow = rec.dtwlMbgl < 2.0;
                    const isSafe = rec.dtwlMbgl >= 2.0 && rec.dtwlMbgl <= 5.0;

                    return (
                      <tr 
                        key={rec.id}
                        className="hover:bg-slate-800/60 transition-colors group"
                      >
                        <td className="py-3 px-3 font-mono text-slate-500">{index + 1}</td>
                        <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isCritical ? 'bg-rose-500 shadow-xs shadow-rose-500/50' :
                            isShallow ? 'bg-sky-400' :
                            isSafe ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}></span>
                          <span>{rec.village}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-300">{rec.block}</td>
                        <td className="py-3 px-3 text-slate-300">{rec.district}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                          {rec.lat.toFixed(4)}, {rec.lng.toFixed(4)}
                        </td>
                        <td className="py-3 px-3 font-mono font-black text-right text-sm">
                          <span className={`px-2 py-0.5 rounded-md ${
                            isCritical ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                            isShallow ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' :
                            isSafe ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                            'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {rec.dtwlMbgl.toFixed(2)} m
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isCritical ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            isShallow ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                            isSafe ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {isCritical ? '🚨 Over-Exploited / Critical' :
                             isShallow ? '💧 Shallow / High Recharge' :
                             isSafe ? '🟢 Safe Sustainable Table' :
                             '🟡 Semi-Critical Stress'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => {
                              onSelectStation(rec);
                              onClose();
                            }}
                            className="px-3 py-1.5 bg-blue-600/90 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 mx-auto cursor-pointer shadow-xs active:scale-95"
                            title="Fly to and view on map"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Fly to Map</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="bg-slate-950/80 border-t border-slate-800 px-5 py-3 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Government Telemetry: Central Ground Water Board (CGWB) & Andhra Pradesh Ground Water Dept Pre-Monsoon Survey Jan 2026.</span>
          </div>
          <span className="font-mono text-slate-500">DWLR Sensors • Unconfined Aquifer • mbgl: meters below ground level</span>
        </div>

      </div>
    </div>
  );
};
