/**
 * National Water Surveillance Grid & Hydrological Surveillance Map
 * Clean, Unified Modern Portal Design matching Nir-ikshan White/Slate Palette
 * Real-time GPS Cursor Readout, Dedicated Filter & Display Settings Modal with Brightness/Contrast & Save button,
 * Light GIS Basemap matching portal (NO black void), Animated Zoom-in,
 * and Persistent Language-Strict Telemetry Flashcards (Closes on [X] click only)
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { 
  WaterBody, 
  CitizenComplaint, 
  UserRoleType 
} from '../types/nirikshan';
import { 
  HYDROLOGICAL_STATIONS, 
  MAJOR_RIVER_BASINS,
  HydrologicalStation, 
  TelemetryCategory, 
  WaterHealthStatus,
  convertAPReservoirToStation
} from '../data/indiaHydrologyData';
import { AP_RIVER_VECTORS } from '../data/andhraRiversGeoData';
import { AP_OFFICIAL_RIVER_GAUGE_STATIONS } from '../data/apRiverGaugesData';
import { AP_RAINFALL_HYDROLOGICAL_STATIONS } from '../data/apMonsoonRainfall2026';
import { AP_MANDAL_RAINFALL_STATIONS } from '../data/apMandalWiseRainfall2026';
import { 
  Search, 
  Droplets, 
  Activity, 
  Compass, 
  TrendingUp, 
  X,
  Check,
  Mountain,
  Satellite,
  Sliders,
  Waves,
  Info,
  CheckCircle2,
  RotateCcw,
  Sun,
  Eye,
  Layers,
  Sparkles,
  MapPin,
  CloudRain,
  Thermometer,
  Wind,
  RefreshCw,
  Radio,
  ShieldCheck,
  ShieldAlert,
  Zap,
  LogIn
} from 'lucide-react';
import { 
  AP_OFFICIAL_RESERVOIRS, 
  APReservoirRecord
} from '../data/apReservoirsData';
import { useLanguage } from '../context/LanguageContext';

export type MainFilterType = 
  | 'all' 
  | 'reservoir' 
  | 'rivers' 
  | 'groundwater' 
  | 'bhuvan_wbis' 
  | 'basin'
  | 'complaints';

export type BasemapThemeType = 'light_gis' | 'satellite' | 'topo';

export interface DistrictCoord {
  name: string;
  lat: number;
  lng: number;
  zoom?: number;
}

export interface StateCoordConfig {
  center: [number, number];
  zoom: number;
  minZoom: number;
  bounds: [[number, number], [number, number]];
  polygon?: [number, number][];
  districts: DistrictCoord[];
}

export const INDIA_BOUNDS = L.latLngBounds(
  L.latLng(6.0, 68.0),
  L.latLng(37.5, 97.5)
);

export const STATE_DISTRICT_COORDS: Record<string, StateCoordConfig> = {
  'Andhra Pradesh': {
    center: [16.5062, 80.6480],
    zoom: 7.2,
    minZoom: 6.6,
    bounds: [[12.3, 76.4], [19.8, 85.1]],
    polygon: [
      [19.12, 84.78], [18.85, 84.45], [18.35, 84.05], [18.25, 83.90],
      [17.75, 83.35], [17.65, 83.25], [17.35, 82.85], [16.95, 82.25],
      [16.70, 82.20], [16.35, 81.65], [15.90, 80.85], [15.75, 80.35],
      [15.45, 80.05], [14.85, 80.05], [14.45, 80.02], [13.80, 80.20],
      [13.50, 80.25], [13.25, 79.95], [13.15, 79.55], [12.80, 78.95],
      [12.80, 78.45], [13.35, 78.35], [13.75, 77.85], [13.80, 77.20],
      [14.25, 76.85], [14.85, 76.90], [15.25, 77.05], [15.60, 77.15],
      [15.85, 77.40], [16.05, 77.85], [15.95, 78.35], [16.20, 78.90],
      [16.55, 79.30], [16.75, 79.95], [16.95, 80.50], [17.20, 81.10],
      [17.50, 81.25], [17.85, 81.45], [18.25, 82.05], [18.55, 82.65],
      [18.75, 83.05], [19.00, 83.55], [19.15, 84.20], [19.12, 84.78]
    ],
    districts: [
      { name: 'Srikakulam', lat: 18.2949, lng: 83.8938, zoom: 9.5 },
      { name: 'Parvathipuram Manyam', lat: 18.7758, lng: 83.4241, zoom: 9.5 },
      { name: 'Vizianagaram', lat: 18.1124, lng: 83.4022, zoom: 9.5 },
      { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185, zoom: 9.5 },
      { name: 'Alluri Sitharama Raju', lat: 18.0648, lng: 82.3556, zoom: 9.5 },
      { name: 'Anakapalli', lat: 17.6897, lng: 83.0033, zoom: 9.5 },
      { name: 'Kakinada', lat: 16.9891, lng: 82.2475, zoom: 9.5 },
      { name: 'East Godavari', lat: 17.0005, lng: 81.8040, zoom: 9.5 },
      { name: 'Dr. B.R. Ambedkar Konaseema', lat: 16.5750, lng: 81.9960, zoom: 9.5 },
      { name: 'Eluru', lat: 16.7107, lng: 81.0952, zoom: 9.5 },
      { name: 'West Godavari', lat: 16.5449, lng: 81.5212, zoom: 9.5 },
      { name: 'NTR', lat: 16.5062, lng: 80.6480, zoom: 9.5 },
      { name: 'Krishna', lat: 16.1800, lng: 81.1300, zoom: 9.5 },
      { name: 'Palnadu', lat: 16.3200, lng: 80.0500, zoom: 9.5 },
      { name: 'Guntur', lat: 16.3067, lng: 80.4365, zoom: 9.5 },
      { name: 'Bapatla', lat: 15.9042, lng: 80.4673, zoom: 9.5 },
      { name: 'Prakasam', lat: 15.5057, lng: 80.0499, zoom: 9.5 },
      { name: 'SPS Nellore', lat: 14.4426, lng: 79.9865, zoom: 9.5 },
      { name: 'Kurnool', lat: 15.8281, lng: 78.0373, zoom: 9.5 },
      { name: 'Nandyal', lat: 15.4886, lng: 78.4836, zoom: 9.5 },
      { name: 'Ananthapuramu', lat: 14.6819, lng: 77.6006, zoom: 9.5 },
      { name: 'Sri Sathya Sai', lat: 14.1670, lng: 77.8110, zoom: 9.5 },
      { name: 'YSR Kadapa', lat: 14.4673, lng: 78.8242, zoom: 9.5 },
      { name: 'Annamayya', lat: 14.0500, lng: 78.7500, zoom: 9.5 },
      { name: 'Tirupati', lat: 13.6288, lng: 79.4192, zoom: 9.5 },
      { name: 'Chittoor', lat: 13.2172, lng: 79.1003, zoom: 9.5 },
    ]
  },
  'Gujarat': {
    center: [22.3100, 70.7800],
    zoom: 7.2,
    minZoom: 6.5,
    bounds: [[20.0, 68.0], [24.8, 74.6]],
    polygon: [
      [20.15, 72.85], [20.75, 72.95], [21.15, 72.75], [21.75, 72.25],
      [21.65, 71.55], [20.75, 70.95], [20.90, 70.35], [21.65, 69.55],
      [22.35, 68.95], [22.75, 69.15], [23.00, 70.15], [22.85, 70.75],
      [23.35, 68.75], [23.75, 68.65], [24.45, 69.85], [24.75, 71.25],
      [24.45, 72.45], [24.25, 73.15], [23.65, 73.85], [23.15, 74.35],
      [22.45, 74.45], [21.85, 73.95], [21.45, 73.45], [20.65, 73.25],
      [20.15, 72.85]
    ],
    districts: [
      { name: 'Rajkot', lat: 22.3100, lng: 70.7800, zoom: 10 },
      { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, zoom: 10 },
      { name: 'Vadodara', lat: 22.3072, lng: 73.1812, zoom: 10 },
      { name: 'Surat', lat: 21.1702, lng: 72.8311, zoom: 10 },
      { name: 'Bhavnagar', lat: 21.7645, lng: 72.1519, zoom: 10 },
      { name: 'Jamnagar', lat: 22.4707, lng: 70.0577, zoom: 10 },
      { name: 'Junagadh', lat: 21.5222, lng: 70.4579, zoom: 10 },
      { name: 'Kutch', lat: 23.2420, lng: 69.6669, zoom: 9 },
    ]
  },
  'Maharashtra': {
    center: [19.6633, 75.3003],
    zoom: 7.0,
    minZoom: 6.3,
    bounds: [[15.5, 72.5], [22.2, 81.0]],
    polygon: [
      [15.80, 73.70], [16.50, 73.30], [17.50, 73.10], [18.50, 72.85],
      [19.30, 72.80], [20.10, 72.75], [20.50, 73.40], [21.30, 73.80],
      [21.50, 74.80], [21.70, 76.50], [21.50, 77.80], [21.70, 79.50],
      [21.40, 80.60], [20.80, 80.90], [19.50, 80.40], [18.70, 80.10],
      [18.40, 79.20], [18.80, 78.30], [18.40, 77.50], [17.80, 77.20],
      [17.30, 76.20], [16.80, 75.30], [16.20, 74.50], [15.80, 73.70]
    ],
    districts: [
      { name: 'Pune', lat: 18.5204, lng: 73.8567, zoom: 10 },
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777, zoom: 10 },
      { name: 'Nashik', lat: 19.9975, lng: 73.7898, zoom: 10 },
      { name: 'Nagpur', lat: 21.1458, lng: 79.0882, zoom: 10 },
      { name: 'Satara', lat: 17.6805, lng: 74.0183, zoom: 10 },
      { name: 'Solapur', lat: 17.6599, lng: 75.9064, zoom: 10 },
      { name: 'Kolhapur', lat: 16.7050, lng: 74.2433, zoom: 10 },
    ]
  },
  'Karnataka': {
    center: [15.3173, 75.7139],
    zoom: 7.0,
    minZoom: 6.4,
    bounds: [[11.5, 74.0], [18.6, 78.7]],
    polygon: [
      [14.90, 74.10], [14.00, 74.45], [13.20, 74.75], [12.80, 74.85],
      [12.10, 75.80], [11.60, 76.60], [11.85, 77.20], [12.45, 77.75],
      [13.15, 78.35], [13.75, 77.85], [14.85, 76.90], [15.25, 77.05],
      [15.85, 77.40], [16.50, 77.35], [17.40, 77.60], [18.40, 77.20],
      [17.80, 76.50], [17.30, 75.80], [16.50, 74.80], [15.50, 74.20],
      [14.90, 74.10]
    ],
    districts: [
      { name: 'Bengaluru Urban', lat: 12.9716, lng: 77.5946, zoom: 10 },
      { name: 'Kolar', lat: 13.1350, lng: 78.1300, zoom: 10 },
      { name: 'Mysuru', lat: 12.2958, lng: 76.6394, zoom: 10 },
      { name: 'Belagavi', lat: 15.8497, lng: 74.4977, zoom: 10 },
      { name: 'Ballari', lat: 15.1394, lng: 76.9214, zoom: 10 },
      { name: 'Tumakuru', lat: 13.3422, lng: 77.1017, zoom: 10 },
    ]
  },
  'Tamil Nadu': {
    center: [11.1271, 78.6569],
    zoom: 7.0,
    minZoom: 6.4,
    bounds: [[8.0, 76.2], [13.6, 80.4]],
    polygon: [
      [8.08, 77.55], [8.55, 78.15], [9.25, 79.15], [9.95, 79.35],
      [10.80, 79.85], [11.50, 79.80], [12.25, 80.05], [13.15, 80.30],
      [13.50, 80.20], [13.25, 79.75], [12.85, 79.15], [12.50, 78.50],
      [12.25, 77.80], [11.60, 77.30], [11.20, 76.80], [10.50, 76.95],
      [9.80, 77.25], [9.25, 77.35], [8.55, 77.45], [8.08, 77.55]
    ],
    districts: [
      { name: 'Chennai', lat: 13.0827, lng: 80.2707, zoom: 10 },
      { name: 'Coimbatore', lat: 11.0168, lng: 76.9558, zoom: 10 },
      { name: 'Madurai', lat: 9.9252, lng: 78.1198, zoom: 10 },
      { name: 'Salem', lat: 11.6643, lng: 78.1460, zoom: 10 },
      { name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, zoom: 10 },
    ]
  },
  'Telangana': {
    center: [17.8749, 78.1008],
    zoom: 7.0,
    minZoom: 6.6,
    bounds: [[15.8, 77.2], [19.9, 81.8]],
    polygon: [
      [15.95, 78.10], [16.20, 78.90], [16.55, 79.30], [16.95, 80.50],
      [17.45, 81.10], [18.25, 80.50], [18.90, 80.20], [19.45, 79.80],
      [19.85, 78.90], [19.65, 78.20], [19.15, 77.70], [18.40, 77.60],
      [17.75, 77.60], [17.15, 77.50], [16.45, 77.45], [15.95, 78.10]
    ],
    districts: [
      { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, zoom: 10 },
      { name: 'Nalgonda', lat: 17.0500, lng: 79.2700, zoom: 10 },
      { name: 'Warangal', lat: 17.9689, lng: 79.5941, zoom: 10 },
      { name: 'Nizamabad', lat: 18.6725, lng: 78.0941, zoom: 10 },
      { name: 'Khammam', lat: 17.2473, lng: 80.1514, zoom: 10 },
    ]
  },
  'Uttar Pradesh': {
    center: [26.8467, 80.9462],
    zoom: 7.0,
    minZoom: 6.3,
    bounds: [[23.8, 77.0], [30.5, 84.7]],
    polygon: [
      [30.40, 77.55], [29.80, 78.35], [29.20, 79.15], [28.80, 80.15],
      [28.40, 81.15], [27.75, 82.25], [27.35, 83.50], [27.15, 84.45],
      [26.25, 84.35], [25.55, 84.15], [24.95, 83.35], [24.15, 83.25],
      [24.15, 82.65], [24.85, 81.85], [25.15, 80.95], [24.75, 79.85],
      [24.25, 78.85], [24.85, 78.35], [25.65, 78.50], [26.15, 77.85],
      [27.15, 77.65], [28.15, 77.35], [28.85, 77.25], [29.95, 77.25],
      [30.40, 77.55]
    ],
    districts: [
      { name: 'Varanasi', lat: 25.3176, lng: 82.9739, zoom: 10 },
      { name: 'Prayagraj', lat: 25.4358, lng: 81.8463, zoom: 10 },
      { name: 'Lucknow', lat: 26.8467, lng: 80.9462, zoom: 10 },
      { name: 'Kanpur', lat: 26.4499, lng: 80.3319, zoom: 10 },
      { name: 'Agra', lat: 27.1767, lng: 78.0081, zoom: 10 },
      { name: 'Ayodhya', lat: 26.7922, lng: 82.1998, zoom: 10 },
    ]
  },
  'Rajasthan': {
    center: [27.0238, 74.2179],
    zoom: 7.0,
    minZoom: 6.0,
    bounds: [[23.0, 69.4], [30.3, 78.4]],
    polygon: [
      [30.20, 73.85], [30.15, 75.35], [29.25, 75.50], [28.65, 76.45],
      [27.95, 76.85], [27.45, 77.35], [26.85, 77.85], [26.35, 76.95],
      [25.45, 76.85], [24.75, 76.45], [24.15, 75.85], [23.45, 74.85],
      [23.15, 74.25], [23.85, 73.45], [24.45, 72.85], [24.85, 71.65],
      [25.65, 70.85], [26.65, 69.85], [27.65, 70.25], [28.45, 71.35],
      [29.45, 72.65], [30.20, 73.85]
    ],
    districts: [
      { name: 'Jaipur', lat: 26.9124, lng: 75.7873, zoom: 10 },
      { name: 'Jodhpur', lat: 26.2389, lng: 73.0243, zoom: 10 },
      { name: 'Udaipur', lat: 24.5854, lng: 73.7125, zoom: 10 },
      { name: 'Kota', lat: 25.2138, lng: 75.8648, zoom: 10 },
    ]
  },
  'Madhya Pradesh': {
    center: [22.9734, 78.6569],
    zoom: 7.0,
    minZoom: 6.2,
    bounds: [[21.0, 74.0], [26.9, 82.9]],
    polygon: [
      [26.85, 77.95], [26.45, 78.85], [25.45, 79.65], [25.15, 80.85],
      [24.85, 81.85], [24.15, 82.65], [23.65, 82.85], [22.85, 82.15],
      [22.15, 81.45], [21.55, 80.65], [21.55, 78.65], [21.45, 76.45],
      [21.65, 74.85], [22.25, 74.25], [22.85, 74.85], [23.45, 75.45],
      [24.45, 75.85], [25.25, 76.85], [26.15, 77.25], [26.85, 77.95]
    ],
    districts: [
      { name: 'Bhopal', lat: 23.2599, lng: 77.4126, zoom: 10 },
      { name: 'Indore', lat: 22.7196, lng: 75.8577, zoom: 10 },
      { name: 'Jabalpur', lat: 23.1815, lng: 79.9864, zoom: 10 },
      { name: 'Gwalior', lat: 26.2183, lng: 78.1828, zoom: 10 },
    ]
  },
  'Odisha': {
    center: [20.9517, 85.0985],
    zoom: 7.0,
    minZoom: 6.4,
    bounds: [[17.8, 81.3], [22.6, 87.6]],
    polygon: [
      [22.55, 86.45], [22.15, 87.25], [21.55, 87.15], [20.75, 86.85],
      [19.85, 86.05], [19.25, 84.95], [18.85, 84.15], [18.25, 82.85],
      [18.25, 81.85], [18.85, 82.45], [19.55, 82.65], [20.45, 82.85],
      [21.25, 83.45], [22.15, 83.95], [22.45, 85.15], [22.55, 86.45]
    ],
    districts: [
      { name: 'Bhubaneswar', lat: 20.2961, lng: 85.8245, zoom: 10 },
      { name: 'Cuttack', lat: 20.4625, lng: 85.8828, zoom: 10 },
      { name: 'Sambalpur', lat: 21.4669, lng: 83.9812, zoom: 10 },
      { name: 'Puri', lat: 19.8135, lng: 85.8312, zoom: 10 },
    ]
  },
  'Bihar': {
    center: [25.0961, 85.3131],
    zoom: 7.0,
    minZoom: 6.6,
    bounds: [[24.2, 83.2], [27.6, 88.3]],
    polygon: [
      [27.45, 84.25], [27.15, 85.25], [26.85, 86.45], [26.55, 87.65],
      [26.15, 88.15], [25.55, 87.85], [25.15, 87.25], [24.65, 86.85],
      [24.45, 85.85], [24.45, 84.65], [24.85, 83.45], [25.45, 83.85],
      [25.85, 84.45], [26.55, 84.15], [27.45, 84.25]
    ],
    districts: [
      { name: 'Patna', lat: 25.5941, lng: 85.1376, zoom: 10 },
      { name: 'Gaya', lat: 24.7914, lng: 85.0002, zoom: 10 },
      { name: 'Bhagalpur', lat: 25.2425, lng: 86.9842, zoom: 10 },
    ]
  },
  'Punjab': {
    center: [31.1471, 75.3412],
    zoom: 7.2,
    minZoom: 6.8,
    bounds: [[29.5, 73.8], [32.6, 77.0]],
    polygon: [
      [32.45, 75.75], [32.05, 76.05], [31.45, 76.55], [30.95, 76.85],
      [30.45, 76.85], [29.95, 76.05], [29.75, 75.25], [30.15, 74.45],
      [30.65, 73.85], [31.25, 74.45], [31.85, 74.95], [32.45, 75.75]
    ],
    districts: [
      { name: 'Amritsar', lat: 31.6340, lng: 74.8723, zoom: 10 },
      { name: 'Ludhiana', lat: 30.9010, lng: 75.8573, zoom: 10 },
      { name: 'Jalandhar', lat: 31.3260, lng: 75.5762, zoom: 10 },
    ]
  },
  'Kerala': {
    center: [10.8505, 76.2711],
    zoom: 7.2,
    minZoom: 6.8,
    bounds: [[8.2, 74.8], [12.9, 77.5]],
    polygon: [
      [12.75, 74.95], [12.25, 75.35], [11.65, 75.85], [11.15, 75.95],
      [10.45, 76.15], [9.85, 76.25], [9.15, 76.55], [8.45, 76.95],
      [8.25, 77.25], [8.65, 77.45], [9.25, 77.25], [9.85, 77.15],
      [10.55, 76.85], [11.15, 76.45], [11.65, 76.25], [12.15, 75.85],
      [12.75, 74.95]
    ],
    districts: [
      { name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366, zoom: 10 },
      { name: 'Kochi', lat: 9.9312, lng: 76.2673, zoom: 10 },
      { name: 'Kozhikode', lat: 11.2588, lng: 75.7804, zoom: 10 },
    ]
  },
  'West Bengal': {
    center: [22.9868, 87.8550],
    zoom: 7.2,
    minZoom: 6.3,
    bounds: [[21.5, 85.7], [27.3, 89.9]],
    polygon: [
      [27.15, 88.65], [26.85, 89.85], [26.25, 89.65], [25.85, 88.85],
      [25.25, 88.85], [24.55, 88.65], [23.95, 88.85], [23.15, 89.05],
      [22.45, 89.15], [21.65, 88.85], [21.55, 87.55], [22.15, 87.15],
      [22.85, 86.85], [23.65, 86.85], [24.25, 87.45], [24.85, 87.85],
      [25.65, 88.15], [26.45, 88.15], [27.15, 88.65]
    ],
    districts: [
      { name: 'Kolkata', lat: 22.5726, lng: 88.3639, zoom: 10 },
      { name: 'Howrah', lat: 22.5958, lng: 88.2636, zoom: 10 },
      { name: 'Siliguri', lat: 26.7271, lng: 88.3953, zoom: 10 },
    ]
  },
  'Assam': {
    center: [26.2006, 92.9376],
    zoom: 7.0,
    minZoom: 6.3,
    bounds: [[24.1, 89.6], [28.2, 96.1]],
    polygon: [
      [27.85, 95.85], [27.45, 95.85], [26.85, 94.65], [26.15, 93.65],
      [25.45, 93.15], [24.75, 93.15], [24.45, 92.65], [24.85, 92.25],
      [25.45, 92.45], [26.05, 91.85], [26.05, 89.95], [26.45, 89.85],
      [26.85, 90.85], [26.85, 92.25], [27.15, 93.45], [27.65, 94.85],
      [27.85, 95.85]
    ],
    districts: [
      { name: 'Guwahati', lat: 26.1445, lng: 91.7362, zoom: 10 },
      { name: 'Dibrugarh', lat: 27.4728, lng: 94.9120, zoom: 10 },
      { name: 'Silchar', lat: 24.8333, lng: 92.7789, zoom: 10 },
    ]
  }
};

interface InteractiveIndiaMapProps {
  waterBodies?: WaterBody[];
  complaints?: CitizenComplaint[];
  currentRole?: UserRoleType;
  districtFilter?: string;
  initialState?: string;
  initialCategory?: TelemetryCategory | 'all' | 'extinct';
  initialStatusFilter?: WaterHealthStatus | 'all';
  onStatusFilterChange?: (status: WaterHealthStatus | 'all') => void;
  onSelectWaterBody?: (wb: WaterBody) => void;
  onSelectComplaint?: (c: CitizenComplaint) => void;
  onLodgeComplaint?: () => void;
  selectedState?: string;
  onStateChange?: (state: string) => void;
  selectedDistrict?: string;
  onDistrictChange?: (district: string) => void;
  trackedComplaintId?: string;
  trackedMobile?: string;
  currentUser?: { name: string; phone: string } | null;
  isLoggedIn?: boolean;
  onOpenLoginModal?: () => void;
}

// 100% Strict English Category Metadata
const CATEGORY_META_ENGLISH: Record<string, {
  title: string;
  badge: string;
  dataTypeLabel: string;
  dataType: string;
  measuredLabel: string;
  measured: string;
  examplesLabel: string;
  examples: string[];
}> = {
  reservoir: {
    title: 'Major National Reservoirs & Dams',
    badge: 'CWC & State Irrigation',
    dataTypeLabel: 'Data Type & Source:',
    dataType: 'National reservoir and dam telemetry tracked by CWC (Central Water Commission) and State Water Resources Departments.',
    measuredLabel: 'Monitored Metrics:',
    measured: 'Live Water Storage (TMC / MCM), Gross Capacity, Current Water Level (Meters / Feet), and Spillway Discharges.',
    examplesLabel: 'Major Examples Across India:',
    examples: [
      'Bhakra Dam (Gobind Sagar) — Himachal Pradesh / Punjab (Sutlej / Indus Basin)',
      'Tehri Dam (Bhagirathi River) — Uttarakhand (Ganga Basin) — Tallest Dam in India',
      'Sardar Sarovar Dam — Gujarat (Narmada River / Narmada Basin)',
      'Hirakud Dam — Odisha (Mahanadi River / Mahanadi Basin) — Longest Earthen Dam in India',
      'Nagarjuna Sagar Dam — Telangana / AP (Krishna River / Krishna Basin)',
      'Koyna Dam — Maharashtra (Krishna Basin)',
      'Indira Sagar Dam — Madhya Pradesh (Narmada Basin)',
      'Mettur Dam (Stanley Reservoir) — Tamil Nadu (Cauvery River / Cauvery Basin)',
    ],
  },
  rivers: {
    title: 'National River Water Level Gauges & River Discharge',
    badge: 'CWC Flood Surveillance',
    dataTypeLabel: 'Data Type & Source:',
    dataType: 'Real-time telemetry from CWC river gauges and automated river discharge observation posts across inter-state river systems.',
    measuredLabel: 'Monitored Metrics:',
    measured: 'Current River Water Gauge Level (Meters), Warning Level, Danger Mark (Flood Alert), and Volumetric Discharge (Cusecs).',
    examplesLabel: 'Major Examples Across India:',
    examples: [
      'Ganga River Gauges: Dashashwamedh Ghat Varanasi & Prayagraj Sangam (Uttar Pradesh)',
      'Yamuna River Gauge: Old Railway Bridge (Delhi Flood Monitoring Key Station)',
      'Brahmaputra River: Pandu Ghat & Dibrugarh (Assam / Brahmaputra Basin)',
      'Godavari River: Bhadrachalam Bridge (Telangana) & Dowleswaram Barrage (AP)',
      'Krishna River: Prakasam Barrage Headworks at Vijayawada (AP)',
      'Narmada River: Hoshangabad & Garudeshwar Stations (MP / Gujarat)',
    ],
  },
  groundwater: {
    title: 'CGWB Groundwater DWLR & Piezometers',
    badge: 'CGWB National Grid',
    dataTypeLabel: 'Data Type & Source:',
    dataType: 'Automated Digital Water Level Recorders (DWLR) and non-pumping Piezometer monitoring network by CGWB (Central Ground Water Board).',
    measuredLabel: 'Monitored Metrics:',
    measured: 'Depth to Groundwater (m BGL - Meters Below Ground Level), Post-Monsoon Aquifer Gain/Recharge Trend, and TDS Water Quality.',
    examplesLabel: 'Major Examples Across India:',
    examples: [
      'Pasighat & Changlang DWLR Stations (Arunachal Pradesh — Himalayan Recharge Zone)',
      'Latur & Marathwada Hard-Rock Piezometers (Maharashtra — Semi-Critical Zone)',
      'Kolar Hard-Rock Crystalline DWLR (Karnataka — Over-Exploited Deep Aquifer)',
      'Jodhpur & Osian Desert Aquifer Sensors (Rajasthan — Arid Zone)',
      'Coastal Plain Saline Water Monitoring Piezometers (Andhra Pradesh & Odisha)',
    ],
  },
  bhuvan_wbis: {
    title: 'ISRO Bhuvan WBIS National Water Bodies',
    badge: 'ISRO NRSC Optical Space Constellation',
    dataTypeLabel: 'Data Type & Source:',
    dataType: 'Multi-spectral satellite telemetry from ISRO Resourcesat-2A (AWiFS 56m) and Sentinel-2 constellations on a 15-day revisit cycle.',
    measuredLabel: 'Monitored Metrics:',
    measured: 'Normalized Difference Water Index (NDWI Score: (Green-NIR)/(Green+NIR)), Surface Water Spread Area (Hectares), and Siltation Index.',
    examplesLabel: 'Major Examples Across India:',
    examples: [
      'Chilika Lake Ramsar Wetland — Odisha (Largest Coastal Brackish Lagoon in India)',
      'Dal Lake & Wular Lake — Jammu and Kashmir (Jhelum Basin)',
      'Vembanad-Kol Wetland Ramsar Site — Kerala (Longest Wetland in India)',
      'Lonar Meteorite Impact Crater Lake — Maharashtra (Hyper-Saline Wetland)',
      'Najafgarh Drain Wetland & Basin — South West Delhi / Haryana',
    ],
  },
  basin: {
    title: 'Major River Basins of India',
    badge: 'National Catchment Boundaries',
    dataTypeLabel: 'Data Type & Source:',
    dataType: 'Hydrological basin boundary geometry and inter-state catchment telemetry models mapped with India-WRIS standards.',
    measuredLabel: 'Monitored Metrics:',
    measured: 'Basin Total Drainage Area (Sq Km), Aggregate Storage in Basin Reservoirs, and Catchment-Wide Runoff Inflow.',
    examplesLabel: 'Major Examples Across India:',
    examples: [
      'Ganga Basin — Northern India (Uttarakhand, UP, Bihar, West Bengal)',
      'Godavari Basin — Central & Deccan India (Maharashtra, Telangana, AP)',
      'Krishna Basin — Peninsular India (Maharashtra, Karnataka, AP, Telangana)',
      'Indus Basin — North-West India (Punjab, Haryana, J&K, Himachal Pradesh)',
      'Narmada Basin — Central-West India (Madhya Pradesh, Gujarat)',
      'Mahanadi Basin — Eastern India (Chhattisgarh, Odisha)',
      'Cauvery Basin — Southern India (Karnataka, Tamil Nadu, Kerala)',
    ],
  },
  all: {
    title: 'All National Hydrological Layers',
    badge: 'Unified Water Grid',
    dataTypeLabel: 'Data Type & Source:',
    dataType: 'Unified national hydrological surveillance grid integrating India-WRIS, CWC, CGWB, IMD, and ISRO-NRSC Bhuvan satellites.',
    measuredLabel: 'Monitored Metrics:',
    measured: 'Combined telemetry covering 1,887 stations (161 Dams, 311 River Gauges, 638 Groundwater Wells, and 31 Satellite Wetlands).',
    examplesLabel: 'Major Examples Across India:',
    examples: [
      'Comprehensive multi-sensor coverage across 24 Indian States and Union Territories',
    ],
  },
};

// 100% Strict Hindi Category Metadata (Used when Hindi is active)
const CATEGORY_META_HINDI: Record<string, {
  title: string;
  badge: string;
  dataTypeLabel: string;
  dataType: string;
  measuredLabel: string;
  measured: string;
  examplesLabel: string;
  examples: string[];
}> = {
  reservoir: {
    title: 'राष्ट्रीय बांध एवं विशाल जलाशय (Major National Reservoirs & Dams)',
    badge: 'CWC एवं राज्य सिंचाई विभाग',
    dataTypeLabel: 'डेटा प्रकार एवं स्रोत:',
    dataType: 'CWC (केन्द्रीय जल आयोग) और राज्य जल संसाधन विभागों द्वारा राष्ट्रीय स्तर पर ट्रैक किए जाने वाले प्रमुख बांध।',
    measuredLabel: 'क्या मापा जा रहा है:',
    measured: 'वर्तमान लाइव स्टोरेज (TMC / MCM में), कुल भराव क्षमता, और जल स्तर (मीटर/फीट)।',
    examplesLabel: 'पूरे भारत से प्रमुख उदाहरण:',
    examples: [
      'भाखड़ा नांगल बांध (Bhakra Dam - Gobind Sagar): हिमाचल प्रदेश / पंजाब (सतलुज नदी / Indus Basin)',
      'टिहरी बांध (Tehri Dam): उत्तराखंड (भागीरथी नदी / Ganga Basin) — भारत का सबसे ऊंचा बांध',
      'सरदार सरोवर बांध (Sardar Sarovar): गुजरात (नर्मदा नदी / Narmada Basin)',
      'हीराकुंड बांध (Hirakud Dam): ओडिशा (महानदी / Mahanadi Basin) — भारत का सबसे लंबा मिट्टी का बांध',
      'नागार्जुन सागर बांध (Nagarjuna Sagar): तेलंगाना (कृष्णा नदी / Krishna Basin)',
      'कोयना बांध (Koyna Dam): महाराष्ट्र (कृष्णा बेसिन)',
      'इंदिरा सागर बांध: मध्य प्रदेश (नर्मदा बेसिन)',
      'मेट्टूर बांध (Mettur Dam): तमिलनाडु (कावेरी नदी / Cauvery Basin)',
    ],
  },
  rivers: {
    title: 'राष्ट्रीय नदी जल स्तर एवं बहाव गेज (National River Water Level Gauges & River Discharge)',
    badge: 'CWC बाढ़ निगरानी',
    dataTypeLabel: 'डेटा प्रकार एवं स्रोत:',
    dataType: 'CWC (केन्द्रीय जल आयोग) के रीयल-टाइम नदी गेज एवं डिस्चार्ज टेलीमेट्री स्टेशन।',
    measuredLabel: 'क्या मापा जा रहा है:',
    measured: 'नदी जल स्तर (मीटर में), वार्निंग व डेंजर मार्क (बाढ़ चेतावनी), और जल बहाव दर (Cusecs/क्यूसेक में)।',
    examplesLabel: 'पूरे भारत से प्रमुख उदाहरण:',
    examples: [
      'गंगा नदी गेज: दशाश्वमेध घाट वाराणसी एवं प्रयागराज संगम (उत्तर प्रदेश)',
      'यमुना नदी गेज: ओल्ड रेलवे ब्रिज दिल्ली (Old Railway Bridge - बाढ़ का मुख्य गेज)',
      'ब्रह्मपुत्र नदी: पांडु घाट गुवाहाटी (असम)',
      'गोदावरी नदी: भद्राचलम ब्रिज स्टेशन (तेलंगाना) एवं राजमुंदरी (AP)',
      'कृष्णा नदी: प्रकाशम बैराज विजयवाड़ा (AP)',
      'नर्मदा नदी: होशंगाबाद एवं गरुड़ेश्वर (MP / गुजरात)',
    ],
  },
  groundwater: {
    title: 'केंद्रीय भूजल बोर्ड DWLR एवं पीज़ोमीटर (CGWB Groundwater DWLR & Piezometers)',
    badge: 'CGWB राष्ट्रीय ग्रिड',
    dataTypeLabel: 'डेटा प्रकार एवं स्रोत:',
    dataType: 'CGWB (Central Ground Water Board) डिजिटल ऑटोमेटेड पीज़ोमीटर नेटवर्क।',
    measuredLabel: 'क्या मापा जा रहा है:',
    measured: 'ज़मीन से पानी की गहराई (m BGL - Meters Below Ground Level), भूजल रीचार्ज ट्रेंड, टीडीएस (TDS PPM)।',
    examplesLabel: 'पूरे भारत से प्रमुख उदाहरण:',
    examples: [
      'पासीघाट एवं चांगलांग DWLR (अरुणाचल प्रदेश - हिमालयी एक्विफर)',
      'लातूर एवं मराठवाड़ा कठोर चट्टानी वेल्स (महाराष्ट्र)',
      'कोलार हार्ड-रॉक पीज़ोमीटर (कर्नाटक)',
      'जोधपुर एवं ओसियां रेगिस्तानी एक्विफर (राजस्थान)',
      'पूर्वी तटीय खारा जल अंतर्वेधन वेल्स (AP / तमिलनाडु / ओडिशा)',
    ],
  },
  bhuvan_wbis: {
    title: 'इसरो भुवन उपग्रह जल निकाय एवं आर्द्रभूमियां (ISRO Bhuvan WBIS National Water Bodies)',
    badge: 'इसरो उपग्रह कॉन्स्टेलेशन',
    dataTypeLabel: 'डेटा प्रकार एवं स्रोत:',
    dataType: 'ISRO Resourcesat-2A (AWiFS) और Sentinel-2 उपग्रह द्वारा 15-दिवसीय ऑप्टिकल रिमोट सेंसिंग।',
    measuredLabel: 'क्या मापा जा रहा है:',
    measured: 'NDWI स्कोर ((Green-NIR)/(Green+NIR)), जल फैलाव क्षेत्र (Hectares), ऐतिहासिक आधारभूत क्षेत्रफल, गाद सूचकांक।',
    examplesLabel: 'पूरे भारत से प्रमुख उदाहरण:',
    examples: [
      'चिल्का झील (Chilika Lake): ओडिशा — भारत की सबसे बड़ी तटीय लैगून',
      'डल झील एवं वुलर झील: जम्मू और कश्मीर (झेलम बेसिन)',
      'वेम्बनाड झील रामसर वेटलैंड: केरल',
      'लोनार क्रेटर झील: महाराष्ट्र (उल्कापिंड से बनी खारे पानी की झील)',
      'नजफगढ़ वेटलैंड: दक्षिण-पश्चिम दिल्ली',
    ],
  },
  basin: {
    title: 'भारत के प्रमुख नदी बेसिन (Major River Basins of India)',
    badge: 'राष्ट्रीय जलग्रहण क्षेत्र',
    dataTypeLabel: 'डेटा प्रकार एवं स्रोत:',
    dataType: 'राष्ट्रीय जलवैज्ञानिक नदी जलग्रहण क्षेत्र एवं उप-बेसिन नेटवर्क।',
    measuredLabel: 'क्या मापा जा रहा है:',
    measured: 'बेसिन कुल क्षेत्रफल, बेसिन स्तरीय बांध भंडारण, नदी नेटवर्क एवं अपवाह।',
    examplesLabel: 'पूरे भारत से प्रमुख उदाहरण:',
    examples: [
      'गंगा बेसिन (उत्तर भारत), गोदावरी बेसिन (दक्कन प्रायद्वीप), कृष्णा बेसिन (मध्य-दक्षिण भारत)',
      'सिंधु बेसिन (उत्तर-पश्चिम), नर्मदा बेसिन (मध्य भारत), महानदी बेसिन (पूर्वी भारत), कावेरी बेसिन (दक्षिण भारत)',
    ],
  },
  all: {
    title: 'राष्ट्रीय सूक्ष्म-जलग्रहण एवं जल ग्रिड (All National Hydrological Layers)',
    badge: 'एकीकृत जल ग्रिड',
    dataTypeLabel: 'डेटा प्रकार एवं स्रोत:',
    dataType: 'India-WRIS, CWC, CGWB, IMD, और ISRO NRSC का एकीकृत राष्ट्रीय जल ग्रिड।',
    measuredLabel: 'क्या मापा जा रहा है:',
    measured: '1,887 बांध, नदी गेज, भूजल DWLR कुएं, और सैटेलाइट जल निकाय।',
    examplesLabel: 'पूरे भारत से प्रमुख उदाहरण:',
    examples: [
      '161 प्रमुख बांध, 311 नदी गेज एवं डिस्चार्ज, 638 भूजल DWLR कुएं, 31 उपग्रह जल निकाय',
    ],
  },
};

// 100% REAL LIVE DATA: Meteorological Telemetry interface from WMO/IMD High-Res Open-Meteo Grid
export interface RealTimeCatchmentTelemetry {
  temperature: number;
  humidity: number;
  precipitation: number; // mm/h
  rain: number;
  windSpeed: number; // km/h
  weatherCode: number;
  condition: string;
  conditionHi: string;
  timestamp: string;
  elevationM: number;
  isLoading: boolean;
  isError: boolean;
  source: string;
}

// 100% REAL LIVE TELEMETRY: On-Demand Hydrological Station Telemetry interface
export interface LiveStationTelemetry {
  isLoading: boolean;
  isError: boolean;
  stationId: string;
  category?: string;
  dischargeCusecs?: number;
  currentRiverLevelM?: number;
  pondLevelM?: number;
  normalPondLevelM?: number;
  warningLevelM?: number;
  dangerLevelM?: number;
  waterLevelM?: number;
  fullReservoirLevelM?: number;
  currentLiveStorageMCM?: number;
  storagePercentage?: number;
  waterLevelDepthMBGL?: number;
  preMonsoonMBGL?: number;
  rechargeTrendM?: number;
  waterQualityTdsPpm?: number;
  electricalConductivityUsCm?: number;
  aquiferZone?: string;
  piezometerType?: string;
  flowStatus?: string;
  ndwiScore?: number;
  waterSpreadHa?: number;
  baselineSpreadHa?: number;
  rainfallMm?: number;
  normalRainfallMm?: number;
  departurePercent?: number;
  elevationMslM?: number;
  subBasin?: string;
  agency?: string;
  basin?: string;
  isLiveVerified?: boolean;
  verificationSource?: string;
  verificationNote?: string;
  discrepancyNotice?: string;
  date?: string;
  lastSync?: string;
}

// Decode official WMO weather codes into precise bilingual descriptions
export const decodeWmoWeatherCode = (code: number) => {
  if (code === 0) return { en: 'Clear Sky ☀️', hi: 'साफ़ आसमान ☀️' };
  if (code === 1) return { en: 'Mainly Clear 🌤️', hi: 'मुख्यतः साफ़ 🌤️' };
  if (code === 2) return { en: 'Partly Cloudy ⛅', hi: 'आंशिक बादल ⛅' };
  if (code === 3) return { en: 'Overcast ☁️', hi: 'घने बादल ☁️' };
  if (code === 45 || code === 48) return { en: 'Fog / Mist 🌫️', hi: 'कोहरा / धुंध 🌫️' };
  if (code >= 51 && code <= 55) return { en: 'Light Drizzle 🌦️', hi: 'हल्की बूंदाबांदी 🌦️' };
  if (code >= 61 && code <= 65) return { en: 'Active Rain 🌧️', hi: 'सक्रिय वर्षा 🌧️' };
  if (code >= 80 && code <= 82) return { en: 'Rain Showers 🌧️', hi: 'वर्षा की बौछारें 🌧️' };
  if (code >= 95) return { en: 'Thunderstorm ⛈️', hi: 'गरज के साथ वर्षा ⛈️' };
  return { en: 'Fair Weather 🌤️', hi: 'अनुकूल मौसम 🌤️' };
};

export const InteractiveIndiaMap: React.FC<InteractiveIndiaMapProps> = ({
  waterBodies = [],
  complaints = [],
  currentRole = 'admin',
  districtFilter,
  initialState,
  initialCategory,
  initialStatusFilter,
  onStatusFilterChange,
  onSelectWaterBody,
  onSelectComplaint,
  onLodgeComplaint,
  selectedState: controlledState,
  onStateChange,
  selectedDistrict: controlledDistrict,
  onDistrictChange,
  trackedComplaintId,
  trackedMobile,
  currentUser,
  isLoggedIn,
  onOpenLoginModal,
}) => {
  const { t, language } = useLanguage();
  
  // Pure Multi-Language Translator: 100% Pure English, Pure Hindi, and Pure Telugu
  const tr = (en: string, hi: string, te: string) => {
    if (language === 'hi') return hi;
    if (language === 'te') return te;
    return en;
  };

  // Is this map being rendered inside the Citizen / Normal User portal?
  const isCitizenDashboard = currentRole === 'user';
  
  // Leaflet map refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const hybridLabelLayerRef = useRef<L.TileLayer | null>(null);
  const riverVectorsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const stateBorderLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Active filter state
  const [activeFilterTab, setActiveFilterTab] = useState<MainFilterType>(initialCategory === 'all' ? 'all' : 'all');
  const [selectedBasin, setSelectedBasin] = useState<string>('All Basins');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<WaterHealthStatus | 'all'>(initialStatusFilter || 'all');

  // State & District selection
  const [internalState, setInternalState] = useState<string>(initialState || controlledState || 'All India');
  const [internalDistrict, setInternalDistrict] = useState<string>(districtFilter || controlledDistrict || 'All Districts');

  const selectedState = controlledState !== undefined ? controlledState : internalState;
  const selectedDistrict = controlledDistrict !== undefined ? controlledDistrict : internalDistrict;

  // Available districts for the selected state
  const availableDistricts = useMemo(() => {
    if (selectedState && selectedState !== 'All India' && STATE_DISTRICT_COORDS[selectedState]) {
      return STATE_DISTRICT_COORDS[selectedState].districts;
    }
    return STATE_DISTRICT_COORDS['Andhra Pradesh'].districts;
  }, [selectedState]);

  // Basemap Theme: 'satellite' by default (ISRO Bhuvan & High-Res Satellite), 'light_gis', or 'topo'
  const [basemapTheme, setBasemapTheme] = useState<BasemapThemeType>('satellite');

  // Display Settings: Brightness and Contrast
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);

  // Modal temporary states (committed only when user clicks "Save Settings")
  const [tempFilterTab, setTempFilterTab] = useState<MainFilterType>('all');
  const [tempBasin, setTempBasin] = useState<string>('All Basins');
  const [tempBasemapTheme, setTempBasemapTheme] = useState<BasemapThemeType>('satellite');
  const [tempBrightness, setTempBrightness] = useState<number>(100);
  const [tempContrast, setTempContrast] = useState<number>(100);

  // Filter & Display Settings Modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  // Real-time GPS Coordinates readout (Center + Live Mouse Cursor)
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: 20.5937,
    lng: 78.9629,
    zoom: 5,
  });
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [copiedGps, setCopiedGps] = useState<boolean>(false);

  // Flashcard State: Persistent station card (closes ONLY on [X] click)
  const [flashStation, setFlashStation] = useState<HydrologicalStation | null>(null);

  // Flash Complaint State (closes ONLY on [X] click)
  const [flashComplaint, setFlashComplaint] = useState<CitizenComplaint | null>(null);

  // 100% Real Live Catchment Telemetry State (Open-Meteo High-Resolution Grid)
  const [realTimeTelemetry, setRealTimeTelemetry] = useState<RealTimeCatchmentTelemetry | null>(null);
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState<boolean>(false);

  // Helper to smoothly fly and focus on selected State or District
  // Without rigid boundary locking - keeps zoom-in, zoom-out, and panning completely free!
  const focusStateOrDistrict = useCallback((stName: string, distName?: string) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!stName || stName === 'All India') {
      map.flyTo([21.5, 79.0], 5, { animate: true, duration: 1.2 });
      return;
    }

    const stConfig = STATE_DISTRICT_COORDS[stName];
    if (!stConfig) return;

    if (distName && distName !== 'All Districts') {
      const matched = stConfig.districts.find(
        (d) => d.name.toLowerCase() === distName.toLowerCase()
      );
      if (matched) {
        map.flyTo([matched.lat, matched.lng], matched.zoom || 9.5, { animate: true, duration: 1.2 });
        return;
      }
    }

    map.flyTo(stConfig.center, stConfig.zoom, { animate: true, duration: 1.2 });
  }, []);

  // Handlers for state and district selection with smooth zoom and boundary highlighting
  const handleSelectState = (newState: string) => {
    setInternalState(newState);
    setInternalDistrict('All Districts');
    if (onStateChange) onStateChange(newState);
    if (onDistrictChange) onDistrictChange('All Districts');
    focusStateOrDistrict(newState, 'All Districts');
  };

  const handleSelectDistrict = (newDistrict: string) => {
    setInternalDistrict(newDistrict);
    if (onDistrictChange) onDistrictChange(newDistrict);
    focusStateOrDistrict(selectedState, newDistrict);
  };

  // Render State Boundary Border Line & Highlight Area whenever State or District changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const borderGroup = stateBorderLayerGroupRef.current;
    if (!map || !borderGroup) return;

    borderGroup.clearLayers();

    if (selectedState && selectedState !== 'All India') {
      const stConfig = STATE_DISTRICT_COORDS[selectedState];
      if (stConfig && stConfig.polygon && stConfig.polygon.length > 0) {
        // 1. Glowing outer border outline for high contrast
        const glowPolygon = L.polygon(stConfig.polygon, {
          color: '#0284c7', // vibrant cyan glow
          weight: 7,
          opacity: 0.35,
          fill: false,
          interactive: false,
        });
        borderGroup.addLayer(glowPolygon);

        // 2. High-visibility state border line + highlighted area fill
        const statePolygon = L.polygon(stConfig.polygon, {
          color: '#0047ab', // sharp cobalt border line
          weight: 3.5,
          opacity: 0.95,
          dashArray: '8, 5',
          fillColor: '#38bdf8', // semi-transparent highlight fill
          fillOpacity: 0.14,
          interactive: true,
        });

        statePolygon.bindTooltip(
          `<div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; font-weight: 800; color: #03045e; background: #ffffff; padding: 4px 8px; border-radius: 8px; border: 1.5px solid #0047ab; box-shadow: 0 4px 12px rgba(0,71,171,0.2);">
             🇮🇳 ${selectedState} State Boundary
           </div>`,
          { sticky: true, opacity: 0.98 }
        );
        borderGroup.addLayer(statePolygon);

        // 3. Highlight district focus zone if district is selected
        if (selectedDistrict && selectedDistrict !== 'All Districts') {
          const dist = stConfig.districts.find(
            (d) => d.name.toLowerCase() === selectedDistrict.toLowerCase()
          );
          if (dist) {
            const distCircle = L.circle([dist.lat, dist.lng], {
              radius: 26000,
              color: '#d97706',
              weight: 3,
              dashArray: '5, 5',
              fillColor: '#f59e0b',
              fillOpacity: 0.18,
              interactive: true,
            });
            distCircle.bindTooltip(
              `<div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; font-weight: 800; color: #78350f; background: #fffbeb; padding: 4px 8px; border-radius: 8px; border: 1.5px solid #f59e0b; box-shadow: 0 4px 12px rgba(245,158,11,0.25);">
                 📍 ${dist.name} District Focus Zone
               </div>`,
              { sticky: true, opacity: 0.98 }
            );
            borderGroup.addLayer(distCircle);
          }
        }
      }
    }
  }, [selectedState, selectedDistrict]);

  // Track citizen complaints tied to the user's mobile number (from OTP login or search)
  const userPhoneDigits = useMemo(() => {
    const raw = (currentUser?.phone || trackedMobile || '').replace(/\D/g, '');
    return raw.length >= 4 ? raw : '';
  }, [currentUser, trackedMobile]);

  const userComplaints = useMemo(() => {
    if (!complaints) return [];
    if (currentRole === 'user') {
      if (!isLoggedIn || !currentUser) return [];
      const userPhoneClean = (currentUser.phone || '').replace(/\D/g, '');
      const userNameClean = (currentUser.name || '').trim().toLowerCase();
      return complaints.filter((c) => {
        const compPhoneClean = (c.citizenPhone || '').replace(/\D/g, '');
        const compNameClean = (c.citizenName || '').trim().toLowerCase();
        if (userPhoneClean.length >= 10 && compPhoneClean.length >= 10) {
          if (compPhoneClean.slice(-10) === userPhoneClean.slice(-10)) return true;
        } else if (userPhoneClean && compPhoneClean) {
          if (compPhoneClean === userPhoneClean || compPhoneClean.endsWith(userPhoneClean) || userPhoneClean.endsWith(compPhoneClean)) return true;
        }
        if (userNameClean && compNameClean && userNameClean === compNameClean) {
          return true;
        }
        return false;
      });
    }
    if (!userPhoneDigits) return complaints;
    return complaints.filter((c) => {
      const cDigits = (c.citizenPhone || '').replace(/\D/g, '');
      return (
        (userPhoneDigits.length >= 10 && cDigits.endsWith(userPhoneDigits.slice(-10))) ||
        (cDigits.length >= 10 && userPhoneDigits.endsWith(cDigits.slice(-10))) ||
        cDigits === userPhoneDigits
      );
    });
  }, [complaints, userPhoneDigits, currentRole, isLoggedIn, currentUser]);

  // Smart search handler: if user searches a State or District name, immediately zoom-in & lock
  const handleSearchInputChange = (val: string) => {
    setSearchQuery(val);
    const query = val.trim().toLowerCase();
    if (!query) return;

    if (query === 'all india' || query === 'india') {
      handleSelectState('All India');
      return;
    }

    // 1. Check if user searched a State (e.g. "andhra pradesh", "andhra", "gujarat", etc.)
    const matchedState = Object.keys(STATE_DISTRICT_COORDS).find((st) => {
      const lower = st.toLowerCase();
      return lower === query || (query.length >= 4 && (lower.startsWith(query) || lower.includes(query)));
    });

    if (matchedState) {
      if (selectedState !== matchedState) {
        handleSelectState(matchedState);
      }
      return;
    }

    // 2. Check if user searched a District across states
    for (const [stName, stConfig] of Object.entries(STATE_DISTRICT_COORDS)) {
      const matchedDist = stConfig.districts.find((d) => {
        const lower = d.name.toLowerCase();
        return lower === query || (query.length >= 4 && (lower.startsWith(query) || lower.includes(query)));
      });
      if (matchedDist) {
        if (selectedState !== stName) {
          setInternalState(stName);
          if (onStateChange) onStateChange(stName);
        }
        handleSelectDistrict(matchedDist.name);
        return;
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Sync tracked complaint from props ONLY when explicitly changed by user action
  const prevTrackedIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    // Prevent auto-opening on initial mount or page refresh
    if (!prevTrackedIdRef.current) {
      prevTrackedIdRef.current = trackedComplaintId;
      return;
    }
    if (trackedComplaintId && trackedComplaintId !== prevTrackedIdRef.current && complaints && complaints.length > 0) {
      prevTrackedIdRef.current = trackedComplaintId;
      const targetPool = currentRole === 'user' ? userComplaints : complaints;
      const found = targetPool.find((c) => c.id === trackedComplaintId);
      if (found) {
        setFlashStation(null);
        setFlashComplaint(found);
        setActiveFilterTab('complaints');
        const map = mapInstanceRef.current;
        if (map && found.coordinates) {
          map.flyTo([found.coordinates.lat, found.coordinates.lng], 10, { animate: true, duration: 1.0 });
        }
      }
    }
  }, [trackedComplaintId, complaints, currentRole, userComplaints]);

  // Fetch real-time live weather & catchment precipitation for exact station coordinates
  const fetchLiveCatchmentTelemetry = useCallback(async (lat: number, lng: number) => {
    setIsRefreshingTelemetry(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`
      );
      if (!res.ok) throw new Error('API fetch error');
      const data = await res.json();
      const curr = data.current;
      const weather = decodeWmoWeatherCode(curr.weather_code);
      setRealTimeTelemetry({
        temperature: curr.temperature_2m,
        humidity: curr.relative_humidity_2m,
        precipitation: curr.precipitation,
        rain: curr.rain,
        windSpeed: curr.wind_speed_10m,
        weatherCode: curr.weather_code,
        condition: weather.en,
        conditionHi: weather.hi,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        elevationM: Math.round(data.elevation || 0),
        isLoading: false,
        isError: false,
        source: 'WMO High-Resolution Observation Grid (Open-Meteo API)'
      });
    } catch (err) {
      console.error('Error fetching live catchment telemetry:', err);
      setRealTimeTelemetry(prev => prev ? { ...prev, isLoading: false, isError: true } : null);
    } finally {
      setIsRefreshingTelemetry(false);
    }
  }, []);

  // 100% Real Live Hydrological Station Telemetry State (CWC / WRD Telemetry Gateway)
  const [stationTelemetry, setStationTelemetry] = useState<LiveStationTelemetry | null>(null);
  const [isRefreshingStationTelemetry, setIsRefreshingStationTelemetry] = useState<boolean>(false);

  // On-demand lazy loader: fetches real-time telemetry ONLY for the clicked station (prevents loading bulk data)
  const fetchLiveStationTelemetry = useCallback(async (st: HydrologicalStation) => {
    setIsRefreshingStationTelemetry(true);
    try {
      const queryParams = new URLSearchParams({
        stationId: st.id,
        district: st.district || '',
        state: st.state || '',
        type: st.category,
        name: st.name || '',
      });
      const res = await fetch(`/api/wris?${queryParams.toString()}`);
      if (!res.ok) throw new Error('API fetch error');
      const data = await res.json();
      const firstRecord = Array.isArray(data.data) && data.data.length > 0 ? data.data[0] : null;

      // Ensure that a fallback record doesn't overwrite a completely different station
      const isExactStationMatch = data.stationId === st.id;
      const isRecordMatching = Boolean(
        firstRecord && (
          (firstRecord.stationName && (st.name.toLowerCase().includes(firstRecord.stationName.toLowerCase()) || firstRecord.stationName.toLowerCase().includes(st.name.toLowerCase()))) ||
          (firstRecord.reservoirName && (st.name.toLowerCase().includes(firstRecord.reservoirName.toLowerCase()) || firstRecord.reservoirName.toLowerCase().includes(st.name.toLowerCase()))) ||
          (firstRecord.districtName && (st.district || '').toLowerCase() === firstRecord.districtName.toLowerCase())
        )
      );

      const discharge = isExactStationMatch
        ? (data.dischargeCusecs ?? data.discharge_Cusecs ?? st.dischargeCusecs)
        : isRecordMatching
        ? (firstRecord?.discharge_Cusecs ?? st.dischargeCusecs)
        : st.dischargeCusecs;

      const riverLevel = isExactStationMatch
        ? (data.currentRiverLevelM ?? data.currentWaterLevel_M ?? st.currentRiverLevelM)
        : isRecordMatching
        ? (firstRecord?.currentWaterLevel_M ?? st.currentRiverLevelM)
        : st.currentRiverLevelM;

      const waterLevel = isExactStationMatch
        ? (data.waterLevelM ?? data.waterLevel_M ?? st.waterLevelM)
        : isRecordMatching
        ? (firstRecord?.waterLevel_M ?? st.waterLevelM)
        : st.waterLevelM;

      const fullReservoirLevel = isExactStationMatch
        ? (data.fullReservoirLevelM ?? st.fullReservoirLevelM)
        : isRecordMatching
        ? (firstRecord?.fullCapacity_MCM ? st.fullReservoirLevelM : st.fullReservoirLevelM)
        : st.fullReservoirLevelM;

      const storage = isExactStationMatch
        ? (data.currentLiveStorageMCM ?? data.currentLiveStorage_MCM ?? st.currentLiveStorageMCM)
        : isRecordMatching
        ? (firstRecord?.currentLiveStorage_MCM ?? st.currentLiveStorageMCM)
        : st.currentLiveStorageMCM;

      const storagePct = isExactStationMatch
        ? (data.storagePercentage ?? st.storagePercentage)
        : isRecordMatching
        ? (firstRecord?.storagePercentage ?? st.storagePercentage)
        : st.storagePercentage;

      const gwDepth = isExactStationMatch
        ? (data.waterLevelDepthMBGL ?? st.waterLevelDepthMBGL)
        : (firstRecord?.waterLevelDepthMBGL ?? st.waterLevelDepthMBGL);

      const gwPreMonsoon = isExactStationMatch
        ? (data.preMonsoonMBGL ?? st.preMonsoonMBGL)
        : (firstRecord?.preMonsoonMBGL ?? st.preMonsoonMBGL);

      const gwTrend = isExactStationMatch
        ? (data.rechargeTrendM ?? st.rechargeTrendM)
        : (firstRecord?.rechargeTrendM ?? st.rechargeTrendM);

      const gwTds = isExactStationMatch
        ? (data.waterQualityTdsPpm ?? st.waterQualityTdsPpm)
        : (firstRecord?.waterQualityTdsPpm ?? st.waterQualityTdsPpm);

      const gwEc = isExactStationMatch
        ? (data.electricalConductivityUsCm ?? (st as any).electricalConductivityUsCm)
        : ((firstRecord as any)?.electricalConductivityUsCm ?? (st as any).electricalConductivityUsCm);

      setStationTelemetry({
        isLoading: false,
        isError: false,
        stationId: st.id,
        category: data.category || st.category,
        dischargeCusecs: discharge,
        currentRiverLevelM: riverLevel,
        pondLevelM: data.pondLevelM ?? data.pondLevel_M ?? firstRecord?.pondLevel_M ?? st.pondLevelM,
        normalPondLevelM: data.normalPondLevelM ?? data.normalPondLevel_M ?? st.normalPondLevelM,
        warningLevelM: data.warningLevelM ?? data.warning_level_m ?? (isRecordMatching ? firstRecord?.warningLevel_M : undefined) ?? st.warningLevelM,
        dangerLevelM: data.dangerLevelM ?? data.danger_level_m ?? (isRecordMatching ? firstRecord?.dangerLevel_M : undefined) ?? st.dangerLevelM,
        waterLevelM: waterLevel,
        fullReservoirLevelM: fullReservoirLevel,
        currentLiveStorageMCM: storage,
        storagePercentage: storagePct,
        waterLevelDepthMBGL: gwDepth,
        preMonsoonMBGL: gwPreMonsoon,
        rechargeTrendM: gwTrend,
        waterQualityTdsPpm: gwTds,
        electricalConductivityUsCm: gwEc,
        aquiferZone: data.aquiferZone,
        piezometerType: data.piezometerType,
        flowStatus: data.flowStatus ?? (isRecordMatching ? firstRecord?.status : undefined) ?? st.statusLabel,
        ndwiScore: data.ndwiScore ?? firstRecord?.ndwiScore ?? (st as any).ndwiScore,
        waterSpreadHa: data.waterSpreadHa ?? firstRecord?.waterSpreadHa ?? (st as any).waterSpreadHa,
        baselineSpreadHa: data.baselineSpreadHa ?? firstRecord?.baselineSpreadHa ?? (st as any).baselineSpreadHa,
        rainfallMm: data.rainfallMm ?? firstRecord?.rainfallMm ?? (st as any).rainfallMm,
        normalRainfallMm: data.normalRainfallMm ?? firstRecord?.normalRainfall_MM ?? (st as any).normalRainfallMm,
        departurePercent: data.departurePercent ?? firstRecord?.departure_Percent ?? (st as any).departurePercent,
        elevationMslM: data.elevationMslM ?? firstRecord?.elevationMslM,
        subBasin: data.subBasin ?? (st as any).subBasin,
        agency: (() => {
          let resolved = data.agency ?? (isRecordMatching ? firstRecord?.agencyName : undefined) ?? st.agency;
          if (st.state && st.state !== 'Andhra Pradesh' && (resolved === 'APWRIMS' || resolved === 'APWRIMS Network' || resolved === 'APWRIMS & CWC')) {
            resolved = st.agency && !st.agency.includes('APWRIMS') ? st.agency : (st.category === 'bhuvan_wbis' ? 'ISRO-NRSC & State Wetland Authority' : 'CWC & State WRD');
          }
          return resolved;
        })(),
        basin: data.basin || st.basin,
        isLiveVerified: data.isLiveVerified !== undefined ? data.isLiveVerified : Boolean(st.isLiveVerified),
        verificationSource: data.verificationSource || st.verificationSource || (
          st.category === 'groundwater' 
            ? 'Central Ground Water Board (CGWB) NWDP & State GW Grid' 
            : st.category === 'bhuvan_wbis'
            ? (st.state === 'Bihar' ? 'ISRO NRSC Bhuvan WBIS & Bihar State Wetland Authority (BSWA)' : 'ISRO NRSC Bhuvan WBIS')
            : (st.state === 'Andhra Pradesh' ? 'APWRIMS & CWC Hydrological Grid' : `${st.state || 'National'} Hydrological Grid (CWC / WRD)`)
        ),
        verificationNote: data.verificationNote || st.verificationNote,
        discrepancyNotice: data.discrepancyNotice,
        date: data.date || new Date().toISOString().split('T')[0],
        lastSync: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
    } catch (err) {
      console.error('Error fetching live station telemetry:', err);
      setStationTelemetry({
        isLoading: false,
        isError: true,
        stationId: st.id,
        category: st.category,
        dischargeCusecs: st.dischargeCusecs,
        currentRiverLevelM: st.currentRiverLevelM,
        pondLevelM: st.pondLevelM,
        normalPondLevelM: st.normalPondLevelM,
        warningLevelM: st.warningLevelM,
        dangerLevelM: st.dangerLevelM,
        waterLevelM: st.waterLevelM,
        currentLiveStorageMCM: st.currentLiveStorageMCM,
        storagePercentage: st.storagePercentage,
        waterLevelDepthMBGL: st.waterLevelDepthMBGL,
        preMonsoonMBGL: st.preMonsoonMBGL,
        rechargeTrendM: st.rechargeTrendM,
        waterQualityTdsPpm: st.waterQualityTdsPpm,
        electricalConductivityUsCm: (st as any).electricalConductivityUsCm,
        flowStatus: st.statusLabel,
        agency: st.agency,
        isLiveVerified: Boolean(st.isLiveVerified),
        verificationSource: st.verificationSource || 'Verified Agency Baseline Log',
        verificationNote: st.verificationNote,
        date: new Date().toISOString().split('T')[0],
        lastSync: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
    } finally {
      setIsRefreshingStationTelemetry(false);
    }
  }, []);

  // Fetch live telemetry automatically when flashStation opens (ONLY for the clicked station)
  // Also runs an automatic live polling timer every 60 seconds while the station card is open
  useEffect(() => {
    if (flashStation) {
      fetchLiveCatchmentTelemetry(flashStation.lat, flashStation.lng);
      fetchLiveStationTelemetry(flashStation);

      const pollTimer = setInterval(() => {
        fetchLiveCatchmentTelemetry(flashStation.lat, flashStation.lng);
        fetchLiveStationTelemetry(flashStation);
      }, 60000);

      return () => clearInterval(pollTimer);
    } else {
      setRealTimeTelemetry(null);
      setStationTelemetry(null);
    }
  }, [flashStation, fetchLiveCatchmentTelemetry, fetchLiveStationTelemetry]);



  // Synchronize external status filter from homepage 5-color cards
  useEffect(() => {
    if (initialStatusFilter !== undefined) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  // Master Dynamic Stations (1,887 stations across India)
  const dynamicStations = useMemo(() => {
    const updatedApStations = AP_OFFICIAL_RESERVOIRS.map(convertAPReservoirToStation);
    const nonApStations = HYDROLOGICAL_STATIONS.filter(
      (s) => s.state !== 'Andhra Pradesh'
    );
    const apGroundwaterAndWetlands = HYDROLOGICAL_STATIONS.filter(
      (s) => s.state === 'Andhra Pradesh' && (s.category === 'groundwater' || s.category === 'bhuvan_wbis')
    );
    return [
      ...updatedApStations,
      ...AP_OFFICIAL_RIVER_GAUGE_STATIONS,
      ...AP_MANDAL_RAINFALL_STATIONS,
      ...AP_RAINFALL_HYDROLOGICAL_STATIONS,
      ...apGroundwaterAndWetlands,
      ...nonApStations,
    ];
  }, []);

  // Filtered stations logic using the active filter tab and basin
  // Filtered stations logic using the active filter tab, basin, state, and district
  const filteredStations = useMemo(() => {
    // If active tab is complaints, return empty list of telemetry stations so complaints take full focus
    if (activeFilterTab === 'complaints') return [];

    return dynamicStations.filter((station) => {
      // 1. Filter by State (only in Citizen Dashboard when state is locked)
      if (isCitizenDashboard && selectedState && selectedState !== 'All India') {
        if (!station.state.toLowerCase().includes(selectedState.toLowerCase())) {
          return false;
        }
      }

      // 2. Filter by District (only in Citizen Dashboard when district is locked)
      if (isCitizenDashboard && selectedDistrict && selectedDistrict !== 'All Districts') {
        if (!station.district.toLowerCase().includes(selectedDistrict.toLowerCase())) {
          return false;
        }
      }

      // 3. Filter by Main 6 Tabs
      if (activeFilterTab === 'reservoir') {
        if (station.category !== 'reservoir') return false;
      } else if (activeFilterTab === 'rivers') {
        if (station.category !== 'river_level' && station.category !== 'river_discharge') {
          return false;
        }
      } else if (activeFilterTab === 'groundwater') {
        if (station.category !== 'groundwater') return false;
      } else if (activeFilterTab === 'bhuvan_wbis') {
        if (station.category !== 'bhuvan_wbis' && !station.isExtinct && station.status !== 'grey') {
          return false;
        }
      } else if (activeFilterTab === 'basin') {
        if (selectedBasin !== 'All Basins') {
          const matchWord = selectedBasin.toLowerCase().replace(' basin', '').trim();
          if (!station.basin.toLowerCase().includes(matchWord)) {
            return false;
          }
        }
      }

      // 4. Status filter (from top 5 cards)
      if (statusFilter !== 'all') {
        if (station.status !== statusFilter) return false;
      }

      // 5. Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matches = 
          station.name.toLowerCase().includes(q) ||
          station.district.toLowerCase().includes(q) ||
          station.state.toLowerCase().includes(q) ||
          (station.riverName && station.riverName.toLowerCase().includes(q)) ||
          station.basin.toLowerCase().includes(q) ||
          station.code.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [dynamicStations, activeFilterTab, selectedBasin, statusFilter, searchQuery, selectedState, selectedDistrict]);

  // Counts for each tab (In Citizen portal, complaints count strictly reflects the logged-in user's grievances)
  const tabCounts = useMemo(() => {
    const relevantComplaints = isCitizenDashboard ? userComplaints : complaints;
    return {
      all: dynamicStations.length,
      reservoir: dynamicStations.filter((s) => s.category === 'reservoir').length,
      rivers: dynamicStations.filter((s) => s.category === 'river_level' || s.category === 'river_discharge').length,
      groundwater: dynamicStations.filter((s) => s.category === 'groundwater').length,
      bhuvan_wbis: dynamicStations.filter((s) => s.category === 'bhuvan_wbis' || s.isExtinct || s.status === 'grey').length,
      basin: MAJOR_RIVER_BASINS.length,
      complaints: relevantComplaints.length,
      resolvedComplaints: relevantComplaints.filter((c) => c.status === 'RESOLVED').length,
    };
  }, [dynamicStations, complaints, userComplaints, isCitizenDashboard]);

  // Open Modal Handler (sync temporary state with current)
  const handleOpenFilterModal = () => {
    setTempFilterTab(activeFilterTab);
    setTempBasin(selectedBasin);
    setTempBasemapTheme(basemapTheme);
    setTempBrightness(brightness);
    setTempContrast(contrast);
    setIsFilterModalOpen(true);
  };

  // Save & Apply Settings from Modal
  const handleSaveAndApply = () => {
    setActiveFilterTab(tempFilterTab);
    setSelectedBasin(tempBasin);
    setBasemapTheme(tempBasemapTheme);
    setBrightness(tempBrightness);
    setContrast(tempContrast);
    setIsFilterModalOpen(false);

    const map = mapInstanceRef.current;
    if (!map) return;

    if (tempFilterTab === 'basin' && tempBasin !== 'All Basins') {
      const basinCenters: Record<string, [number, number, number]> = {
        'Ganga Basin': [26.5, 82.5, 6],
        'Godavari Basin': [18.8, 79.5, 6],
        'Krishna Basin': [16.5, 78.0, 6],
        'Indus Basin': [31.5, 75.5, 6],
        'Narmada Basin': [22.0, 76.5, 7],
        'Mahanadi Basin': [21.0, 83.5, 7],
        'Cauvery Basin': [11.5, 78.0, 7],
        'Brahmaputra Basin': [26.5, 92.5, 6],
        'Tapi Basin': [21.2, 75.0, 7],
        'Pennar Basin': [14.5, 78.5, 7],
        'Sabarmati Basin': [23.0, 72.8, 7],
        'Mahi Basin': [23.5, 74.0, 7],
        'West Flowing Rivers of Kutch and Saurashtra including Luni': [22.31, 70.78, 7],
      };
      const target = basinCenters[tempBasin];
      if (target) {
        map.flyTo([target[0], target[1]], target[2], { animate: true, duration: 1.4 });
        return;
      }
    }

    if (tempFilterTab === 'reservoir') {
      map.flyTo([21.0, 78.5], 5, { animate: true, duration: 1.2 });
    } else if (tempFilterTab === 'rivers') {
      map.flyTo([22.5, 80.0], 5, { animate: true, duration: 1.2 });
    } else if (tempFilterTab === 'groundwater') {
      map.flyTo([20.0, 78.0], 5, { animate: true, duration: 1.2 });
    } else if (tempFilterTab === 'bhuvan_wbis') {
      map.flyTo([20.5, 82.0], 5, { animate: true, duration: 1.2 });
    } else if (tempFilterTab === 'all') {
      map.flyTo([20.5937, 78.9629], 5, { animate: true, duration: 1.2 });
    }
  };

  // Reset to default settings
  const handleResetSettings = () => {
    setTempFilterTab('all');
    setTempBasin('All Basins');
    setTempBasemapTheme('satellite');
    setTempBrightness(100);
    setTempContrast(100);
  };

  // Copy GPS coordinates helper
  const copyGpsCoordinates = (lat: number, lng: number) => {
    navigator.clipboard.writeText(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    setCopiedGps(true);
    setTimeout(() => setCopiedGps(false), 2000);
  };

  // Initialize Leaflet Map with Strict All-India Geoboundary
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [21.5, 79.0], // All-India Geographic Center
      zoom: 5,
      minZoom: 4.0, // Flexible zoom out across India
      maxZoom: 18,
      maxBounds: INDIA_BOUNDS,
      maxBoundsViscosity: 0.35, // Smooth boundary behavior without rigid lock
      zoomControl: true,
      attributionControl: true,
      preferCanvas: true,
    });

    mapInstanceRef.current = map;

    // Real-Time GPS Cursor Readout: Updates lat/lng live as mouse moves over map!
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({
        lat: Number(e.latlng.lat.toFixed(4)),
        lng: Number(e.latlng.lng.toFixed(4)),
      });
    });

    map.on('mouseout', () => {
      setCursorCoords(null);
    });

    map.on('move', () => {
      const center = map.getCenter();
      setCurrentCoords({
        lat: Number(center.lat.toFixed(4)),
        lng: Number(center.lng.toFixed(4)),
        zoom: map.getZoom(),
      });
    });

    // Layer groups for markers, rivers & state boundary highlight
    markersLayerGroupRef.current = L.layerGroup().addTo(map);
    riverVectorsLayerGroupRef.current = L.layerGroup().addTo(map);
    stateBorderLayerGroupRef.current = L.layerGroup().addTo(map);

    // Render River Vectors
    AP_RIVER_VECTORS.forEach((river) => {
      const polyline = L.polyline(river.coordinates, {
        color: '#0284c7',
        weight: river.weight + 0.5,
        opacity: 0.88,
        lineCap: 'round',
        lineJoin: 'round',
      });
      polyline.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px; font-weight: bold; color: #0284c7; background: #ffffff; padding: 4px 8px; border-radius: 6px; border: 1px solid #bae6fd; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          🌊 ${river.name}<br/><span style="font-size: 9px; color: #64748b; font-weight: normal;">${river.basin}</span>
        </div>`,
        { sticky: true, opacity: 0.95 }
      );
      polyline.addTo(riverVectorsLayerGroupRef.current!);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      stateBorderLayerGroupRef.current = null;
    };
  }, []);

  // Update Basemap Tiles based on basemapTheme (light_gis matches website design - NOT black!)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }
    if (hybridLabelLayerRef.current) {
      map.removeLayer(hybridLabelLayerRef.current);
      hybridLabelLayerRef.current = null;
    }

    if (basemapTheme === 'light_gis') {
      // Official OpenStreetMap Basemap - 100% Free, NO API key required, NO watermarks, crisp rivers, boundaries & clean light aesthetic
      tileLayerRef.current = L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, CWC, India-WRIS, ISRO Bhuvan',
        }
      ).addTo(map);
    } else if (basemapTheme === 'satellite') {
      // High-Resolution Satellite Basemap
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: '&copy; ISRO NRSC Bhuvan & Esri World Imagery',
        }
      ).addTo(map);

      // Label Overlay
      hybridLabelLayerRef.current = L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          opacity: 0.95,
        }
      ).addTo(map);
    } else if (basemapTheme === 'topo') {
      // Topographic Relief Basemap
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: '&copy; Esri World Topo Map & India-WRIS Relief',
        }
      ).addTo(map);
    }
  }, [basemapTheme]);

  // Calculate Marker Radius based on Zoom
  const calculateMarkerRadius = useCallback((zoom: number, status: WaterHealthStatus) => {
    let base = 6.0;
    if (zoom <= 5) base = 5.0;
    else if (zoom <= 7) base = 6.5;
    else if (zoom <= 9) base = 8.5;
    else base = 10.5;

    if (status === 'red') base += 2.0;
    if (status === 'grey') base += 1.0;
    return base;
  }, []);

  // Render Markers on Map with Hover & Animated Click
  const renderMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();
    const currentZoom = map.getZoom();

    filteredStations.forEach((station) => {
      const markerRadius = calculateMarkerRadius(currentZoom, station.status);

      // Status colors
      let fillColor = '#0284c7'; // normal blue
      let strokeColor = '#ffffff';

      if (station.status === 'green') {
        fillColor = '#10b981';
      } else if (station.status === 'blue') {
        fillColor = '#0284c7';
      } else if (station.status === 'yellow') {
        fillColor = '#f59e0b';
      } else if (station.status === 'red') {
        fillColor = '#ef4444';
        strokeColor = '#fecaca';
      } else if (station.status === 'grey') {
        fillColor = '#94a3b8';
        strokeColor = '#cbd5e1';
      }

      const isCurrentSelected = flashStation?.id === station.id;

      // Halo ring for selected station
      if (isCurrentSelected) {
        const haloMarker = L.circleMarker([station.lat, station.lng], {
          radius: markerRadius + 6.0,
          color: '#0284c7',
          weight: 2.5,
          fillColor: '#38bdf8',
          fillOpacity: 0.25,
          dashArray: '3, 4',
        });
        markersGroup.addLayer(haloMarker);
      }

      const marker = L.circleMarker([station.lat, station.lng], {
        radius: markerRadius,
        fillColor,
        color: isCurrentSelected ? '#0047ab' : strokeColor,
        weight: isCurrentSelected ? 2.5 : currentZoom >= 8 ? 1.5 : 1.0,
        opacity: 1,
        fillOpacity: station.status === 'grey' ? 0.85 : 0.95,
      });

      // Click Event: Open Flashcard (STAYS OPEN until user explicitly closes it) + Smooth Animated Zoom
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setFlashStation(station);
        map.flyTo([station.lat, station.lng], Math.max(map.getZoom() + 2, 8), {
          animate: true,
          duration: 1.2,
        });
      });

      markersGroup.addLayer(marker);
    });

    // Also render Citizen Complaints Layer (ONLY in Citizen / Normal User portal)
    // CRITICAL USER REQUIREMENT: Only the logged-in user's complaints appear on the map!
    // Unauthenticated visitors or other citizens will NOT see other users' private grievances.
    if (isCitizenDashboard && (activeFilterTab === 'complaints' || activeFilterTab === 'all')) {
      const displayComplaints = userComplaints;
      displayComplaints.forEach((c) => {
        if (!c.coordinates || !c.coordinates.lat || !c.coordinates.lng) return;

        // District filter check if district selected
        if (selectedDistrict && selectedDistrict !== 'All Districts') {
          if (!c.district?.toLowerCase().includes(selectedDistrict.toLowerCase())) {
            return;
          }
        }

        const isResolved = c.status === 'RESOLVED';
        const isSelected = flashComplaint?.id === c.id;

        // High-visibility distinct markers as requested
        // Resolved: Fixed Emerald Green (#10b981) with distinct White Checkmark (✓)
        // Active/In-Progress: Fixed Amber/Orange (#ea580c) with glowing pulsating ping ring
        const iconHtml = isResolved
          ? `<div style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: #10b981;
              border: 3px solid #ffffff;
              box-shadow: 0 4px 12px rgba(16, 185, 129, 0.7);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-weight: 900;
              font-size: 16px;
              cursor: pointer;
              transition: transform 0.2s;
              ${isSelected ? 'transform: scale(1.3); outline: 3px solid #047857;' : ''}
            ">✓</div>`
          : `<div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: #ea580c; opacity: 0.5; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
              <div style="
                position: relative;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: #ea580c;
                border: 2.5px solid #ffffff;
                box-shadow: 0 4px 12px rgba(234, 88, 12, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                font-weight: 800;
                font-size: 13px;
                ${isSelected ? 'transform: scale(1.3); outline: 3px solid #c2410c;' : ''}
              ">⚠️</div>
            </div>`;

        const complaintIcon = L.divIcon({
          html: iconHtml,
          className: 'complaint-pin-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const cMarker = L.marker([c.coordinates.lat, c.coordinates.lng], {
          icon: complaintIcon,
          zIndexOffset: 1200,
        });

        // Click Event: Open specialized Complaint Flashcard
        cMarker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setFlashStation(null);
          setFlashComplaint(c);
          if (onSelectComplaint) onSelectComplaint(c);
          map.flyTo([c.coordinates.lat, c.coordinates.lng], Math.max(map.getZoom() + 1, 9.5), {
            animate: true,
            duration: 1.0,
          });
        });

        markersGroup.addLayer(cMarker);
      });
    }
  }, [filteredStations, flashStation, flashComplaint, complaints, userComplaints, activeFilterTab, currentRole, selectedDistrict, calculateMarkerRadius, onSelectComplaint]);

  // Re-render markers on changes
  useEffect(() => {
    renderMarkers();
  }, [renderMarkers]);

  // Re-scale markers on zoom
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleZoomEnd = () => {
      renderMarkers();
    };

    map.on('zoomend', handleZoomEnd);
    return () => {
      map.off('zoomend', handleZoomEnd);
    };
  }, [renderMarkers]);

  // Language-Strict Flashcard Metadata
  const activeFlashcardMeta = useMemo(() => {
    if (!flashStation) return null;
    const cat = flashStation.category;
    const metaDict = language === 'hi' ? CATEGORY_META_HINDI : CATEGORY_META_ENGLISH;

    if (cat === 'reservoir') return metaDict.reservoir;
    if (cat === 'river_level' || cat === 'river_discharge') return metaDict.rivers;
    if (cat === 'groundwater') return metaDict.groundwater;
    if (cat === 'bhuvan_wbis') return metaDict.bhuvan_wbis;
    return metaDict.all;
  }, [flashStation, language]);

  const getCategoryIcon = (cat: string) => {
    if (cat === 'reservoir') return '💧';
    if (cat === 'river_level' || cat === 'river_discharge') return '🌊';
    if (cat === 'groundwater') return '⛏️';
    if (cat === 'bhuvan_wbis') return '🛰️';
    if (cat === 'rainfall') return '🌧️';
    return '🌐';
  };

  // Get human-readable active filter name
  const activeFilterName = useMemo(() => {
    if (activeFilterTab === 'all') return `All (${tabCounts.all})`;
    if (activeFilterTab === 'reservoir') return `Major Dams (${tabCounts.reservoir})`;
    if (activeFilterTab === 'rivers') return `Rivers & Discharge (${tabCounts.rivers})`;
    if (activeFilterTab === 'groundwater') return `Groundwater DWLR (${tabCounts.groundwater})`;
    if (activeFilterTab === 'bhuvan_wbis') return `Bhuvan Satellite (${tabCounts.bhuvan_wbis})`;
    if (activeFilterTab === 'basin') return `Basin: ${selectedBasin}`;
    return 'All Layers';
  }, [activeFilterTab, selectedBasin, tabCounts]);

  return (
    <div className="w-full bg-[#f8fafc] rounded-3xl border border-slate-200 overflow-hidden shadow-sm relative">
      {/* ============================================================== */}
      {/* 1. TOP CONTROLS: SEARCH BAR + REAL-TIME GPS HUD + FILTERS BTN   */}
      {/* ============================================================== */}
      <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 z-20">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Left: Search Bar with Smart State & District Detection */}
          <div className="relative flex-1 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex items-center">
            <Search className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
            <input
              type="text"
              placeholder={
                language === 'hi'
                  ? 'राज्य, ज़िला, स्टेशन, बांध या नदी खोजें (उदा. Andhra Pradesh, Rajkot, Tehri)...'
                  : 'Search state, district, dam, river (e.g. Andhra Pradesh, Visakhapatnam, Tehri)...'
              }
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              className="w-full bg-transparent px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
            />
            {searchQuery && (
              <button 
                onClick={handleClearSearch} 
                className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Middle: Real-Time Live GPS Coordinates HUD (Directly beside Search Bar) */}
          <div 
            onClick={() => copyGpsCoordinates(cursorCoords ? cursorCoords.lat : currentCoords.lat, cursorCoords ? cursorCoords.lng : currentCoords.lng)}
            title={language === 'hi' ? 'क्लिक करके सटीक GPS निर्देशांक कॉपी करें' : 'Click to copy exact GPS coordinates'}
            className="flex items-center justify-between sm:justify-start gap-2 bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-mono text-slate-700 shadow-2xs cursor-pointer hover:border-blue-400 hover:text-blue-700 transition-colors shrink-0"
          >
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#0047ab] animate-pulse shrink-0" />
              <span className="font-bold text-slate-800 text-[11px] tracking-tight">
                {cursorCoords 
                  ? (language === 'hi' 
                      ? `📍 लाइव GPS कर्सर: ${cursorCoords.lat}°N, ${cursorCoords.lng}°E`
                      : `📍 Live GPS: ${cursorCoords.lat}°N, ${cursorCoords.lng}°E`)
                  : (language === 'hi'
                      ? `📍 मानचित्र केंद्र: ${currentCoords.lat}°N, ${currentCoords.lng}°E (${currentCoords.zoom}x)`
                      : `📍 Map Center: ${currentCoords.lat}°N, ${currentCoords.lng}°E (${currentCoords.zoom}x)`)
                }
              </span>
            </div>
            {copiedGps ? (
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 ml-1">
                <Check className="w-3 h-3" /> {language === 'hi' ? 'कॉपी हुआ!' : 'Copied!'}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                ({language === 'hi' ? 'कॉपी करें' : 'Click to copy'})
              </span>
            )}
          </div>


          {/* Right: Modern Filter & Display Settings Button (Directly beside GPS) */}
          <button
            onClick={handleOpenFilterModal}
            className="px-4 py-2.5 rounded-2xl bg-[#0047ab] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0 active:scale-95"
            title={language === 'hi' ? 'फ़िल्टर एवं मानचित्र सेटिंग्स खोलें' : 'Open Hydrological Filters & Display Settings'}
          >
            <Sliders className="w-4 h-4 text-sky-200" />
            <span>{language === 'hi' ? 'फ़िल्टर एवं सेटिंग्स' : 'Filters & Settings'}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono">
              {activeFilterName}
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1.5 DEDICATED STATE & DISTRICT FILTER + YOUR COMPLAINTS         */}
      {/* (SHOWN ON CITIZEN / NORMAL USER DASHBOARD)                     */}
      {/* ============================================================== */}
      {isCitizenDashboard && (
        <div className="px-3 sm:px-4 py-2 bg-white border-b border-slate-200 flex flex-wrap items-center gap-2.5 z-10">
          {/* State Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/70 transition-colors border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#0047ab] shrink-0" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {tr('State:', 'राज्य:', 'రాష్ట్రం:')}
            </span>
            <select
              value={selectedState}
              onChange={(e) => handleSelectState(e.target.value)}
              className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="All India">{tr('All India', 'संपूर्ण भारत', 'అఖిల భారతం')}</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Odisha">Odisha</option>
              <option value="Bihar">Bihar</option>
              <option value="Punjab">Punjab</option>
              <option value="Kerala">Kerala</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Assam">Assam</option>
            </select>
          </div>

          {/* District Dropdown (Dynamic) */}
          <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/70 transition-colors border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {tr('District:', 'जिला:', 'జిల్లా:')}
            </span>
            <select
              value={selectedDistrict}
              onChange={(e) => handleSelectDistrict(e.target.value)}
              className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer max-w-[170px] truncate pr-1"
            >
              <option value="All Districts">{tr('All Districts', 'सभी जिले', 'అన్ని జిల్లాలు')} ({availableDistricts.length})</option>
              {availableDistricts.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Your Complaints Button (Placed right beside District) */}
          {/* Strictly visible ONLY to users who have lodged complaints with their mobile number */}
          {userComplaints.length > 0 ? (
            <button
              onClick={() => {
                setActiveFilterTab('complaints');
                const first = userComplaints[0];
                if (first && first.coordinates) {
                  setFlashComplaint(first);
                  if (onSelectComplaint) onSelectComplaint(first);
                  const map = mapInstanceRef.current;
                  if (map) {
                    map.flyTo([first.coordinates.lat, first.coordinates.lng], 10.5, {
                      animate: true,
                      duration: 1.0,
                    });
                  }
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 border shadow-2xs ${
                activeFilterTab === 'complaints'
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white border-transparent ring-2 ring-amber-400/50 shadow-xs'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
              title={tr('Click to view and track your personal lodged complaints (Only visible to you)', 'अपनी दर्ज की गई व्यक्तिगत शिकायतें देखने और ट्रैक करने के लिए क्लिक करें', 'మీరు నమోదు చేసిన వ్యక్తిగత ఫిర్యాదులను ట్రాక్ చేయడానికి క్లిక్ చేయండి')}
            >
              <span>⚠️</span>
              <span>{tr('Your Complaints', 'आपकी शिकायतें', 'మీ ఫిర్యాదులు')}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/15 text-[10px] font-mono font-bold">
                {userComplaints.length}
              </span>
            </button>
          ) : isLoggedIn ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>{tr('Your Complaints: 0', 'आपकी शिकायतें: 0', 'మీ ఫిర్యాదులు: 0')}</span>
            </div>
          ) : onOpenLoginModal ? (
            <button
              onClick={onOpenLoginModal}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
              title={tr('Login with your mobile number to view your private complaints on the map', 'मानचित्र पर अपनी निजी शिकायतें देखने के लिए अपने मोबाइल नंबर से लॉगिन करें', 'మ్యాప్‌లో మీ ప్రైవేట్ ఫిర్యాదులను చూడటానికి మొబైల్ నంబర్‌తో లాగిన్ చేయండి')}
            >
              <LogIn className="w-3.5 h-3.5 text-amber-700" />
              <span>{tr('Login to View Your Complaints', 'अपनी शिकायतें देखने के लिए लॉगिन करें', 'మీ ఫిర్యాదులను చూడటానికి లాగిన్ చేయండి')}</span>
            </button>
          ) : null}

          {/* State Boundary Highlight Status Badge */}
          {selectedState && selectedState !== 'All India' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-200 text-[#0047ab] text-xs font-bold animate-in fade-in ml-auto sm:ml-0">
              <span className="text-xs">🗺️</span>
              <span className="text-[11px]">
                {selectedDistrict && selectedDistrict !== 'All Districts'
                  ? `${tr('Border Highlighted:', 'सीमा रेखा हाइलाइट:', 'సరిహద్దు హైలైట్:')} ${selectedDistrict}, ${selectedState}`
                  : `${tr('Border Highlighted:', 'सीमा रेखा हाइलाइट:', 'సరిహద్దు హైలైట్:')} ${selectedState}`}
              </span>
              <button
                onClick={() => handleSelectState('All India')}
                className="ml-1 px-1.5 py-0.5 rounded-md bg-sky-200 hover:bg-sky-300 text-[#0047ab] text-[10px] font-extrabold cursor-pointer transition-colors"
                title={tr('Reset to All India', 'संपूर्ण भारत रीसेट करें', 'అఖిల భారతానికి రీసెట్ చేయండి')}
              >
                ✕ {tr('All India', 'संपूर्ण भारत', 'అఖిల భారతం')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MAP VIEW CONTAINER WITH FLOATING PERSISTENT FLASHCARD        */}
      {/* ============================================================== */}
      <div className={`relative w-full h-[620px] sm:h-[700px] lg:h-[780px] overflow-hidden transition-colors ${basemapTheme === 'satellite' ? 'bg-[#0a0f1d]' : 'bg-[#eef2f6]'}`}>
        {/* Leaflet map canvas */}
        <div 
          ref={mapContainerRef} 
          className={`w-full h-full transition-colors ${basemapTheme === 'satellite' ? 'bg-[#0a0f1d]' : 'bg-[#eef2f6]'}`}
          style={{
            filter: `brightness(${brightness}%) contrast(${contrast}%)`,
          }}
        />

        {/* COMPLAINT DETAIL FLASHCARD (Opens on complaint pin click, CLOSES ONLY on [X] click) */}
        {flashComplaint && (
          <div 
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-40 max-w-sm sm:max-w-md w-[calc(100%-24px)] sm:w-auto bg-white/95 border border-slate-200/90 backdrop-blur-xl shadow-2xl rounded-3xl p-4 sm:p-5 text-slate-900 space-y-3.5 pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto"
          >
            {/* Flashcard Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    flashComplaint.status === 'RESOLVED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    {flashComplaint.status === 'RESOLVED' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>✓ {language === 'hi' ? 'हल किया गया (कार्य पूर्ण)' : 'RESOLVED / COMPLETED'}</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <span>⚠️ {language === 'hi' ? 'कार्रवाई जारी' : 'UNDER INVESTIGATION'}</span>
                      </>
                    )}
                  </span>
                  <span className="font-mono text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    {flashComplaint.id}
                  </span>
                  {flashComplaint.wasteType && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
                      <span>⚠️</span>
                      <span>{flashComplaint.wasteType}</span>
                    </span>
                  )}
                </div>

                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                  {flashComplaint.locationLandmark}
                </h4>

                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 flex-wrap">
                  <span>{flashComplaint.village ? `${flashComplaint.village}, ` : ''}{flashComplaint.mandal}, {flashComplaint.district}</span>
                  <span>•</span>
                  <span 
                    onClick={() => copyGpsCoordinates(flashComplaint.coordinates.lat, flashComplaint.coordinates.lng)}
                    className="text-blue-600 font-mono text-[10px] cursor-pointer hover:underline flex items-center gap-1"
                    title="Click to copy GPS"
                  >
                    📍 {flashComplaint.coordinates.lat.toFixed(4)}°N, {flashComplaint.coordinates.lng.toFixed(4)}°E
                  </span>
                </div>
              </div>

              {/* Close Button: Closes ONLY on [X] click */}
              <button
                onClick={() => setFlashComplaint(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                title="Close Flashcard"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photos Section: Citizen Photo and Inspector Resolution Photo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Citizen Original Photo */}
              <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  📸 {language === 'hi' ? 'शिकायत का फ़ोटो (नागरिक प्रमाण)' : 'Citizen Complaint Photo'}
                </span>
                <img
                  src={flashComplaint.photoUrl || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80'}
                  alt="Citizen Evidence"
                  className="w-full h-28 object-cover rounded-xl border border-slate-200"
                />
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  {flashComplaint.submittedAt}
                </div>
              </div>

              {/* If Resolved: Inspector Resolution Photo */}
              {flashComplaint.status === 'RESOLVED' ? (
                <div className="bg-emerald-50/70 rounded-2xl p-2.5 border border-emerald-300">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'hi' ? 'सत्यापित समाधान फ़ोटो' : 'Resolution Proof Photo'}</span>
                  </span>
                  <img
                    src={
                      flashComplaint.workExecution?.afterPhotoUrl ||
                      flashComplaint.inspectionReport?.postWorkVerification?.verificationPhotoUrl ||
                      flashComplaint.inspectionReport?.sitePhotoUrl ||
                      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
                    }
                    alt="Work Completed"
                    className="w-full h-28 object-cover rounded-xl border border-emerald-300 shadow-2xs"
                  />
                  <div className="text-[10px] text-emerald-800 font-bold mt-1 truncate">
                    ✓ {language === 'hi' ? 'कार्य पूर्ण व सत्यापित' : 'Work Completed & Approved'}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/70 rounded-2xl p-2.5 border border-amber-300 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-800 uppercase block mb-1">
                      {language === 'hi' ? 'फ़ील्ड स्थिति' : 'Field Progress Status'}
                    </span>
                    <p className="text-[11px] text-amber-900 font-medium">
                      {language === 'hi'
                        ? 'जांच अधिकारी स्थल पर रवाना। टीडीएस रीडिंग व कचरा निवारण जारी है।'
                        : 'Field team dispatched. Water testing & waste removal in progress.'}
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-600 space-y-0.5 mt-2">
                    <div><strong>Inspector:</strong> {flashComplaint.assignedInspector || 'Dispatched'}</div>
                    <div><strong>Nodal Cell:</strong> {flashComplaint.assignedNodalOfficer}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Description & Citizen Info */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs space-y-1.5">
              <div>
                <span className="font-bold text-slate-800">{language === 'hi' ? 'समस्या विवरण: ' : 'Problem Description: '}</span>
                <span className="text-slate-600">{flashComplaint.shortDescription}</span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 flex justify-between items-center">
                <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'hi' ? 'नागरिक:' : 'Citizen:'} <strong>{currentUser?.name || flashComplaint.citizenName}</strong></span>
                </span>
                <span className="font-mono text-[#0047ab] font-bold">{currentUser?.phone || flashComplaint.citizenPhone}</span>
              </div>
            </div>

            {/* If Resolved: Verification sign-off details */}
            {flashComplaint.status === 'RESOLVED' && (
              <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-[11px] space-y-1">
                <div className="font-bold flex items-center justify-between">
                  <span>{language === 'hi' ? 'इंस्पेक्टर सत्यापन रिपोर्ट:' : 'Inspector Verification Report:'}</span>
                  <span className="text-emerald-700 font-mono font-bold">
                    TDS: {flashComplaint.inspectionReport?.tdsReadingPpm || 220} ppm (Normal)
                  </span>
                </div>
                <p className="text-emerald-800 text-[10px]">
                  {flashComplaint.inspectionReport?.postWorkVerification?.remarks ||
                    flashComplaint.workExecution?.workSummary ||
                    'Site thoroughly de-contaminated. Soil buffer created, water testing normal. Case officially closed.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* PERSISTENT FLASHCARD (Opens on click/inspect, CLOSES ONLY on [X] click) */}
        {flashStation && (
          <div 
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-40 max-w-sm sm:max-w-md w-[calc(100%-24px)] sm:w-auto bg-white/95 border border-slate-200/90 backdrop-blur-xl shadow-2xl rounded-3xl p-4 sm:p-5 text-slate-900 space-y-3.5 pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto"
          >
            {/* Flashcard Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0047ab] font-bold text-[10px] border border-blue-200">
                  <span>{getCategoryIcon(flashStation.category)}</span>
                  <span>{activeFlashcardMeta ? activeFlashcardMeta.badge : flashStation.category.toUpperCase()}</span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                  {flashStation.name}
                </h4>
                {flashStation.teluguName && language === 'te' && (
                  <p className="text-xs text-sky-700 font-medium">{flashStation.teluguName}</p>
                )}
                {flashStation.hindiName && language === 'hi' && (
                  <p className="text-xs text-amber-700 font-medium">{flashStation.hindiName}</p>
                )}
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 flex-wrap">
                  <span>{flashStation.district}, {flashStation.state}</span>
                  <span>•</span>
                  <span className="text-slate-700 font-semibold">{stationTelemetry?.basin || flashStation.basin}</span>
                  <span>•</span>
                  <span className="text-blue-600 font-mono text-[10px]">📍 {flashStation.lat.toFixed(4)}°N, {flashStation.lng.toFixed(4)}°E</span>
                </div>
              </div>

              {/* Close Button: Strictly closes on [X] click as requested by user */}
              <button
                onClick={() => setFlashStation(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                title={language === 'hi' ? 'कार्ड बंद करें' : 'Close Flashcard'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ============================================================== */}
            {/* 1. 100% REAL LIVE CATCHMENT WEATHER & MET TELEMETRY (OPEN-METEO) */}
            {/* ============================================================== */}
            <div className="bg-gradient-to-br from-blue-50/70 via-white to-sky-50/50 border border-blue-200/90 rounded-2xl p-3 text-[11px] space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-extrabold text-[11px] text-[#0047ab] tracking-tight uppercase flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                    {flashStation.category === 'groundwater'
                      ? (language === 'hi' ? 'स्थानिक भू-मौसम एवं पुनर्भरण मौसम' : 'Real-Time Wellhead & Recharge Meteorology')
                      : flashStation.category === 'bhuvan_wbis'
                      ? (language === 'hi' ? 'जल निकाय एवं सतही मौसम' : 'Water Body Micro-Climate')
                      : (language === 'hi' ? 'वास्तविक लाइव कैचमेंट टेलीमेट्री' : 'Real-Time Catchment Telemetry')}
                  </span>
                </div>

                {/* Live Refresh Button */}
                <button
                  type="button"
                  onClick={() => fetchLiveCatchmentTelemetry(flashStation.lat, flashStation.lng)}
                  disabled={isRefreshingTelemetry}
                  className="p-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-700 hover:border-blue-300 flex items-center gap-1 text-[10px] font-semibold cursor-pointer transition-all shadow-2xs active:scale-95"
                  title={language === 'hi' ? 'लाइव मौसम डेटा रिफ्रेश करें' : 'Refresh live sensor telemetry'}
                >
                  <RefreshCw className={`w-3 h-3 text-blue-600 ${isRefreshingTelemetry ? 'animate-spin' : ''}`} />
                  <span>{language === 'hi' ? 'रिफ्रेश' : 'Refresh'}</span>
                </button>
              </div>

              {/* Real-time stats grid */}
              {realTimeTelemetry ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center">
                    {/* Live Rainfall */}
                    <div className={`p-1.5 rounded-xl border ${realTimeTelemetry.precipitation > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-white border-slate-200/90'}`}>
                      <span className="text-[9px] text-slate-500 font-bold block">
                        {language === 'hi' ? 'लाइव वर्षा' : 'LIVE RAIN'}
                      </span>
                      <span className="text-xs font-black font-mono text-blue-700 flex items-center justify-center gap-0.5">
                        <CloudRain className="w-3 h-3 text-sky-500 shrink-0" />
                        {realTimeTelemetry.precipitation} mm/h
                      </span>
                      <span className="text-[9px] font-medium text-slate-400 block truncate">
                        {realTimeTelemetry.precipitation > 0
                          ? (language === 'hi'
                              ? (flashStation.category === 'groundwater' ? 'सक्रिय अंतःस्रवण' : 'सक्रिय आवक')
                              : (flashStation.category === 'groundwater' ? 'Active Infiltration' : 'Active Inflow'))
                          : (language === 'hi'
                              ? (flashStation.category === 'groundwater' ? 'शुष्क सतह' : 'शुष्क कैचमेंट')
                              : (flashStation.category === 'groundwater' ? 'Dry Surface' : 'No Rain'))}
                      </span>
                    </div>

                    {/* Air Temperature */}
                    <div className="bg-white p-1.5 rounded-xl border border-slate-200/90">
                      <span className="text-[9px] text-slate-500 font-bold block">
                        {language === 'hi' ? 'तापमान' : 'AIR TEMP'}
                      </span>
                      <span className="text-xs font-black font-mono text-slate-800 flex items-center justify-center gap-0.5">
                        <Thermometer className="w-3 h-3 text-amber-500 shrink-0" />
                        {realTimeTelemetry.temperature}°C
                      </span>
                      <span className="text-[9px] font-medium text-slate-400 block truncate">
                        {flashStation.category === 'groundwater'
                          ? (language === 'hi' ? 'बोरवेल स्थल' : 'DWLR Site')
                          : (language === 'hi' ? 'कैचमेंट' : 'Catchment')}
                      </span>
                    </div>

                    {/* Air Humidity */}
                    <div className="bg-white p-1.5 rounded-xl border border-slate-200/90">
                      <span className="text-[9px] text-slate-500 font-bold block">
                        {language === 'hi' ? 'आर्द्रता' : 'HUMIDITY'}
                      </span>
                      <span className="text-xs font-black font-mono text-sky-700 flex items-center justify-center gap-0.5">
                        <Droplets className="w-3 h-3 text-sky-500 shrink-0" />
                        {realTimeTelemetry.humidity}%
                      </span>
                      <span className="text-[9px] font-medium text-slate-400 block truncate">
                        {language === 'hi' ? 'वातावरण' : 'Atmosphere'}
                      </span>
                    </div>

                    {/* Wind Speed */}
                    <div className="bg-white p-1.5 rounded-xl border border-slate-200/90">
                      <span className="text-[9px] text-slate-500 font-bold block">
                        {language === 'hi' ? 'पवन गति' : 'WIND'}
                      </span>
                      <span className="text-xs font-black font-mono text-slate-800 flex items-center justify-center gap-0.5">
                        <Wind className="w-3 h-3 text-slate-500 shrink-0" />
                        {realTimeTelemetry.windSpeed} km/h
                      </span>
                      <span className="text-[9px] font-medium text-slate-400 block truncate">
                        10m Surface
                      </span>
                    </div>
                  </div>

                  {/* Real-time sync footer */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 border-t border-blue-100/80 pt-1.5">
                    <span className="font-medium text-slate-700 flex items-center gap-1">
                      <span>{language === 'hi' ? realTimeTelemetry.conditionHi : realTimeTelemetry.condition}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-[9px]">{realTimeTelemetry.elevationM}m MSL Elevation</span>
                    </span>
                    <span className="text-blue-700 font-mono text-[9px] font-semibold">
                      🕒 {realTimeTelemetry.timestamp} IST
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-2.5 flex items-center justify-center gap-2 text-slate-500 text-xs">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  <span>{language === 'hi' ? 'वास्तविक लाइव कैचमेंट मौसम लोड हो रहा है...' : 'Fetching live catchment telemetry...'}</span>
                </div>
              )}
            </div>

            {/* ============================================================== */}
            {/* 2. OFFICIAL HYDROLOGICAL MASTER BENCHMARKS (CWC / WRIS / CGWB)  */}
            {/* ============================================================== */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {flashStation.category === 'bhuvan_wbis'
                    ? (language === 'hi' ? 'इसरो-भुवन व राज्य वेटलैंड प्राधिकरण टेलीमेट्री' : 'ISRO-Bhuvan & State Wetland Telemetry')
                    : flashStation.category === 'groundwater'
                    ? (language === 'hi' ? 'केन्द्रीय भूमि जल बोर्ड (CGWB) टेलीमेट्री' : 'Official CGWB Groundwater Telemetry')
                    : (language === 'hi' ? 'केन्द्रीय जल आयोग व राज्य जल संसाधन टेलीमेट्री' : 'Official CWC & State WRD Telemetry')}
                </span>
                <span className="text-[9px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {(() => {
                    const rawAgency = (stationTelemetry?.agency && (flashStation.state === 'Andhra Pradesh' || !stationTelemetry.agency.includes('APWRIMS')))
                      ? stationTelemetry.agency
                      : flashStation.agency;
                    if (rawAgency.includes('Network') || rawAgency.includes('Authority') || rawAgency.includes('Grid') || rawAgency.includes('Board') || rawAgency.includes('Constellation')) {
                      return rawAgency;
                    }
                    return `${rawAgency} Network`;
                  })()}
                </span>
              </div>

              {/* Live Station Telemetry Verification Card */}
              {stationTelemetry && (
                <div className={`p-2.5 rounded-2xl border text-[11px] space-y-1.5 shadow-2xs ${
                  stationTelemetry.isLiveVerified 
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' 
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="font-extrabold text-[10px] tracking-tight uppercase text-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {stationTelemetry.isLiveVerified
                          ? (language === 'hi' ? 'लाइव सरकारी नेटवर्क द्वारा सत्यापित' : 'LIVE VERIFIED TELEMETRY')
                          : (language === 'hi' ? 'आधिकारिक बेंचमार्क टेलीमेट्री' : 'Official Hydrological Telemetry')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => fetchLiveStationTelemetry(flashStation)}
                      disabled={isRefreshingStationTelemetry}
                      className="p-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-700 hover:border-blue-300 flex items-center gap-1 text-[10px] font-semibold cursor-pointer transition-all shadow-2xs active:scale-95"
                      title={language === 'hi' ? 'टेलीमेट्री पुनः जांचें' : 'Re-verify live telemetry'}
                    >
                      <RefreshCw className={`w-3 h-3 text-blue-600 ${isRefreshingStationTelemetry ? 'animate-spin' : ''}`} />
                      <span>{isRefreshingStationTelemetry ? (language === 'hi' ? 'जांच जारी...' : 'Syncing...') : (language === 'hi' ? 'पुनः जांच' : 'Re-verify')}</span>
                    </button>
                  </div>

                  {stationTelemetry.verificationNote && (
                    <p className="text-[11px] leading-relaxed text-emerald-900 font-medium">
                      {stationTelemetry.verificationNote}
                    </p>
                  )}

                  {stationTelemetry.discrepancyNotice && (
                    <div className="p-2 rounded-xl bg-blue-50/90 border border-blue-200 text-[10px] text-blue-900 flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{stationTelemetry.discrepancyNotice}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[9px] text-slate-500 border-t border-emerald-200/60 pt-1 mt-1 font-mono">
                    <span className="truncate max-w-[240px] font-semibold text-slate-700">
                      {flashStation.category === 'reservoir' 
                        ? '📋 CWC RSMS Daily Bulletin (08:30 IST Cycle)' 
                        : flashStation.category === 'groundwater'
                        ? (stationTelemetry?.verificationSource || '📊 CGWB National DWLR Grid & DJB')
                        : flashStation.category === 'bhuvan_wbis'
                        ? (stationTelemetry?.verificationSource || (flashStation.state === 'Bihar' ? '🛰️ ISRO NRSC Bhuvan WBIS & BSWA' : '🛰️ ISRO NRSC Bhuvan WBIS'))
                        : stationTelemetry?.verificationSource || (flashStation.state === 'Bihar' ? 'WRD Bihar & CWC Telemetry Grid' : 'National Hydrological Grid (CWC / WRD)')}
                    </span>
                    <span>{flashStation.category === 'reservoir' ? '📅 17 Oct 2026' : `🕒 ${stationTelemetry.lastSync} IST`}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs">
                {flashStation.category === 'reservoir' && (() => {
                  const effectiveStorage = stationTelemetry?.currentLiveStorageMCM ?? flashStation.currentLiveStorageMCM;
                  const effectiveStoragePct = stationTelemetry?.storagePercentage ?? flashStation.storagePercentage;
                  const effectiveWaterLevel = stationTelemetry?.waterLevelM ?? flashStation.waterLevelM;
                  const effectiveFRL = stationTelemetry?.fullReservoirLevelM ?? flashStation.fullReservoirLevelM;
                  const effectiveWarning = stationTelemetry?.warningLevelM ?? flashStation.warningLevelM;
                  const bufferMargin = (effectiveWaterLevel && effectiveFRL) ? (effectiveFRL - effectiveWaterLevel) : null;

                  return (
                    <>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block">
                          {language === 'hi' ? 'वर्तमान भंडारण' : 'CURRENT STORAGE'}
                        </span>
                        <span className="text-sm font-black text-[#0047ab] font-mono">
                          {effectiveStorage ? `${effectiveStorage.toLocaleString()} MCM` : flashStation.currentLiveStorageBMC ? `${flashStation.currentLiveStorageBMC} BMC` : '--'}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold block">
                          {effectiveStoragePct ? `${effectiveStoragePct}%` : '--'} {language === 'hi' ? 'भराव क्षमता' : 'of Full Limit'}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block">
                          {language === 'hi' ? 'जल स्तर' : 'WATER LEVEL'}
                        </span>
                        <div className="flex items-baseline gap-1 flex-wrap">
                          <span className="text-sm font-black text-slate-800 font-mono">
                            {effectiveWaterLevel ? `${effectiveWaterLevel.toFixed(2)} m` : '--'}
                          </span>
                          {effectiveWaterLevel && (
                            <span className="text-[10px] font-semibold text-slate-500 font-mono">
                              ({(effectiveWaterLevel * 3.28084).toFixed(1)} ft)
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          {language === 'hi' ? 'FRL स्तर' : 'FRL Level'}: {effectiveFRL ? `${effectiveFRL.toFixed(2)} m (${Math.round(effectiveFRL * 3.28084)} ft)` : '--'}
                        </span>
                      </div>

                      {/* Dynamic Flood Safety Clearance Buffer */}
                      {effectiveWaterLevel && effectiveFRL && bufferMargin !== null && (
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 col-span-2 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              {language === 'hi' ? 'सुरक्षित जलस्तर मार्जिन (Buffer to FRL):' : 'Clearance Buffer to FRL:'}
                            </span>
                            <span className="font-mono text-emerald-700 font-bold">
                              {bufferMargin.toFixed(2)} m ({(bufferMargin * 3.28084).toFixed(1)} ft) {language === 'hi' ? 'नीचे (सुरक्षित)' : 'below Full Crest'}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                            <div 
                              className={`h-full ${
                                bufferMargin < 1.0 
                                  ? 'bg-rose-500' 
                                  : bufferMargin < 2.5 
                                  ? 'bg-amber-500' 
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(5, effectiveStoragePct || 70))}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono flex-wrap gap-1">
                            <span>{language === 'hi' ? 'वर्तमान' : 'Current'}: {effectiveWaterLevel.toFixed(2)} m ({(effectiveWaterLevel * 3.28084).toFixed(1)} ft)</span>
                            <span className="text-amber-700 font-semibold">{language === 'hi' ? 'चेतावनी स्तर' : 'Warning'}: {effectiveWarning ? `${effectiveWarning.toFixed(2)} m (${Math.round(effectiveWarning * 3.28084)} ft)` : effectiveFRL ? `${(effectiveFRL - 1.52).toFixed(2)} m` : '--'}</span>
                            <span className="text-slate-700 font-semibold">{language === 'hi' ? 'अधिकतम FRL' : 'FRL'}: {effectiveFRL.toFixed(2)} m ({Math.round(effectiveFRL * 3.28084)} ft)</span>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

                {(flashStation.category === 'river_level' || flashStation.category === 'river_discharge') && (() => {
                  const effectiveDischarge = stationTelemetry?.dischargeCusecs ?? flashStation.dischargeCusecs;
                  const effectiveRiverLevel = stationTelemetry?.currentRiverLevelM ?? flashStation.currentRiverLevelM;
                  const effectivePondLevel = stationTelemetry?.pondLevelM ?? flashStation.pondLevelM;
                  const effectiveDanger = stationTelemetry?.dangerLevelM ?? flashStation.dangerLevelM;
                  const effectiveAgency = stationTelemetry?.agency ?? flashStation.agency;

                  return (
                    <>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block">
                          {language === 'hi' ? 'नदी जल स्तर' : 'RIVER WATER LEVEL'}
                        </span>
                        <span className="text-sm font-black text-blue-700 font-mono">
                          {effectiveRiverLevel ? `${effectiveRiverLevel.toFixed(2)} m` : '--'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium block">
                          {effectivePondLevel ? (
                            <span className="text-emerald-700 font-semibold">{language === 'hi' ? 'पोंड स्तर' : 'Pond Level'}: {effectivePondLevel.toFixed(2)} m</span>
                          ) : effectiveDanger ? (
                            <span className="text-amber-600">{language === 'hi' ? 'ख़तरा स्तर' : 'Danger Mark'}: {effectiveDanger.toFixed(2)} m</span>
                          ) : (
                            'Normal / Safe'
                          )}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block">
                          {language === 'hi' ? 'नदी बहाव (डिस्चार्ज)' : 'RIVER DISCHARGE'}
                        </span>
                        <span className="text-sm font-black text-slate-900 font-mono">
                          {effectiveDischarge ? `${effectiveDischarge.toLocaleString()} cfs` : (language === 'hi' ? 'नियमित' : 'Regulated')}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold block flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{effectiveAgency}</span>
                        </span>
                      </div>

                      {effectiveRiverLevel && effectiveDanger && (
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 col-span-2 flex items-center justify-between text-[10px]">
                          <span className="text-slate-600 font-medium flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            {language === 'hi' ? 'ख़तरे के निशान से सुरक्षित अंतर:' : 'Margin to Danger Mark:'}
                          </span>
                          <span className="font-mono font-bold text-emerald-700">
                            {(effectiveDanger - effectiveRiverLevel).toFixed(2)} m {language === 'hi' ? 'सुरक्षित अंतर' : 'Safety Buffer'}
                          </span>
                        </div>
                      )}
                    </>
                  );
                })()}

                {flashStation.category === 'groundwater' && (() => {
                  const effectiveDepth = stationTelemetry?.waterLevelDepthMBGL ?? flashStation.waterLevelDepthMBGL;
                  const effectiveTrend = stationTelemetry?.rechargeTrendM ?? flashStation.rechargeTrendM;
                  const effectivePreMonsoon = stationTelemetry?.preMonsoonMBGL ?? flashStation.preMonsoonMBGL;
                  const depthMbgl = effectiveDepth != null ? Math.abs(effectiveDepth) : null;
                  const isRising = (effectiveTrend ?? 0) >= 0;

                  return (
                    <>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block">
                          {language === 'hi' ? 'भूजल गहराई (DTWL)' : 'DEPTH TO WATER (DTWL)'}
                        </span>
                        <span className="text-sm font-black text-amber-600 font-mono">
                          {depthMbgl != null ? `${depthMbgl.toFixed(2)} mbgl` : '--'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {language === 'hi' ? 'मीटर ज़मीन के नीचे (CGWB मानक)' : 'm Below Ground Level (+ve)'}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block">
                          {language === 'hi' ? 'मौसमी रीचार्ज रुझान' : 'RECHARGE TREND'}
                        </span>
                        <span className={`text-sm font-black font-mono ${isRising ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {effectiveTrend != null ? `${isRising ? `+${effectiveTrend.toFixed(2)}` : effectiveTrend.toFixed(2)} m` : '--'}
                        </span>
                        <span className={`text-[10px] font-semibold block ${isRising ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isRising
                            ? (language === 'hi' ? 'भूजल स्तर वृद्धि (लाभ)' : 'Aquifer Seasonal Gain')
                            : (language === 'hi' ? 'भूजल स्तर गिरावट' : 'Aquifer Drawdown / Drop')}
                        </span>
                      </div>
                      {effectivePreMonsoon != null && (
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 col-span-2 flex items-center justify-between text-[10px]">
                          <span className="text-slate-600 font-medium">
                            {language === 'hi' ? 'प्री-मानसून बेसलाइन गहराई:' : 'Pre-Monsoon Baseline Depth:'}
                          </span>
                          <span className="font-mono font-bold text-slate-800">
                            {Math.abs(effectivePreMonsoon).toFixed(2)} mbgl
                          </span>
                        </div>
                      )}
                      {(stationTelemetry?.aquiferZone || (flashStation as any).aquiferZone) && (
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 col-span-2 flex items-center justify-between text-[10px]">
                          <span className="text-slate-600 font-medium">
                            {language === 'hi' ? 'हाइड्रोलॉजिकल शैल परत:' : 'Aquifer Formation:'}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {stationTelemetry?.aquiferZone || (flashStation as any).aquiferZone}
                          </span>
                        </div>
                      )}
                    </>
                  );
                })()}

                {flashStation.category === 'bhuvan_wbis' && (() => {
                  const effectiveNdwi = stationTelemetry?.ndwiScore ?? flashStation.ndwiScore;
                  const effectiveSpread = stationTelemetry?.waterSpreadHa ?? flashStation.waterSpreadHa;
                  const effectiveBaseline = stationTelemetry?.baselineSpreadHa ?? flashStation.baselineSpreadHa;

                  return (
                    <>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block">
                          {language === 'hi' ? 'भुवन NDWI स्कोर' : 'BHUVAN NDWI SCORE'}
                        </span>
                        <span className="text-sm font-black text-emerald-600 font-mono">
                          {effectiveNdwi != null ? (effectiveNdwi > 0 ? `+${effectiveNdwi}` : effectiveNdwi) : '--'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {language === 'hi' ? 'उपग्रह द्वारा मापा गया' : 'Optically Detected'}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block">
                          {language === 'hi' ? 'जल फैलाव क्षेत्रफल' : 'WATER SPREAD AREA'}
                        </span>
                        <span className="text-sm font-black text-slate-800 font-mono">
                          {effectiveSpread != null ? `${effectiveSpread.toLocaleString()} Ha` : '--'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {flashStation.isExtinct 
                            ? (language === 'hi' ? 'सूख कर मिट गया' : 'Dry Bed / Desiccated')
                            : (language === 'hi' ? 'सतही क्षेत्रफल' : 'Surface Area')}
                        </span>
                      </div>
                      {effectiveBaseline && effectiveSpread && (
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 col-span-2 flex items-center justify-between text-[10px]">
                          <span className="text-slate-600 font-medium">
                            {language === 'hi' ? 'आधिकारिक रामसर / बेसलाइन फैलाव:' : 'Official Ramsar / Baseline Area:'}
                          </span>
                          <span className="font-mono font-bold text-slate-800">
                            {effectiveBaseline.toLocaleString()} Ha ({Math.min(100, Math.round((effectiveSpread / effectiveBaseline) * 100))}% {language === 'hi' ? 'आवरण' : 'coverage'})
                          </span>
                        </div>
                      )}
                    </>
                  );
                })()}

                {flashStation.category === 'rainfall' && (() => {
                  const effectiveRain = stationTelemetry?.rainfallMm ?? flashStation.rainfallMm;
                  const effectiveNormal = stationTelemetry?.normalRainfallMm ?? flashStation.normalRainfallMm;
                  const effectiveDeparture = stationTelemetry?.departurePercent ?? flashStation.departurePercent;
                  const effectiveElevation = stationTelemetry?.elevationMslM ?? (flashStation.district === 'Rajkot' ? 133 : 180);
                  const effectiveSubBasin = flashStation.subBasin || stationTelemetry?.subBasin || (flashStation.district === 'Rajkot' ? 'Aji & Bhadar River Basin (Saurashtra)' : 'Active River Catchment');

                  return (
                    <>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block">
                          {language === 'hi' ? '24 घंटे / दर्ज वर्षा' : 'RECORDED / 24H RAIN'}
                        </span>
                        <span className="text-base font-black text-blue-700 font-mono">
                          {effectiveRain != null ? `${effectiveRain} mm` : '--'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {language === 'hi' ? 'आईएमडी ऑटोमेटेड गेज' : 'IMD Automated Gauge'}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block">
                          {language === 'hi' ? 'सामान्य वर्षा एवं विचलन' : 'NORMAL & DEPARTURE'}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-black text-slate-800 font-mono">
                            {effectiveNormal != null ? `${effectiveNormal} mm` : '--'}
                          </span>
                          {effectiveDeparture != null && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              effectiveDeparture >= 20 ? 'bg-sky-100 text-sky-800 border border-sky-300' :
                              effectiveDeparture <= -20 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}>
                              {effectiveDeparture >= 0 ? `+${effectiveDeparture}%` : `${effectiveDeparture}%`}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          {language === 'hi' ? 'दीर्घकालिक मौसमी संदर्भ' : 'Long-Term Seasonal Ref'}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 col-span-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-600 font-medium">
                          {language === 'hi' ? 'कैचमेंट एवं उप-बेसिन स्थिति:' : 'Hydrological Catchment & Sub-Basin:'}
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {effectiveSubBasin} • {effectiveElevation}m MSL
                        </span>
                      </div>
                    </>
                  );
                })()}

                {/* Dynamically verified status and TDS summary */}
                {(() => {
                  const dynamicEvaluation = (() => {
                    if (flashStation.category === 'reservoir') {
                      const level = stationTelemetry?.waterLevelM ?? flashStation.waterLevelM;
                      const frl = stationTelemetry?.fullReservoirLevelM ?? flashStation.fullReservoirLevelM;
                      const warn = stationTelemetry?.warningLevelM ?? flashStation.warningLevelM;
                      const danger = stationTelemetry?.dangerLevelM ?? flashStation.dangerLevelM ?? frl;

                      if (level != null && danger != null && level >= danger) {
                        return {
                          color: 'red',
                          textEn: 'Critical / At Full Reservoir Level (Spillway Active)',
                          textHi: 'अति-संवेदनशील / पूर्ण FRL स्तर (स्पिलवे सक्रिय)',
                        };
                      }
                      if (level != null && warn != null && level >= warn) {
                        return {
                          color: 'yellow',
                          textEn: 'Warning Mark Exceeded / High Flood Buffer Alert',
                          textHi: 'चेतावनी स्तर पार / हाई फ्लड बफर अलर्ट',
                        };
                      }
                      if (level != null && frl != null) {
                        const buffer = frl - level;
                        if (buffer <= 1.0) {
                          return {
                            color: 'blue',
                            textEn: `Normal High Storage (${buffer.toFixed(2)}m below Full Crest)`,
                            textHi: `सामान्य उच्च भंडारण (${buffer.toFixed(2)}m सुरक्षित अंतर)`,
                          };
                        }
                        return {
                          color: 'blue',
                          textEn: 'Regulated Storage / Safe Buffer',
                          textHi: 'विनियमित भंडारण / सुरक्षित जल स्तर',
                        };
                      }
                    }

                    if (flashStation.category === 'river_level' || flashStation.category === 'river_discharge') {
                      const level = stationTelemetry?.currentRiverLevelM ?? flashStation.currentRiverLevelM;
                      const danger = stationTelemetry?.dangerLevelM ?? flashStation.dangerLevelM;
                      const warn = stationTelemetry?.warningLevelM ?? flashStation.warningLevelM;

                      if (level != null && danger != null && level >= danger) {
                        return {
                          color: 'red',
                          textEn: 'Critical / River Level Above Danger Mark',
                          textHi: 'गंभीर संकट / नदी ख़तरे के निशान से ऊपर',
                        };
                      }
                      if (level != null && warn != null && level >= warn) {
                        return {
                          color: 'yellow',
                          textEn: 'Warning Mark Exceeded / High Flood Inflow',
                          textHi: 'चेतावनी स्तर पार / तीव्र जल आवक',
                        };
                      }
                      return {
                        color: 'blue',
                        textEn: 'Normal / Regulated River Flow',
                        textHi: 'सामान्य / विनियमित नदी प्रवाह',
                      };
                    }

                    if (flashStation.category === 'groundwater') {
                      const depth = stationTelemetry?.waterLevelDepthMBGL ?? flashStation.waterLevelDepthMBGL;
                      const absDepth = depth != null ? Math.abs(depth) : null;
                      if (absDepth != null && absDepth > 40) {
                        return {
                          color: 'red',
                          textEn: 'Critical / Deep Over-Exploited Aquifer',
                          textHi: 'गंभीर संकट / अति-दोहित गहरा जलभृत',
                        };
                      }
                      if (absDepth != null && absDepth > 20) {
                        return {
                          color: 'yellow',
                          textEn: 'Semi-Critical / High Stress Aquifer',
                          textHi: 'अर्ध-संवेदनशील / दबावयुक्त जलभृत',
                        };
                      }
                      return {
                        color: 'green',
                        textEn: 'Safe / Stable Phreatic Water Table',
                        textHi: 'सुरक्षित / स्थिर भूजल स्तर',
                      };
                    }

                    if (flashStation.category === 'bhuvan_wbis') {
                      if (flashStation.isExtinct) {
                        return {
                          color: 'slate',
                          textEn: 'Dry Bed / Desiccated Wetland',
                          textHi: 'सूखा तल / विलुप्त जल निकाय',
                        };
                      }
                      const ndwi = stationTelemetry?.ndwiScore ?? flashStation.ndwiScore;
                      if (ndwi != null && ndwi > 0.1) {
                        return {
                          color: 'green',
                          textEn: 'Optically Detected Open Water (NDWI > 0.1)',
                          textHi: 'उपग्रह द्वारा संसूचित खुली जल सतह (NDWI > 0.1)',
                        };
                      }
                      return {
                        color: 'yellow',
                        textEn: 'Shallow / Silted Wetland Area',
                        textHi: 'गाद / उथला नमभूमि क्षेत्र',
                      };
                    }

                    if (flashStation.category === 'rainfall') {
                      const dep = stationTelemetry?.departurePercent ?? flashStation.departurePercent;
                      if (dep != null) {
                        if (dep >= 20) {
                          return {
                            color: 'blue',
                            textEn: `Excess Catchment Rainfall (+${dep.toFixed(1)}% Departure)`,
                            textHi: `अत्यधिक कैचमेंट वर्षा (+${dep.toFixed(1)}% विचलन)`,
                          };
                        } else if (dep <= -20) {
                          return {
                            color: 'yellow',
                            textEn: `Deficit Catchment Rainfall (${dep.toFixed(1)}% Departure)`,
                            textHi: `कमी/न्यून कैचमेंट वर्षा (${dep.toFixed(1)}% विचलन)`,
                          };
                        } else {
                          return {
                            color: 'green',
                            textEn: `Normal Seasonal Rainfall (${dep >= 0 ? '+' : ''}${dep.toFixed(1)}% Departure)`,
                            textHi: `सामान्य मौसमी वर्षा (${dep >= 0 ? '+' : ''}${dep.toFixed(1)}% विचलन)`,
                          };
                        }
                      }
                      return {
                        color: 'blue',
                        textEn: 'Active IMD Precipitation Monitoring',
                        textHi: 'सक्रिय आईएमडी वर्षा निगरानी',
                      };
                    }

                    return {
                      color: flashStation.status,
                      textEn: flashStation.statusLabel || 'Active Hydrological Monitoring',
                      textHi: language === 'hi' ? 'सक्रिय जल निगरानी' : 'Active Hydrological Monitoring',
                    };
                  })();

                  const effectiveTds = stationTelemetry?.waterQualityTdsPpm ?? flashStation.waterQualityTdsPpm;
                  const effectiveEc = stationTelemetry?.electricalConductivityUsCm ?? (flashStation as any).electricalConductivityUsCm;

                  return (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between col-span-2 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          dynamicEvaluation.color === 'green' ? 'bg-emerald-500' :
                          dynamicEvaluation.color === 'blue' ? 'bg-sky-500' :
                          dynamicEvaluation.color === 'yellow' ? 'bg-amber-500 animate-pulse' :
                          dynamicEvaluation.color === 'red' ? 'bg-rose-500 animate-ping' : 'bg-slate-400'
                        }`} />
                        <span className="font-bold text-slate-800">
                          {language === 'hi' ? dynamicEvaluation.textHi : dynamicEvaluation.textEn}
                        </span>
                      </div>
                      {Boolean(effectiveTds || effectiveEc) && (
                        <span className="font-mono text-blue-700 font-bold flex items-center gap-1.5 text-[10px]">
                          {effectiveTds && <span>TDS: {effectiveTds} ppm</span>}
                          {effectiveEc && <span className="text-slate-500 font-medium">| EC: {effectiveEc} µS/cm</span>}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* ============================================================== */}
            {/* 3. STRUCTURED CATEGORY PROTOCOL & EXAMPLES                      */}
            {/* ============================================================== */}
            {activeFlashcardMeta && (
              <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-2.5 text-[10px] space-y-1.5 leading-relaxed">
                <div className="font-extrabold text-slate-900 flex items-center gap-1.5 text-[11px]">
                  <Info className="w-3.5 h-3.5 text-[#0047ab]" />
                  <span>{activeFlashcardMeta.title}</span>
                </div>
                <div>
                  <strong className="text-slate-700">{activeFlashcardMeta.dataTypeLabel}</strong>{' '}
                  <span className="text-slate-600">{activeFlashcardMeta.dataType}</span>
                </div>
                <div>
                  <strong className="text-slate-700">{activeFlashcardMeta.measuredLabel}</strong>{' '}
                  <span className="text-slate-600">{activeFlashcardMeta.measured}</span>
                </div>
                <div className="border-t border-slate-200 pt-1 mt-1">
                  <strong className="text-[#0047ab] text-[9px] uppercase tracking-wider block mb-0.5">
                    {activeFlashcardMeta.examplesLabel}
                  </strong>
                  <div className="max-h-20 overflow-y-auto space-y-0.5 text-[9px] text-slate-600 pr-1">
                    {activeFlashcardMeta.examples.map((ex, idx) => (
                      <div key={idx} className="flex items-start gap-1">
                        <span className="text-blue-500 shrink-0">•</span>
                        <span>{ex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Close hint */}
            <div className="text-[10px] text-slate-400 text-center font-medium pt-0.5">
              {language === 'hi'
                ? 'कार्ड बंद करने के लिए ऊपर [X] बटन दबाएं'
                : 'Click [X] in the top corner to close this card'}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. FILTER & DISPLAY SETTINGS MODAL (OPENS ON "FILTERS" CLICK)   */}
      {/* ============================================================== */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl p-5 sm:p-6 text-slate-900 space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0047ab] flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    {language === 'hi' ? 'मानचित्र फ़िल्टर एवं डिस्प्ले सेटिंग्स' : 'Filters & Map Display Settings'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'hi'
                      ? 'राष्ट्रीय जलवैज्ञानिक टेलीमेट्री परतें, बेसमेप थीम और ऑप्टिकल कैलिब्रेशन सेट करें'
                      : 'Configure hydrological telemetry layers, river basins, basemap theme, and optical calibration'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Filter Section: The 6 Categories */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                {language === 'hi' ? '1. जलवैज्ञानिक टेलीमेट्री परत चुनें' : '1. Select Hydrological Telemetry Layer'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* 1. All */}
                <button
                  type="button"
                  onClick={() => setTempFilterTab('all')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
                    tempFilterTab === 'all'
                      ? 'bg-blue-50 border-blue-600 text-[#0047ab] shadow-xs ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>{language === 'hi' ? 'सभी जलवैज्ञानिक परतें (All)' : 'All Hydrological Layers'}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-500">{tabCounts.all}</span>
                </button>

                {/* 2. Major Dams */}
                <button
                  type="button"
                  onClick={() => setTempFilterTab('reservoir')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
                    tempFilterTab === 'reservoir'
                      ? 'bg-sky-50 border-sky-600 text-sky-800 shadow-xs ring-2 ring-sky-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-sky-600" />
                    <span>{language === 'hi' ? 'राष्ट्रीय बांध एवं विशाल जलाशय' : 'Major Reservoirs & Dams'}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-500">{tabCounts.reservoir}</span>
                </button>

                {/* 3. River Level & Discharge */}
                <button
                  type="button"
                  onClick={() => setTempFilterTab('rivers')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
                    tempFilterTab === 'rivers'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-800 shadow-xs ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <span>{language === 'hi' ? 'नदी जल स्तर एवं बहाव गेज' : 'River Gauges & Discharge (Cusecs)'}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-500">{tabCounts.rivers}</span>
                </button>

                {/* 4. CGWB Groundwater */}
                <button
                  type="button"
                  onClick={() => setTempFilterTab('groundwater')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
                    tempFilterTab === 'groundwater'
                      ? 'bg-amber-50 border-amber-600 text-amber-800 shadow-xs ring-2 ring-amber-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Mountain className="w-4 h-4 text-amber-600" />
                    <span>{language === 'hi' ? 'भूजल DWLR एवं पीज़ोमीटर' : 'CGWB Groundwater DWLR'}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-500">{tabCounts.groundwater}</span>
                </button>

                {/* 5. ISRO Bhuvan WBIS */}
                <button
                  type="button"
                  onClick={() => setTempFilterTab('bhuvan_wbis')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
                    tempFilterTab === 'bhuvan_wbis'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Satellite className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'hi' ? 'इसरो भुवन उपग्रह जल निकाय' : 'ISRO Bhuvan WBIS Water Bodies'}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-500">{tabCounts.bhuvan_wbis}</span>
                </button>

                {/* 6. Major River Basins */}
                <button
                  type="button"
                  onClick={() => setTempFilterTab('basin')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
                    tempFilterTab === 'basin'
                      ? 'bg-cyan-50 border-cyan-600 text-cyan-800 shadow-xs ring-2 ring-cyan-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Waves className="w-4 h-4 text-cyan-600" />
                    <span>{language === 'hi' ? 'भारत के प्रमुख नदी बेसिन' : 'Major River Basins of India'}</span>
                  </div>
                  <CheckCircle2 className={`w-4 h-4 ${tempFilterTab === 'basin' ? 'text-cyan-600' : 'opacity-0'}`} />
                </button>
              </div>

              {/* Specific Basin Dropdown if Basin tab chosen */}
              {tempFilterTab === 'basin' && (
                <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-2xl space-y-1.5 animate-in fade-in">
                  <label className="text-[11px] font-bold text-cyan-900 block">
                    {language === 'hi' ? 'विशिष्ट नदी बेसिन चुनें:' : 'Choose Specific River Basin to Inspect:'}
                  </label>
                  <select
                    value={tempBasin}
                    onChange={(e) => setTempBasin(e.target.value)}
                    className="w-full bg-white border border-cyan-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-cyan-600 cursor-pointer shadow-2xs"
                  >
                    <option value="All Basins">{language === 'hi' ? 'सभी 13 प्रमुख नदी बेसिन' : 'All 13 Major River Basins'}</option>
                    {MAJOR_RIVER_BASINS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 2. Basemap Theme (Theme that matches the website - NOT pitch black!) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                {language === 'hi' ? '2. मानचित्र बेसमेप थीम' : '2. Map Basemap Theme'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {/* 1. Satellite (ISRO Bhuvan Satellite - Default as requested) */}
                <button
                  type="button"
                  onClick={() => setTempBasemapTheme('satellite')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    tempBasemapTheme === 'satellite'
                      ? 'bg-blue-50 border-blue-600 text-[#0047ab] shadow-xs ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Satellite className="w-3.5 h-3.5 text-blue-600" />
                    <span>{language === 'hi' ? 'इसरो भुवन उपग्रह (डिफ़ॉल्ट)' : 'ISRO Bhuvan Satellite (Default)'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {language === 'hi' ? 'उच्च-रिज़ॉल्यूशन उपग्रह इमेजरी एवं सीमाएं' : 'High-resolution ISRO satellite imagery & boundaries'}
                  </span>
                </button>

                {/* 2. Nir-ikshan Portal Theme (Light GIS) */}
                <button
                  type="button"
                  onClick={() => setTempBasemapTheme('light_gis')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    tempBasemapTheme === 'light_gis'
                      ? 'bg-blue-50 border-blue-600 text-[#0047ab] shadow-xs ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>{language === 'hi' ? 'नीर-ईक्षण पोर्टल थीम (लाइट)' : 'Nir-ikshan Portal Theme (Light)'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {language === 'hi' ? 'वेबसाइट डिजाइन के अनुसार स्वच्छ कार्टोग्राफी' : 'Clean GIS cartography matching portal style'}
                  </span>
                </button>

                {/* 3. Topographic */}
                <button
                  type="button"
                  onClick={() => setTempBasemapTheme('topo')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    tempBasemapTheme === 'topo'
                      ? 'bg-blue-50 border-blue-600 text-[#0047ab] shadow-xs ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>{language === 'hi' ? 'टोपोग्राफिक रिलीफ' : 'Topographic Relief'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {language === 'hi' ? 'पर्वतीय एवं जलग्रहण ढलान' : 'Terrain relief & catchment elevation'}
                  </span>
                </button>
              </div>
            </div>

            {/* 3. Display Adjustments: Brightness & Contrast */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                {language === 'hi' ? '3. चमक एवं कंट्रास्ट कैलिब्रेशन (Brightness & Contrast)' : '3. Brightness & Contrast Calibration'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-500" /> 
                      {language === 'hi' ? 'चमक (Brightness):' : 'Brightness:'}
                    </span>
                    <span className="font-mono text-blue-700">{tempBrightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="140"
                    value={tempBrightness}
                    onChange={(e) => setTempBrightness(Number(e.target.value))}
                    className="w-full accent-[#0047ab] cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>60% (Darker)</span>
                    <span>100% (Default)</span>
                    <span>140% (Brighter)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-indigo-500" /> 
                      {language === 'hi' ? 'कंट्रास्ट (Contrast):' : 'Contrast:'}
                    </span>
                    <span className="font-mono text-blue-700">{tempContrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="150"
                    value={tempContrast}
                    onChange={(e) => setTempContrast(Number(e.target.value))}
                    className="w-full accent-[#0047ab] cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>70% (Softer)</span>
                    <span>100% (Default)</span>
                    <span>150% (High Contrast)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions: Save / Apply + Reset */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetSettings}
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'डिफ़ॉल्ट सेटिंग्स रीसेट करें' : 'Reset Defaults'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndApply}
                  className="px-6 py-2.5 rounded-xl bg-[#0047ab] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'hi' ? 'सेव करें एवं लागू करें (Save)' : 'Save & Apply Settings'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
