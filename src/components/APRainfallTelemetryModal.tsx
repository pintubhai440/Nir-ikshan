import React, { useState, useMemo } from 'react';
import { 
  AP_MONSOON_RAINFALL_2026, 
  APDistrictRainfallRecord 
} from '../data/apMonsoonRainfall2026';
import {
  AP_MANDAL_WISE_RAINFALL_2026,
  AP_DISTRICT_RAINFALL_SUMMARIES,
  APMandalRainfallRecord,
  MandalRainfallStatus
} from '../data/apMandalWiseRainfall2026';
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
  Info,
  Layers,
  Filter
} from 'lucide-react';

interface APRainfallTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlyToDistrict: (record: APDistrictRainfallRecord) => void;
  onFlyToMandal?: (record: APMandalRainfallRecord) => void;
}

export const APRainfallTelemetryModal: React.FC<APRainfallTelemetryModalProps> = ({
  isOpen,
  onClose,
  onFlyToDistrict,
  onFlyToMandal,
}) => {
  // Tab view: 'district' | 'mandal'
  const [activeTab, setActiveTab] = useState<'mandal' | 'district'>('mandal');

  // District Overview Filters
  const [districtSearchTerm, setDistrictSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'Coastal Andhra' | 'Rayalaseema' | 'North Coastal'>('all');
  const [districtStatusFilter, setDistrictStatusFilter] = useState<'all' | 'Deficient' | 'Scanty'>('all');

  // Mandal-Wise Filters
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [mandalSearchTerm, setMandalSearchTerm] = useState('');
  const [mandalStatusFilter, setMandalStatusFilter] = useState<string>('all');

  if (!isOpen) return null;

  // District records filtering
  const filteredDistrictRecords = AP_MONSOON_RAINFALL_2026.filter((rec) => {
    if (districtSearchTerm) {
      const q = districtSearchTerm.toLowerCase();
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
    if (districtStatusFilter !== 'all' && rec.status !== districtStatusFilter) {
      return false;
    }
    return true;
  });

  // Mandal records filtering
  const filteredMandalRecords = useMemo(() => {
    return AP_MANDAL_WISE_RAINFALL_2026.filter((rec) => {
      if (selectedDistrict !== 'All' && rec.district !== selectedDistrict) {
        return false;
      }
      if (mandalStatusFilter !== 'all' && rec.status !== mandalStatusFilter) {
        return false;
      }
      if (mandalSearchTerm) {
        const q = mandalSearchTerm.toLowerCase();
        const matchMandal = rec.mandal.toLowerCase().includes(q);
        const matchDistrict = rec.district.toLowerCase().includes(q);
        if (!matchMandal && !matchDistrict) return false;
      }
      return true;
    });
  }, [selectedDistrict, mandalStatusFilter, mandalSearchTerm]);

  // Dynamic status count banner for selected district (or all mandals)
  const mandalSummaryBanner = useMemo(() => {
    if (selectedDistrict !== 'All' && AP_DISTRICT_RAINFALL_SUMMARIES[selectedDistrict]) {
      return AP_DISTRICT_RAINFALL_SUMMARIES[selectedDistrict];
    }
    let largeExcess = 0, excess = 0, normal = 0, deficient = 0, largeDeficient = 0, noRain = 0;
    let sumAct = 0, sumNorm = 0;
    AP_MANDAL_WISE_RAINFALL_2026.forEach((r) => {
      sumAct += r.actualMm;
      sumNorm += r.normalMm;
      if (r.status === 'Large Excess') largeExcess++;
      else if (r.status === 'Excess') excess++;
      else if (r.status === 'Normal') normal++;
      else if (r.status === 'Deficient') deficient++;
      else if (r.status === 'Large Deficient') largeDeficient++;
      else if (r.status === 'No Rain') noRain++;
    });
    const total = AP_MANDAL_WISE_RAINFALL_2026.length;
    return {
      district: 'All Andhra Pradesh',
      largeExcess,
      excess,
      normal,
      deficient,
      largeDeficient,
      noRain,
      totalMandals: total,
      avgActualMm: Number((sumAct / total).toFixed(1)),
      avgNormalMm: Number((sumNorm / total).toFixed(1)),
      avgDeviationPercent: Number((((sumAct - sumNorm) / sumNorm) * 100).toFixed(1)),
    };
  }, [selectedDistrict]);

  const allDistrictNames = useMemo(() => {
    return Object.keys(AP_DISTRICT_RAINFALL_SUMMARIES).sort();
  }, []);

  const stateSummary = AP_MONSOON_RAINFALL_2026.find((r) => r.districtName === 'Andhra Pradesh');
  const coastalSummary = AP_MONSOON_RAINFALL_2026.find((r) => r.districtName === 'COASTAL ANDHRA REGION');
  const rayalaseemaSummary = AP_MONSOON_RAINFALL_2026.find((r) => r.districtName === 'RAYALASEEMA REGION');

  // CSV Exporters
  const handleDownloadDistrictCSV = () => {
    let csv = 'DISTRICT,Aug Normal (mm),Aug Actual (mm),Sep Normal (mm),Sep Actual (mm),Oct Normal (mm),Oct Actual (mm),Rainy Days,Cumulative Normal (mm),Cumulative Actual (mm),Deviation (%),Status\n';
    AP_MONSOON_RAINFALL_2026.forEach((r) => {
      csv += `"${r.districtName}",${r.augNormalMm},${r.augActualMm},${r.sepNormalMm},${r.sepActualMm},${r.octNormalMm},${r.octActualMm},${r.rainyDays},${r.cumulativeNormalMm},${r.cumulativeActualMm},${r.deviationPercent},"${r.status}"\n`;
    });
    downloadBlob(csv, 'Andhra_Pradesh_District_Wise_Rainfall_2026.csv');
  };

  const handleDownloadMandalCSV = () => {
    let csv = 'SNO,DISTRICT,MANDAL,ACTUAL_MM,NORMAL_MM,DEVIATION_PERCENT,STATUS,LATITUDE,LONGITUDE,PERIOD\n';
    filteredMandalRecords.forEach((r) => {
      csv += `${r.sno},"${r.district}","${r.mandal}",${r.actualMm},${r.normalMm},${r.deviationPercent},"${r.status}",${r.lat},${r.lng},"${r.period}"\n`;
    });
    downloadBlob(csv, `AP_Mandal_Wise_Rainfall_${selectedDistrict.replace(/\s+/g, '_')}_2026.csv`);
  };

  const downloadBlob = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-7xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-xs font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  Andhra Pradesh Hydro-Meteorological Rainfall Surveillance Grid
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono text-[10px] font-bold border border-teal-500/30">
                  01/06/2025 to 13/10/2026
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  State Dev: {stateSummary?.deviationPercent ?? -41.76}%
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Official APWRIMS & IMD Cumulative Rainfall Telemetry across all 28 Districts and 688 Mandals.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Tab Switcher */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-2xl p-1 gap-1">
              <button
                onClick={() => setActiveTab('mandal')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'mandal'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-teal-300" />
                <span>Mandal-Wise Grid ({AP_MANDAL_WISE_RAINFALL_2026.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('district')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'district'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-sky-300" />
                <span>District Overview (28)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Close Rainfall Grid Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================= MANDAL-WISE VIEW ======================= */}
        {activeTab === 'mandal' && (
          <>
            {/* Government Status Pill Summary Banner (Matches exact APWRIMS portal layout from photos) */}
            <div className="bg-slate-900/90 border-b border-slate-800 p-3 sm:px-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-xs sm:text-sm">
                    Mandal Wise Cumulative Rainfall (mm) Status
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    in <strong className="text-amber-300">{selectedDistrict === 'All' ? 'Andhra Pradesh State' : `${selectedDistrict} District`}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px] font-mono">
                    Total: <strong className="text-white">{mandalSummaryBanner.totalMandals} Mandals</strong>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    Avg Act: <strong className="text-teal-300">{mandalSummaryBanner.avgActualMm} mm</strong>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    Avg Norm: <strong className="text-slate-300">{mandalSummaryBanner.avgNormalMm} mm</strong>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    Dev: <strong className={mandalSummaryBanner.avgDeviationPercent < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {mandalSummaryBanner.avgDeviationPercent > 0 ? '+' : ''}{mandalSummaryBanner.avgDeviationPercent}%
                    </strong>
                  </span>
                </div>
              </div>

              {/* Exact Colored Status Blocks (Large Excess, Excess, Normal, Deficient, Large Deficient, No Rain) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 rounded-xl overflow-hidden border border-slate-800 text-[11px] font-bold text-center">
                <div className="bg-[#0284c7] text-white py-1.5 px-2 border-r border-slate-950/20">
                  Large Excess : {mandalSummaryBanner.largeExcess}
                </div>
                <div className="bg-[#0ea5e9] text-white py-1.5 px-2 border-r border-slate-950/20">
                  Excess : {mandalSummaryBanner.excess}
                </div>
                <div className="bg-[#16a34a] text-white py-1.5 px-2 border-r border-slate-950/20">
                  Normal : {mandalSummaryBanner.normal}
                </div>
                <div className="bg-[#dc2626] text-white py-1.5 px-2 border-r border-slate-950/20">
                  Deficient : {mandalSummaryBanner.deficient}
                </div>
                <div className="bg-[#ea580c] text-white py-1.5 px-2 border-r border-slate-950/20">
                  Large Deficient : {mandalSummaryBanner.largeDeficient}
                </div>
                <div className="bg-[#475569] text-white py-1.5 px-2">
                  No Rain : {mandalSummaryBanner.noRain}
                </div>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1 max-w-2xl flex-wrap">
                {/* District Dropdown Selector */}
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold shrink-0">District:</span>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer pr-2"
                  >
                    <option value="All" className="bg-slate-900 text-white">All 28 Districts ({AP_MANDAL_WISE_RAINFALL_2026.length} Mandals)</option>
                    {allDistrictNames.map((d) => (
                      <option key={d} value={d} className="bg-slate-900 text-white">
                        {d} ({AP_DISTRICT_RAINFALL_SUMMARIES[d]?.totalMandals ?? 0} Mandals)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mandal Search Box */}
                <div className="relative flex-1 min-w-[200px] bg-slate-900 rounded-xl border border-slate-800 flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 ml-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search mandal (e.g. Yerpedu, Bobbili, Narsipatnam, Guntur)..."
                    value={mandalSearchTerm}
                    onChange={(e) => setMandalSearchTerm(e.target.value)}
                    className="w-full bg-transparent px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  >
                  </input>
                  {mandalSearchTerm && (
                    <button onClick={() => setMandalSearchTerm('')} className="p-1.5 text-slate-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter Pills & Export */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
                  <button
                    onClick={() => setMandalStatusFilter('all')}
                    className={`px-2 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-colors ${
                      mandalStatusFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({filteredMandalRecords.length})
                  </button>
                  <button
                    onClick={() => setMandalStatusFilter('Normal')}
                    className={`px-2 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-colors ${
                      mandalStatusFilter === 'Normal' ? 'bg-[#16a34a] text-white' : 'text-emerald-400 hover:text-white'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => setMandalStatusFilter('Deficient')}
                    className={`px-2 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-colors ${
                      mandalStatusFilter === 'Deficient' ? 'bg-[#dc2626] text-white' : 'text-rose-400 hover:text-white'
                    }`}
                  >
                    Deficient
                  </button>
                  <button
                    onClick={() => setMandalStatusFilter('Large Deficient')}
                    className={`px-2 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-colors ${
                      mandalStatusFilter === 'Large Deficient' ? 'bg-[#ea580c] text-white' : 'text-amber-400 hover:text-white'
                    }`}
                  >
                    Large Deficient
                  </button>
                  <button
                    onClick={() => setMandalStatusFilter('Excess')}
                    className={`px-2 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-colors ${
                      mandalStatusFilter === 'Excess' ? 'bg-[#0ea5e9] text-white' : 'text-sky-400 hover:text-white'
                    }`}
                  >
                    Excess
                  </button>
                </div>

                <button
                  onClick={handleDownloadMandalCSV}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-teal-500/40 hover:border-teal-400 text-teal-300 hover:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  title="Download Mandal-Wise Rainfall in CSV Format"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Mandal Data Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900/95 sticky top-0 border-b border-slate-800 text-[11px] font-mono text-slate-300 uppercase tracking-wider z-10 shadow-sm">
                  <tr>
                    <th className="py-2.5 px-3 w-16 text-center">Sno</th>
                    <th className="py-2.5 px-3">Mandal</th>
                    <th className="py-2.5 px-3">District</th>
                    <th className="py-2.5 px-3 text-right">Actual(mm)</th>
                    <th className="py-2.5 px-3 text-right">Normal(mm)</th>
                    <th className="py-2.5 px-3 text-center">Deviation in %</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Map Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredMandalRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No mandal rainfall records matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredMandalRecords.map((r, i) => {
                      const isNormal = r.status === 'Normal';
                      const isDeficient = r.status === 'Deficient';
                      const isLargeDeficient = r.status === 'Large Deficient';
                      const isExcess = r.status === 'Excess' || r.status === 'Large Excess';

                      // Status cell styling matching exact official colors from uploaded screenshots
                      const statusBg = isNormal
                        ? 'bg-[#16a34a] text-white'
                        : isDeficient
                        ? 'bg-[#dc2626] text-white'
                        : isLargeDeficient
                        ? 'bg-[#ea580c] text-white'
                        : isExcess
                        ? 'bg-[#0ea5e9] text-white'
                        : 'bg-[#475569] text-white';

                      return (
                        <tr
                          key={r.id}
                          className="hover:bg-slate-900/70 transition-colors border-b border-slate-900"
                        >
                          <td className="py-2 px-3 text-center font-mono text-slate-400">
                            {r.sno}
                          </td>
                          <td className="py-2 px-3 font-bold text-white text-xs">
                            <div className="flex items-center gap-1.5">
                              <span>🌧️</span>
                              <span>{r.mandal}</span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-slate-300 font-medium">
                            {r.district}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-white">
                            {r.actualMm.toFixed(1)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-400">
                            {r.normalMm.toFixed(1)}
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold">
                            <span className={`px-2 py-0.5 rounded-md text-[11px] ${
                              isNormal
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : isLargeDeficient
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}>
                              {r.deviationPercent > 0 ? '+' : ''}{r.deviationPercent.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-1 px-3 text-center">
                            <span className={`inline-block px-3 py-1 rounded-md text-[11px] font-bold ${statusBg} min-w-[110px]`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-1 px-3 text-center">
                            <button
                              onClick={() => {
                                if (onFlyToMandal) {
                                  onFlyToMandal(r);
                                }
                                onClose();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-teal-600/30 hover:bg-teal-600 text-teal-200 hover:text-white font-bold text-[10px] inline-flex items-center gap-1 transition-colors cursor-pointer border border-teal-500/30"
                              title={`Fly to ${r.mandal} (${r.district}) on Leaflet Map`}
                            >
                              <MapPin className="w-3 h-3" />
                              <span>Fly to Map</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ======================= DISTRICT OVERVIEW ======================= */}
        {activeTab === 'district' && (
          <>
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
                    value={districtSearchTerm}
                    onChange={(e) => setDistrictSearchTerm(e.target.value)}
                    className="w-full bg-transparent px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  {districtSearchTerm && (
                    <button onClick={() => setDistrictSearchTerm('')} className="p-1.5 text-slate-400 hover:text-white">
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
                    onClick={() => setDistrictStatusFilter('all')}
                    className={`px-2 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-colors ${
                      districtStatusFilter === 'all' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({AP_MONSOON_RAINFALL_2026.length})
                  </button>
                  <button
                    onClick={() => setDistrictStatusFilter('Scanty')}
                    className={`px-2 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-colors ${
                      districtStatusFilter === 'Scanty' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Scanty (Prakasam: -66%)
                  </button>
                </div>

                <button
                  onClick={handleDownloadDistrictCSV}
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
                  {filteredDistrictRecords.map((r) => {
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
          </>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-slate-400 text-[11px] flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span>
              Showing {activeTab === 'mandal' ? `${filteredMandalRecords.length} Mandal Records` : `${filteredDistrictRecords.length} District & Regional Records`}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-teal-400 font-medium">01/06/2025 to 13/10/2026 Cumulative Telemetry</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500">Source: APWRIMS & IMD Hydro-Meteorological Surveillance</span>
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
