import React, { useState } from 'react';
import { 
  AP_MONSOON_RAINFALL_2026, 
  APDistrictRainfallRecord 
} from '../data/apMonsoonRainfall2026';
import { 
  CloudRain, 
  X, 
  Download, 
  MapPin, 
  Search, 
  AlertTriangle, 
  TrendingDown, 
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';

interface APRainfallTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlyToDistrict: (record: APDistrictRainfallRecord) => void;
}

export const APRainfallTelemetryModal: React.FC<APRainfallTelemetryModalProps> = ({
  isOpen,
  onClose,
  onFlyToDistrict,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'Coastal Andhra' | 'Rayalaseema' | 'North Coastal'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Deficient' | 'Scanty'>('all');

  if (!isOpen) return null;

  const filteredRecords = AP_MONSOON_RAINFALL_2026.filter((rec) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = rec.districtName.toLowerCase().includes(q);
      const matchRegion = rec.region.toLowerCase().includes(q);
      const matchBasin = rec.basin.toLowerCase().includes(q);
      if (!matchName && !matchRegion && !matchBasin) return false;
    }
    if (regionFilter !== 'all') {
      if (regionFilter === 'Coastal Andhra' && !rec.region.includes('Coastal') && !rec.region.includes('Delta') && !rec.region.includes('Valley')) return false;
      if (regionFilter === 'Rayalaseema' && !rec.region.includes('Rayalaseema')) return false;
      if (regionFilter === 'North Coastal' && !rec.region.includes('North Coastal')) return false;
    }
    if (statusFilter !== 'all' && rec.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const stateSummary = AP_MONSOON_RAINFALL_2026.find((r) => r.districtName === 'Andhra Pradesh');
  const coastalSummary = AP_MONSOON_RAINFALL_2026.find((r) => r.districtName === 'COASTAL ANDHRA REGION');
  const rayalaseemaSummary = AP_MONSOON_RAINFALL_2026.find((r) => r.districtName === 'RAYALASEEMA REGION');

  const handleDownloadCSV = () => {
    let csv = 'DISTRICT,Aug Normal (mm),Aug Actual (mm),Sep Normal (mm),Sep Actual (mm),Oct Normal (mm),Oct Actual (mm),Rainy Days,Cumulative Normal (mm),Cumulative Actual (mm),Deviation (%),Status\n';
    AP_MONSOON_RAINFALL_2026.forEach((r) => {
      csv += `"${r.districtName}",${r.augNormalMm},${r.augActualMm},${r.sepNormalMm},${r.sepActualMm},${r.octNormalMm},${r.octActualMm},${r.rainyDays},${r.cumulativeNormalMm},${r.cumulativeActualMm},${r.deviationPercent},"${r.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Andhra_Pradesh_District_Wise_Rainfall_Jun01_to_Oct13_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-xs font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  Andhra Pradesh District-Wise Monsoon Rainfall Grid
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono text-[10px] font-bold border border-teal-500/30">
                  Jun 01, 2026 – Oct 13, 2026
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  State Dev: {stateSummary?.deviationPercent ?? -41.76}%
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Official IMD / APWRIMS Hydro-Meteorological Telemetry across all 26 Districts + Polavaram & Markapuram.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Close Rainfall Grid Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* State & Regional Overview Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-900/40 border-b border-slate-800/80">
          {/* AP State Total */}
          <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider">
                ANDHRA PRADESH STATE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800/60 font-bold">
                {stateSummary?.status ?? 'Deficient'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {stateSummary?.cumulativeActualMm ?? 394.64} mm
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / Norm: {stateSummary?.cumulativeNormalMm ?? 677.63} mm
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60 text-slate-300">
              <span>Departure: <strong className="text-amber-400 font-mono">{stateSummary?.deviationPercent ?? -41.76}%</strong></span>
              <span>Rainy Days: <strong className="text-sky-300 font-mono">{stateSummary?.rainyDays ?? 66}</strong></span>
            </div>
          </div>

          {/* Coastal Andhra */}
          <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-wider">
                COASTAL ANDHRA REGION
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800/60 font-bold">
                {coastalSummary?.status ?? 'Deficient'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {coastalSummary?.cumulativeActualMm ?? 512.47} mm
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / Norm: {coastalSummary?.cumulativeNormalMm ?? 758.22} mm
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60 text-slate-300">
              <span>Departure: <strong className="text-amber-400 font-mono">{coastalSummary?.deviationPercent ?? -32.41}%</strong></span>
              <span>Rainy Days: <strong className="text-teal-300 font-mono">{coastalSummary?.rainyDays ?? 57}</strong></span>
            </div>
          </div>

          {/* Rayalaseema */}
          <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                RAYALASEEMA REGION
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-800/60 font-bold">
                {rayalaseemaSummary?.status ?? 'Deficient'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {rayalaseemaSummary?.cumulativeActualMm ?? 234.18} mm
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / Norm: {rayalaseemaSummary?.cumulativeNormalMm ?? 476.15} mm
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60 text-slate-300">
              <span>Departure: <strong className="text-rose-400 font-mono">{rayalaseemaSummary?.deviationPercent ?? -50.82}%</strong></span>
              <span>Rainy Days: <strong className="text-amber-300 font-mono">{rayalaseemaSummary?.rainyDays ?? 29}</strong></span>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-sm sm:max-w-md">
            <div className="relative flex-1 bg-slate-900 rounded-xl border border-slate-800 flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Search district, region, basin (e.g. Prakasam, Kurnool, Polavaram)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="p-1.5 text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filters & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setRegionFilter('all')}
                className={`px-2 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-colors ${
                  regionFilter === 'all' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Regions
              </button>
              <button
                onClick={() => setRegionFilter('Coastal Andhra')}
                className={`px-2 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-colors ${
                  regionFilter === 'Coastal Andhra' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Coastal
              </button>
              <button
                onClick={() => setRegionFilter('Rayalaseema')}
                className={`px-2 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-colors ${
                  regionFilter === 'Rayalaseema' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Rayalaseema
              </button>
            </div>

            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-colors ${
                  statusFilter === 'all' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({AP_MONSOON_RAINFALL_2026.length})
              </button>
              <button
                onClick={() => setStatusFilter('Scanty')}
                className={`px-2 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-colors ${
                  statusFilter === 'Scanty' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Scanty (Prakasam: -66%)
              </button>
            </div>

            <button
              onClick={handleDownloadCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-teal-500/40 hover:border-teal-400 text-teal-300 hover:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              title="Download District-Wise Rainfall Data in CSV Format"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/90 sticky top-0 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider z-10">
              <tr>
                <th className="py-2.5 px-3">District / Unit</th>
                <th className="py-2.5 px-2 text-center">Aug Act / Norm</th>
                <th className="py-2.5 px-2 text-center">Sep Act / Norm</th>
                <th className="py-2.5 px-2 text-center">Oct Act / Norm</th>
                <th className="py-2.5 px-2 text-center">Rainy Days</th>
                <th className="py-2.5 px-2 text-right">Cumulative Normal</th>
                <th className="py-2.5 px-2 text-right">Cumulative Actual</th>
                <th className="py-2.5 px-2 text-center">Deviation (%)</th>
                <th className="py-2.5 px-2 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Map Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredRecords.map((r) => {
                const isHighlight = r.isRegionTotal;
                const isScanty = r.status === 'Scanty';
                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-slate-900/70 transition-colors ${
                      isHighlight
                        ? 'bg-blue-950/40 font-bold border-t-2 border-b-2 border-sky-800/50'
                        : isScanty
                        ? 'bg-rose-950/20'
                        : ''
                    }`}
                  >
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        {isHighlight ? (
                          <span className="text-base">🏛️</span>
                        ) : isScanty ? (
                          <span className="text-base">🚨</span>
                        ) : (
                          <span className="text-base">🌧️</span>
                        )}
                        <div>
                          <div className={`font-bold ${isHighlight ? 'text-sky-300 text-xs' : 'text-white'}`}>
                            {r.districtName}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {r.region} • {r.lat.toFixed(3)}°N, {r.lng.toFixed(3)}°E
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-slate-300">
                      <span className="text-white font-bold">{r.augActualMm}</span>
                      <span className="text-slate-500 text-[10px]"> / {r.augNormalMm}</span>
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-slate-300">
                      <span className="text-white font-bold">{r.sepActualMm}</span>
                      <span className="text-slate-500 text-[10px]"> / {r.sepNormalMm}</span>
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-slate-300">
                      <span className="text-white font-bold">{r.octActualMm}</span>
                      <span className="text-slate-500 text-[10px]"> / {r.octNormalMm}</span>
                    </td>
                    <td className="py-2 px-2 text-center font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-sky-300 font-bold">
                        {r.rainyDays} d
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-slate-300">
                      {r.cumulativeNormalMm.toFixed(2)} mm
                    </td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-white">
                      {r.cumulativeActualMm.toFixed(2)} mm
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] ${
                          isScanty
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {r.deviationPercent > 0 ? '+' : ''}{r.deviationPercent}%
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isScanty
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => {
                          onFlyToDistrict(r);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-teal-600/30 hover:bg-teal-600 text-teal-200 hover:text-white font-bold text-[10px] flex items-center gap-1 mx-auto transition-colors cursor-pointer border border-teal-500/30"
                        title={`Fly to ${r.districtName} on Map`}
                      >
                        <MapPin className="w-3 h-3" />
                        <span>Fly to Map</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-slate-400 text-[11px] flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span>Showing {filteredRecords.length} District & Regional Records</span>
            <span className="text-slate-600">•</span>
            <span className="text-teal-400 font-medium">Jun 01 to Oct 13, 2026 Monsoon Telemetry</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500">Source: IMD / APWRIMS Hydro-Met Grid</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
