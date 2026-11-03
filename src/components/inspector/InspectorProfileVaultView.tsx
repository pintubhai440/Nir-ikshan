import React, { useState } from 'react';
import { CalibratedHardwareDevice, OfflineVaultQueueItem } from './types';
import { 
  UserCheck, 
  ShieldCheck, 
  Database, 
  RefreshCw, 
  Download, 
  Activity, 
  Sun, 
  Moon, 
  CheckCircle2, 
  Clock, 
  Key, 
  HardDrive,
  FileText,
  BadgeCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { SupabaseFieldInspectorRow } from '../../data/allDistrictsTeamData';

interface InspectorProfileVaultViewProps {
  inspector?: SupabaseFieldInspectorRow;
  devices: CalibratedHardwareDevice[];
  vaultQueue: OfflineVaultQueueItem[];
  onTriggerSync: () => void;
  isSyncing: boolean;
  sunlightMode: boolean;
  onToggleSunlightMode: () => void;
}

export const InspectorProfileVaultView: React.FC<InspectorProfileVaultViewProps> = ({
  inspector,
  devices,
  vaultQueue,
  onTriggerSync,
  isSyncing,
  sunlightMode,
  onToggleSunlightMode,
}) => {
  const [exported, setExported] = useState(false);

  const inspectorName = inspector?.full_name || 'Smt. Pooja Reddy';
  const inspectorId = inspector?.inspector_id || 'INSP-1104';
  const districtName = inspector?.district || 'Vizianagaram';
  const mandalName = inspector?.mandal || 'Bobbili Mandal';

  const initials = inspectorName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'PR';

  const handleExportDump = () => {
    setExported(true);
    const dumpData = {
      inspector: `${inspectorName} (Cadre #${inspectorId})`,
      district: districtName,
      mandal: mandalName,
      meterId: inspector?.meter_id || 'TDS-VZM-001',
      timestamp: new Date().toISOString(),
      vaultRecords: vaultQueue,
      signature: 'SHA256:7a9f44102bcd9841ef2093e01',
    };
    const blob = new Blob([JSON.stringify(dumpData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AP_WRD_${inspectorId.replace(/\W/g, '_')}_AUDIT_VAULT_${Date.now()}.bin`;
    a.click();
    confetti({ particleCount: 50, spread: 50 });
  };

  return (
    <div className="space-y-5">
      {/* Officer Credential & Jurisdiction Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#03045E] to-[#0077B6] text-white flex items-center justify-center font-bold text-xl shadow-xs">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{inspectorName}</h3>
                <span className="text-[10px] font-mono font-bold bg-blue-100 text-[#0077B6] px-2 py-0.5 rounded">
                  Cadre #{inspectorId}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Field Hydrologist &amp; Statutory Cadastral Inspector • AP Water Resources Department
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600">
                <span>Jurisdiction: {districtName} — {mandalName}</span>
                <span className="text-slate-300">•</span>
                <span>Testing Kit: {inspector?.meter_id || 'TDS Multi-Param'}</span>
              </div>
            </div>
          </div>

          {/* Aadhaar Cryptographic Signature Pill */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-emerald-950 block">Aadhaar Cryptographic e-Sign</span>
              <span className="text-[10px] font-mono text-emerald-800">UIDAI Verified • SHA256:7a9f...3e01</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2 Columns: Left = Offline Data Vault | Right = Calibrated Hardware Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left (6 Cols): Encrypted Offline Data Vault */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-[#0077B6]" />
                <span>Offline Encrypted Data Vault</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                On-device SQLite storage with cryptographic SHA-256 seal
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              14.8 MB / 64 MB
            </span>
          </div>

          {/* Storage Meter Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Local Storage Allocation</span>
              <span>23% Used</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-[#0077B6] h-2 rounded-full" style={{ width: '23%' }}></div>
            </div>
          </div>

          {/* Queued Records */}
          <div className="space-y-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Queued Sync Records ({vaultQueue.length})
            </span>
            {vaultQueue.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <h5 className="font-bold text-slate-800">{item.assetName}</h5>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {item.recordType} • {(item.sizeKb / 1024).toFixed(1)} MB
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.syncStatus === 'SYNCED_CLOUD'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.syncStatus === 'SYNCED_CLOUD' ? 'Synced to Cloud' : 'Queued Local'}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                    {item.cryptographicHash}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="flex-1 py-2.5 bg-[#03045E] hover:bg-[#0077B6] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : 'Sync to AP-SWAN Cloud Server'}</span>
            </button>

            <button
              onClick={handleExportDump}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export to SD Card (.bin)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export to SD</span>
            </button>
          </div>
        </div>

        {/* Right (6 Cols): Hydrological Field Sensor Register */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0077B6]" />
                <span>Hydrological Field Sensor Register</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Calibrated hardware assigned to Inspector Pooja Reddy
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {devices.map((dev) => (
              <div
                key={dev.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-800">{dev.name}</h5>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    {dev.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  Model: {dev.model} • S/N: {dev.serialNumber}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Calibrated: {dev.calibratedOn}</span>
                  <span className="font-semibold text-slate-700">Valid Till: {dev.validUntil}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Tolerance: {dev.accuracyTolerance}
                </div>
              </div>
            ))}
          </div>

          {/* System Display Preferences: Sunlight Mode */}
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Outdoor Sunlight Mode (AAA)
              </span>
              <p className="text-[11px] text-slate-500">
                High-contrast anti-glare display for direct solar field conditions
              </p>
            </div>
            <button
              onClick={onToggleSunlightMode}
              className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                sunlightMode
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-600" />
              <span>{sunlightMode ? 'Sunlight Active' : 'Normal'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
