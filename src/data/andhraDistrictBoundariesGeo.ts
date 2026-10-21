/**
 * Authoritative Boundary Polygons and Geospatial Coordinates
 * for all 26 Districts of Andhra Pradesh (Reorganized 2022-2026 Administrative Structure).
 * 
 * Used for instant GIS boundary highlighting, boundary selection, and zoom-fitting
 * in the Nir-ikshan ISRO Bhuvan Satellite Water Surveillance Grid.
 */

export interface APDistrictBoundary {
  id: string;
  name: string;
  teluguName: string;
  hindiName: string;
  headquarter: string;
  region: 'North Coastal' | 'Coastal Andhra' | 'Rayalaseema';
  areaSqKm: number;
  center: [number, number]; // [lat, lng]
  bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
  polygon: [number, number][]; // [lat, lng][]
}

export const AP_26_DISTRICT_BOUNDARIES: Record<string, APDistrictBoundary> = {
  // 1. Srikakulam
  'Srikakulam': {
    id: 'srikakulam',
    name: 'Srikakulam',
    teluguName: 'శ్రీకాకుళం',
    hindiName: 'श्रीकाकुलम',
    headquarter: 'Srikakulam',
    region: 'North Coastal',
    areaSqKm: 5837,
    center: [18.2969, 83.8967],
    bounds: [[18.20, 83.60], [19.12, 84.78]],
    polygon: [
      [19.12, 84.78], [19.00, 84.60], [18.85, 84.45], [18.60, 84.25],
      [18.35, 84.05], [18.25, 83.90], [18.20, 83.75], [18.40, 83.65],
      [18.65, 83.70], [18.85, 83.80], [19.05, 84.10], [19.15, 84.45],
      [19.12, 84.78]
    ]
  },

  // 2. Parvathipuram Manyam
  'Parvathipuram Manyam': {
    id: 'parvathipuram-manyam',
    name: 'Parvathipuram Manyam',
    teluguName: 'పార్వతీపురం మన్యం',
    hindiName: 'पार्वतीपुरम मान्यम',
    headquarter: 'Parvathipuram',
    region: 'North Coastal',
    areaSqKm: 3659,
    center: [18.7733, 83.4282],
    bounds: [[18.45, 83.10], [19.10, 83.75]],
    polygon: [
      [19.10, 83.55], [19.00, 83.75], [18.75, 83.65], [18.55, 83.50],
      [18.45, 83.35], [18.50, 83.15], [18.75, 83.10], [18.95, 83.25],
      [19.10, 83.55]
    ]
  },

  // 3. Vizianagaram
  'Vizianagaram': {
    id: 'vizianagaram',
    name: 'Vizianagaram',
    teluguName: 'విజయనగరం',
    hindiName: 'विजयनगरम',
    headquarter: 'Vizianagaram',
    region: 'North Coastal',
    areaSqKm: 4122,
    center: [18.1124, 83.3976],
    bounds: [[17.90, 83.10], [18.45, 83.75]],
    polygon: [
      [18.45, 83.50], [18.35, 83.75], [18.15, 83.70], [17.98, 83.55],
      [17.90, 83.30], [18.05, 83.10], [18.25, 83.15], [18.45, 83.35],
      [18.45, 83.50]
    ]
  },

  // 4. Visakhapatnam
  'Visakhapatnam': {
    id: 'visakhapatnam',
    name: 'Visakhapatnam',
    teluguName: 'విశాఖపట్నం',
    hindiName: 'विशाखापट्टनम',
    headquarter: 'Visakhapatnam',
    region: 'North Coastal',
    areaSqKm: 1048,
    center: [17.6868, 83.2185],
    bounds: [[17.55, 83.05], [17.95, 83.45]],
    polygon: [
      [17.95, 83.40], [17.85, 83.45], [17.70, 83.32], [17.58, 83.20],
      [17.55, 83.10], [17.70, 83.05], [17.85, 83.15], [17.95, 83.30],
      [17.95, 83.40]
    ]
  },

  // 5. Alluri Sitharama Raju
  'Alluri Sitharama Raju': {
    id: 'alluri-sitharama-raju',
    name: 'Alluri Sitharama Raju',
    teluguName: 'అల్లూరి సీతారామరాజు',
    hindiName: 'अल्लूरी सीताराम राजू',
    headquarter: 'Paderu',
    region: 'North Coastal',
    areaSqKm: 12251,
    center: [17.8500, 81.8500],
    bounds: [[17.20, 81.10], [18.50, 82.85]],
    polygon: [
      [18.50, 82.65], [18.25, 82.85], [17.90, 82.60], [17.65, 82.35],
      [17.40, 81.95], [17.20, 81.40], [17.35, 81.10], [17.70, 81.25],
      [18.05, 81.65], [18.35, 82.15], [18.50, 82.65]
    ]
  },

  // 6. Anakapalli
  'Anakapalli': {
    id: 'anakapalli',
    name: 'Anakapalli',
    teluguName: 'అనకాపల్లి',
    hindiName: 'अनाकापल्ली',
    headquarter: 'Anakapalli',
    region: 'North Coastal',
    areaSqKm: 4292,
    center: [17.6897, 82.9983],
    bounds: [[17.35, 82.60], [17.90, 83.20]],
    polygon: [
      [17.90, 83.15], [17.75, 83.20], [17.50, 83.00], [17.35, 82.80],
      [17.40, 82.60], [17.65, 82.65], [17.85, 82.85], [17.90, 83.15]
    ]
  },

  // 7. Kakinada
  'Kakinada': {
    id: 'kakinada',
    name: 'Kakinada',
    teluguName: 'కాకినాడ',
    hindiName: 'काकीनाडा',
    headquarter: 'Kakinada',
    region: 'Coastal Andhra',
    areaSqKm: 3019,
    center: [16.9891, 82.2475],
    bounds: [[16.70, 82.00], [17.40, 82.55]],
    polygon: [
      [17.40, 82.45], [17.20, 82.55], [16.95, 82.30], [16.75, 82.25],
      [16.70, 82.05], [17.00, 82.00], [17.25, 82.15], [17.40, 82.45]
    ]
  },

  // 8. East Godavari
  'East Godavari': {
    id: 'east-godavari',
    name: 'East Godavari',
    teluguName: 'తూర్పు గోదావరి',
    hindiName: 'पूर्वी गोदावरी',
    headquarter: 'Rajahmundry',
    region: 'Coastal Andhra',
    areaSqKm: 2561,
    center: [17.0005, 81.7800],
    bounds: [[16.75, 81.55], [17.30, 82.05]],
    polygon: [
      [17.30, 81.95], [17.15, 82.05], [16.90, 81.90], [16.75, 81.75],
      [16.85, 81.55], [17.10, 81.65], [17.30, 81.95]
    ]
  },

  // 9. Dr. B.R. Ambedkar Konaseema
  'Dr. B.R. Ambedkar Konaseema': {
    id: 'dr-br-ambedkar-konaseema',
    name: 'Dr. B.R. Ambedkar Konaseema',
    teluguName: 'డా. బి.ఆర్. అంబేద్కర్ కోనసీమ',
    hindiName: 'डॉ. बी.आर. अंबेडकर कोनासीमा',
    headquarter: 'Amalapuram',
    region: 'Coastal Andhra',
    areaSqKm: 2083,
    center: [16.5700, 81.9800],
    bounds: [[16.30, 81.70], [16.85, 82.25]],
    polygon: [
      [16.85, 82.10], [16.70, 82.25], [16.45, 82.05], [16.30, 81.85],
      [16.45, 81.70], [16.65, 81.80], [16.85, 82.10]
    ]
  },

  // 10. Eluru
  'Eluru': {
    id: 'eluru',
    name: 'Eluru',
    teluguName: 'ఏలూరు',
    hindiName: 'एलुरु',
    headquarter: 'Eluru',
    region: 'Coastal Andhra',
    areaSqKm: 6579,
    center: [16.7107, 81.0952],
    bounds: [[16.45, 80.80], [17.25, 81.45]],
    polygon: [
      [17.25, 81.35], [17.05, 81.45], [16.80, 81.25], [16.55, 81.15],
      [16.45, 80.90], [16.70, 80.80], [17.00, 80.95], [17.25, 81.35]
    ]
  },

  // 11. West Godavari
  'West Godavari': {
    id: 'west-godavari',
    name: 'West Godavari',
    teluguName: 'పశ్చిమ గోదావరి',
    hindiName: 'पश्चिमी गोदावरी',
    headquarter: 'Bhimavaram',
    region: 'Coastal Andhra',
    areaSqKm: 2178,
    center: [16.5400, 81.5200],
    bounds: [[16.30, 81.30], [16.80, 81.75]],
    polygon: [
      [16.80, 81.65], [16.65, 81.75], [16.40, 81.60], [16.30, 81.40],
      [16.50, 81.30], [16.75, 81.45], [16.80, 81.65]
    ]
  },

  // 12. NTR
  'NTR': {
    id: 'ntr',
    name: 'NTR',
    teluguName: 'ఎన్టీఆర్',
    hindiName: 'एनटीआर',
    headquarter: 'Vijayawada',
    region: 'Coastal Andhra',
    areaSqKm: 3316,
    center: [16.5062, 80.6480],
    bounds: [[16.35, 80.35], [17.10, 80.85]],
    polygon: [
      [17.10, 80.65], [16.90, 80.85], [16.65, 80.75], [16.45, 80.55],
      [16.35, 80.35], [16.60, 80.40], [16.85, 80.45], [17.10, 80.65]
    ]
  },

  // 13. Krishna
  'Krishna': {
    id: 'krishna',
    name: 'Krishna',
    teluguName: 'కృష్ణా',
    hindiName: 'कृष्णा',
    headquarter: 'Machilipatnam',
    region: 'Coastal Andhra',
    areaSqKm: 3775,
    center: [16.1800, 81.1300],
    bounds: [[15.85, 80.85], [16.50, 81.40]],
    polygon: [
      [16.50, 81.25], [16.35, 81.40], [16.05, 81.20], [15.85, 81.00],
      [15.95, 80.85], [16.25, 80.95], [16.50, 81.25]
    ]
  },

  // 14. Palnadu
  'Palnadu': {
    id: 'palnadu',
    name: 'Palnadu',
    teluguName: 'పల్నాడు',
    hindiName: 'पलनाडु',
    headquarter: 'Narasaraopet',
    region: 'Coastal Andhra',
    areaSqKm: 7298,
    center: [16.2000, 79.9000],
    bounds: [[15.85, 79.40], [16.65, 80.35]],
    polygon: [
      [16.65, 79.80], [16.45, 80.35], [16.15, 80.20], [15.85, 79.90],
      [15.90, 79.45], [16.25, 79.40], [16.55, 79.60], [16.65, 79.80]
    ]
  },

  // 15. Guntur
  'Guntur': {
    id: 'guntur',
    name: 'Guntur',
    teluguName: 'గుంటూరు',
    hindiName: 'गुंटूर',
    headquarter: 'Guntur',
    region: 'Coastal Andhra',
    areaSqKm: 2443,
    center: [16.3067, 80.4365],
    bounds: [[16.10, 80.25], [16.55, 80.65]],
    polygon: [
      [16.55, 80.55], [16.40, 80.65], [16.15, 80.50], [16.10, 80.30],
      [16.30, 80.25], [16.50, 80.35], [16.55, 80.55]
    ]
  },

  // 16. Bapatla
  'Bapatla': {
    id: 'bapatla',
    name: 'Bapatla',
    teluguName: 'బాపట్ల',
    hindiName: 'बापटला',
    headquarter: 'Bapatla',
    region: 'Coastal Andhra',
    areaSqKm: 3829,
    center: [15.9000, 80.4600],
    bounds: [[15.65, 80.15], [16.15, 80.75]],
    polygon: [
      [16.15, 80.65], [16.00, 80.75], [15.75, 80.55], [15.65, 80.30],
      [15.80, 80.15], [16.05, 80.35], [16.15, 80.65]
    ]
  },

  // 17. Prakasam
  'Prakasam': {
    id: 'prakasam',
    name: 'Prakasam',
    teluguName: 'ప్రకాశం',
    hindiName: 'प्रकाशम',
    headquarter: 'Ongole',
    region: 'Coastal Andhra',
    areaSqKm: 14322,
    center: [15.5057, 80.0499],
    bounds: [[15.05, 78.95], [16.00, 80.30]],
    polygon: [
      [16.00, 79.80], [15.75, 80.30], [15.40, 80.15], [15.10, 80.05],
      [15.05, 79.40], [15.35, 78.95], [15.70, 79.30], [16.00, 79.80]
    ]
  },

  // 18. Sri Potti Sriramulu Nellore
  'Sri Potti Sriramulu Nellore': {
    id: 'sri-potti-sriramulu-nellore',
    name: 'Sri Potti Sriramulu Nellore',
    teluguName: 'శ్రీ పొట్టి శ్రీరాములు నెల్లూరు',
    hindiName: 'श्री पोट्टी श्रीरामुलु नेल्लोर',
    headquarter: 'Nellore',
    region: 'Coastal Andhra',
    areaSqKm: 10441,
    center: [14.4426, 79.9865],
    bounds: [[13.85, 79.45], [15.10, 80.20]],
    polygon: [
      [15.10, 80.05], [14.75, 80.15], [14.35, 80.10], [13.90, 80.20],
      [13.85, 79.75], [14.20, 79.45], [14.65, 79.55], [15.10, 80.05]
    ]
  },

  // 19. Kurnool
  'Kurnool': {
    id: 'kurnool',
    name: 'Kurnool',
    teluguName: 'కర్నూలు',
    hindiName: 'कर्नूल',
    headquarter: 'Kurnool',
    region: 'Rayalaseema',
    areaSqKm: 7980,
    center: [15.8281, 78.0373],
    bounds: [[15.20, 76.90], [16.05, 78.35]],
    polygon: [
      [16.05, 78.10], [15.85, 78.35], [15.50, 78.15], [15.20, 77.60],
      [15.25, 77.05], [15.60, 76.90], [15.85, 77.40], [16.05, 78.10]
    ]
  },

  // 20. Nandyal
  'Nandyal': {
    id: 'nandyal',
    name: 'Nandyal',
    teluguName: 'నంద్యాల',
    hindiName: 'नंद्याल',
    headquarter: 'Nandyal',
    region: 'Rayalaseema',
    areaSqKm: 9682,
    center: [15.4800, 78.4800],
    bounds: [[14.90, 78.10], [16.15, 79.05]],
    polygon: [
      [16.15, 78.90], [15.95, 79.05], [15.55, 78.85], [15.05, 78.60],
      [14.90, 78.20], [15.30, 78.10], [15.75, 78.35], [16.15, 78.90]
    ]
  },

  // 21. Anantapuramu
  'Anantapuramu': {
    id: 'anantapuramu',
    name: 'Anantapuramu',
    teluguName: 'అనంతపురము',
    hindiName: 'अनंतपुर',
    headquarter: 'Anantapur',
    region: 'Rayalaseema',
    areaSqKm: 10205,
    center: [14.6819, 77.6006],
    bounds: [[14.25, 76.85], [15.25, 77.95]],
    polygon: [
      [15.25, 77.50], [15.05, 77.95], [14.65, 77.80], [14.30, 77.40],
      [14.25, 76.90], [14.60, 76.85], [14.95, 77.10], [15.25, 77.50]
    ]
  },

  // 22. Sri Sathya Sai
  'Sri Sathya Sai': {
    id: 'sri-sathya-sai',
    name: 'Sri Sathya Sai',
    teluguName: 'శ్రీ సత్యసాయి',
    hindiName: 'श्री सत्य साई',
    headquarter: 'Puttaparthi',
    region: 'Rayalaseema',
    areaSqKm: 7771,
    center: [14.1600, 77.8100],
    bounds: [[13.70, 77.10], [14.50, 78.15]],
    polygon: [
      [14.50, 77.90], [14.30, 78.15], [13.95, 78.00], [13.70, 77.55],
      [13.80, 77.15], [14.15, 77.20], [14.40, 77.55], [14.50, 77.90]
    ]
  },

  // 23. YSR Kadapa
  'YSR Kadapa': {
    id: 'ysr-kadapa',
    name: 'YSR Kadapa',
    teluguName: 'వైఎస్ఆర్ కడప',
    hindiName: 'वाईएसआर कडप्पा',
    headquarter: 'Kadapa',
    region: 'Rayalaseema',
    areaSqKm: 11228,
    center: [14.4673, 78.8242],
    bounds: [[14.05, 78.15], [15.00, 79.35]],
    polygon: [
      [15.00, 78.90], [14.75, 79.35], [14.35, 79.15], [14.05, 78.75],
      [14.20, 78.20], [14.60, 78.15], [14.85, 78.50], [15.00, 78.90]
    ]
  },

  // 24. Annamayya
  'Annamayya': {
    id: 'annamayya',
    name: 'Annamayya',
    teluguName: 'అన్నమయ్య',
    hindiName: 'अन्नमय्या',
    headquarter: 'Rayachoti',
    region: 'Rayalaseema',
    areaSqKm: 7954,
    center: [13.9800, 78.7500],
    bounds: [[13.45, 78.30], [14.40, 79.30]],
    polygon: [
      [14.40, 78.95], [14.20, 79.30], [13.75, 79.10], [13.45, 78.70],
      [13.55, 78.35], [13.95, 78.45], [14.25, 78.65], [14.40, 78.95]
    ]
  },

  // 25. Chittoor
  'Chittoor': {
    id: 'chittoor',
    name: 'Chittoor',
    teluguName: 'చిత్తూరు',
    hindiName: 'चित्तूर',
    headquarter: 'Chittoor',
    region: 'Rayalaseema',
    areaSqKm: 6855,
    center: [13.2172, 79.1003],
    bounds: [[12.80, 78.40], [13.60, 79.40]],
    polygon: [
      [13.60, 79.20], [13.40, 79.40], [13.10, 79.25], [12.80, 78.95],
      [12.80, 78.45], [13.15, 78.50], [13.45, 78.85], [13.60, 79.20]
    ]
  },

  // 26. Tirupati
  'Tirupati': {
    id: 'tirupati',
    name: 'Tirupati',
    teluguName: 'తిరుపతి',
    hindiName: 'तिरुपति',
    headquarter: 'Tirupati',
    region: 'Rayalaseema',
    areaSqKm: 8231,
    center: [13.6288, 79.4192],
    bounds: [[13.25, 79.20], [14.10, 80.25]],
    polygon: [
      [14.10, 79.85], [13.85, 80.25], [13.45, 80.15], [13.25, 79.80],
      [13.35, 79.35], [13.70, 79.20], [13.95, 79.50], [14.10, 79.85]
    ]
  }
};

/**
 * Normalizes input district string to match AP_26_DISTRICT_BOUNDARIES key
 */
export function findAPDistrictBoundary(districtInput: string): APDistrictBoundary | null {
  if (!districtInput || districtInput === 'all') return null;
  const clean = districtInput.toLowerCase().trim().replace(' district', '');

  for (const [key, b] of Object.entries(AP_26_DISTRICT_BOUNDARIES)) {
    if (key.toLowerCase() === clean) return b;
    if (b.id.toLowerCase() === clean) return b;
    if (b.name.toLowerCase().includes(clean) || clean.includes(b.name.toLowerCase())) return b;
    if (b.teluguName.includes(clean)) return b;
    if (b.hindiName.includes(clean)) return b;
  }
  return null;
}
