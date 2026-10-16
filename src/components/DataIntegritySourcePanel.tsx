import React from 'react';
import { OFFICIAL_DATA_SOURCES } from '../data/watershedData';
import { 
  Database, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  Layers, 
  Cpu, 
  Radio, 
  CheckCircle2,
  FileText
} from 'lucide-react';

export const DataIntegritySourcePanel: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-[#0047ab]" />
            National Hydrological Portals & Scientific Data Integrity
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Zero Fabricated Data Guarantee. Standardised classification between statutory government observations, satellite proxies, and physical field audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            100% AUDITABLE PROVENANCE
          </span>
        </div>
      </div>

      {/* Official Government Data Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {OFFICIAL_DATA_SOURCES.map((src, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#0047ab] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {src.name}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {src.badge}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {src.title}
              </h3>

              <div className="text-xs text-slate-500 font-medium">
                {src.agency}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                {src.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-mono">
                Cadence: {src.updateCadence}
              </span>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#0047ab] hover:underline"
              >
                <span>Visit Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Roadmap Section 18: Four Pillars of Scientific Honesty */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          The Four Pillars of Data Integrity (Roadmap §18)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-1">
            <span className="font-mono font-bold text-emerald-800 text-[11px] block">
              1. GOVERNMENT OBSERVED
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Direct measurement from CGWB piezometer telemetry (DWLR), IMD automatic rain gauges, and CWC discharge stations.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/60 space-y-1">
            <span className="font-mono font-bold text-sky-800 text-[11px] block">
              2. SATELLITE DERIVED
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Sentinel-2 & Cartosat remote sensing proxies for agricultural crop extent, vegetation stress (NDVI), and impervious built-up area.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 space-y-1">
            <span className="font-mono font-bold text-amber-800 text-[11px] block">
              3. MODELLED ESTIMATE
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Physics-based soil infiltration, storage coefficients, and recovery windows. Always clearly disclaimed as estimates.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/60 space-y-1">
            <span className="font-mono font-bold text-purple-800 text-[11px] block">
              4. FIELD VERIFIED
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Physical ground audits signed off with geo-fenced GPS coordinates, time-stamped photo proofs, and inspector identities.
            </p>
          </div>
        </div>
      </div>

      {/* No IoT Hardware Justification */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-700 space-y-2">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600" />
          Why This Architecture Uses Public Geospatial Datasets Instead of Speculative IoT Sensors
        </h4>
        <p className="leading-relaxed text-slate-600">
          Deploying physical IoT microcontrollers (Arduino/ESP32) on millions of scattered rural farm borewells is cost-prohibitive, unscalable, and susceptible to power outages and vandalization. <strong>Nir-ikshan</strong> solves this by leveraging India's existing world-class satellite infrastructure (ISRO Bhuvan, Sentinel-2), CGWB's automated piezometric telemetry network, and ground social audits under Gram Panchayats.
        </p>
      </div>
    </div>
  );
};
