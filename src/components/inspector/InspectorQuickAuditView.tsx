import React, { useState } from 'react';
import { 
  PlusCircle, 
  MapPin, 
  Compass, 
  Camera, 
  CheckCircle2, 
  ArrowRight, 
  Navigation, 
  Upload, 
  Layers, 
  SlidersHorizontal,
  Crosshair
} from 'lucide-react';
import { CadastralMapAssetItem } from './types';

interface InspectorQuickAuditViewProps {
  onRegisterAndLaunch: (assetData: Partial<CadastralMapAssetItem>) => void;
  onQuickSelectNearby: (assetName: string) => void;
}

export const InspectorQuickAuditView: React.FC<InspectorQuickAuditViewProps> = ({
  onRegisterAndLaunch,
  onQuickSelectNearby,
}) => {
  const [assetType, setAssetType] = useState('Check Dam');
  const [localName, setLocalName] = useState('');
  const [surveyNo, setSurveyNo] = useState('');
  const [ayacut, setAyacut] = useState('120');
  const [village, setVillage] = useState('Bobbili Rural');
  const [photoUrl, setPhotoUrl] = useState('');
  const [gpsLock, setGpsLock] = useState({ lat: 18.5721, lng: 83.3644, accuracy: 1.8 });

  const nearbyAssets = [
    { name: 'Pedda Cheruvu Sluice Gate Complex', code: 'AP-VZM-BOB-0082', dist: '180m', type: 'Sluice Gate' },
    { name: 'Ramalayam Deep Recharge Shaft', code: 'AP-VZM-BOB-0091', dist: '1.2 km', type: 'Recharge Shaft' },
    { name: 'Vegavathi Check Dam #4', code: 'AP-VZM-BOB-0105', dist: '2.1 km', type: 'Check Dam' },
  ];

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localName) return;

    onRegisterAndLaunch({
      id: `MAP-NEW-${Date.now()}`,
      name: localName,
      assetCode: `AP-VZM-UNMAPPED-${Math.floor(100 + Math.random() * 900)}`,
      parcelNo: surveyNo || 'R.S. Survey Pending',
      type: assetType as any,
      status: 'Due',
      lat: gpsLock.lat,
      lng: gpsLock.lng,
      distanceMeters: 0,
      ayacutHa: Number(ayacut) || 100,
      controllingAuthority: 'Minor Irrigation Sub-division (Bobbili)',
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=600&q=80',
    });
  };

  return (
    <div className="space-y-5">
      {/* Target Progress Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold block">
              MANDAL TARGET TRACKER • Bobbili Pre-Monsoon Audit
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Unscheduled On-Demand Audit &amp; Asset Discovery
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0077B6] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              142 of 168 Verified (84.5% Complete)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#0077B6] to-emerald-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: '84.5%' }}
          ></div>
        </div>

        <p className="text-xs text-slate-500">
          Use this workstation mode for spontaneous field discoveries, unmapped ponds, feeder breaches detected during transit, or urgent walk-ins.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Option A: Quick Pick Registered Nearby Asset within 2.5km */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#0077B6]" />
              <span>Select Nearby Registered Asset (&lt; 2.5km)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Proximity auto-detected by GNSS RTK receiver
            </p>
          </div>

          <div className="space-y-3">
            {nearbyAssets.map((asset, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-[#0077B6] transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    {asset.type}
                  </span>
                  <span className="text-xs font-bold text-[#0077B6] bg-white px-2 py-0.5 rounded border border-slate-200">
                    {asset.dist} away
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800">{asset.name}</h4>
                  <span className="text-[11px] font-mono text-slate-400">{asset.code}</span>
                </div>

                <button
                  onClick={() => onQuickSelectNearby(asset.name)}
                  className="w-full py-2 bg-white hover:bg-[#0077B6] hover:text-white border border-slate-200 text-[#03045E] font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Launch Inspection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Option B: Register New / Unmapped Water Asset */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#0077B6]" />
              <span>Register New / Unmapped Water Asset</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant pin-drop and first statutory pre-monsoon baseline inspection
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            {/* GPS Lock pill */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-700">
                <Crosshair className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-bold">
                  Lat: {gpsLock.lat}° N, Lng: {gpsLock.lng}° E
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                RTK Fixed ±{gpsLock.accuracy}m
              </span>
            </div>

            {/* Classification & Local Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Asset Classification
                </label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-[#0077B6]"
                >
                  <option value="Check Dam">Check Dam</option>
                  <option value="Percolation Tank">Percolation Pond / Tank</option>
                  <option value="Feeder Siphon">Feeder Canal / Siphon</option>
                  <option value="Minor Weir">Minor Surplus Weir</option>
                  <option value="Recharge Shaft">Deep Recharge Shaft</option>
                  <option value="Traditional Tank">Traditional Cheruvu</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Local Name / Identifier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chinna Cheruvu Inflow Siphon"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-[#0077B6]"
                />
              </div>
            </div>

            {/* Revenue Village & Survey Parcel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Revenue Village / Mandal
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-[#0077B6]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Cadastral Survey Parcel (R.S. No.)
                </label>
                <input
                  type="text"
                  placeholder="e.g. R.S. No. 142/3"
                  value={surveyNo}
                  onChange={(e) => setSurveyNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-[#0077B6]"
                />
              </div>
            </div>

            {/* Estimated Ayacut */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Estimated Command Ayacut (Hectares)
              </label>
              <input
                type="number"
                value={ayacut}
                onChange={(e) => setAyacut(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-[#0077B6]"
              />
            </div>

            {/* Primary Site Photo */}
            <div className="border border-dashed border-slate-300 rounded-xl p-3 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#0077B6]" />
                  <span>Geo-tagged Primary Photo</span>
                </span>
                <span className="text-[10px] text-slate-400">Azimuth locked</span>
              </div>
              <input
                type="text"
                placeholder="Paste or provide image URL (or tap camera on device)"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono"
              />
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full py-3 bg-[#03045E] hover:bg-[#0077B6] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <span>Register Asset &amp; Launch First Statutory Inspection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
