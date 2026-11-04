/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Engineer Real Satellite & Cadastral GIS Map
 * Real interactive Leaflet map using Google Hybrid satellite tiles with full place,
 * state, district, town, and road names built directly into the map layer in English.
 */

import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Crosshair, 
  MapPin, 
  Layers, 
  ExternalLink,
  Maximize2
} from 'lucide-react';

interface EngineerRealSatelliteMapProps {
  lat: number;
  lng: number;
  title: string;
  assetCode?: string;
  mandal?: string;
  onExpand?: () => void;
  heightClass?: string;
  interactive?: boolean;
}

export const EngineerRealSatelliteMap: React.FC<EngineerRealSatelliteMapProps> = ({
  lat,
  lng,
  title,
  assetCode,
  mandal,
  onExpand,
  heightClass = 'h-52',
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [mapType, setMapType] = useState<'satellite' | 'street'>('satellite');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 15,
        minZoom: 8,
        maxZoom: 20,
        zoomControl: false,
        attributionControl: false,
        dragging: interactive,
        scrollWheelZoom: false,
        doubleClickZoom: interactive,
        touchZoom: interactive,
      });

      // Custom pulsing work site marker
      const customPinIcon = L.divIcon({
        className: 'custom-engineer-pin',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(0, 180, 216, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; width: 20px; height: 20px; border-radius: 50%; background: #0077b6; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
              <div style="width: 6px; height: 6px; border-radius: 50%; background: #ffffff;"></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([lat, lng], { icon: customPinIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; font-size: 11px;">
          <strong style="color: #03045E; font-size: 12px; display: block; margin-bottom: 2px;">${title}</strong>
          <span style="color: #64748b; font-size: 10px;">${assetCode ? `Code: ${assetCode}` : ''} ${mandal ? `• ${mandal}` : ''}</span>
          <div style="margin-top: 4px; font-family: monospace; font-size: 10px; color: #0077b6;">${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E</div>
        </div>
      `);
      markerRef.current = marker;

      mapInstanceRef.current = map;

      const t1 = setTimeout(() => map.invalidateSize(), 100);
      const t2 = setTimeout(() => map.invalidateSize(), 400);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        map.remove();
        mapInstanceRef.current = null;
      };
    }
  }, []);

  // Update map position on lat/lng change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15, { animate: true });
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        markerRef.current.setPopupContent(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; font-size: 11px;">
            <strong style="color: #03045E; font-size: 12px; display: block; margin-bottom: 2px;">${title}</strong>
            <span style="color: #64748b; font-size: 10px;">${assetCode ? `Code: ${assetCode}` : ''} ${mandal ? `• ${mandal}` : ''}</span>
            <div style="margin-top: 4px; font-family: monospace; font-size: 10px; color: #0077b6;">${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E</div>
          </div>
        `);
      }
    }
  }, [lat, lng, title, assetCode, mandal]);

  // Keep map responsive on resize
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Base Tile Layer (Google Hybrid in English vs Street Map)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current && map.hasLayer(tileLayerRef.current)) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileOptions = {
      maxZoom: 20,
      maxNativeZoom: 19,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      keepBuffer: 8,
      updateWhenZooming: false,
      updateWhenIdle: false,
      crossOrigin: true,
    };

    if (mapType === 'satellite') {
      // Real Satellite with English Place Names, Roads, Villages, and Water Boundaries
      const hybridTile = L.tileLayer(
        'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        {
          ...tileOptions,
          attribution: 'Google Hybrid Satellite Imagery'
        }
      ).addTo(map);
      tileLayerRef.current = hybridTile;
    } else {
      // Detailed Cadastral & Street Grid with full local landmarks
      const streetTile = L.tileLayer(
        'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
        {
          ...tileOptions,
          attribution: 'Google Street & Cadastral Grid'
        }
      ).addTo(map);
      tileLayerRef.current = streetTile;
    }
  }, [mapType]);

  const handleCenter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15, { animate: true });
    }
  };

  const toggleLayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMapType(prev => (prev === 'satellite' ? 'street' : 'satellite'));
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs group bg-slate-900">
      {/* Leaflet Map Div */}
      <div 
        ref={mapContainerRef} 
        className={`w-full ${heightClass} z-0 cursor-grab active:cursor-grabbing`}
      />

      {/* Top Left Controls: Basemap toggle */}
      <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
        <button
          onClick={toggleLayer}
          className="bg-black/75 hover:bg-black/90 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[10px] font-bold border border-white/20 shadow-xs flex items-center gap-1 transition-all cursor-pointer"
          title="Toggle Satellite / Cadastral Street layer"
        >
          <Layers className="w-3 h-3 text-sky-300" />
          <span>{mapType === 'satellite' ? 'Satellite (Hybrid)' : 'Street Grid'}</span>
        </button>

        <button
          onClick={handleCenter}
          className="bg-black/75 hover:bg-black/90 backdrop-blur-md text-white p-1.5 rounded-xl border border-white/20 shadow-xs transition-all cursor-pointer"
          title="Re-center Pin"
        >
          <Crosshair className="w-3 h-3 text-sky-300" />
        </button>
      </div>

      {/* Top Right: Expand Modal Button */}
      {onExpand && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            className="bg-black/75 hover:bg-black/90 backdrop-blur-md text-white p-1.5 rounded-xl border border-white/20 shadow-xs transition-all cursor-pointer"
            title="Expand Full Satellite Map"
          >
            <Maximize2 className="w-3 h-3 text-sky-300" />
          </button>
        </div>
      )}

      {/* Bottom Coordinates & Water Label Overlay */}
      <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none">
        <span className="bg-black/75 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-xl border border-white/20 shadow-xs flex items-center gap-1.5 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
        </span>

        <span className="bg-blue-900/80 backdrop-blur-md text-sky-200 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-sky-400/30">
          Google Hybrid Tiles
        </span>
      </div>
    </div>
  );
};
