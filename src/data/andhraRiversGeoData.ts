/**
 * Authoritative River Vector Geometry for Andhra Pradesh Hydrological Surveillance
 * Traces the real-world flow lines of all major rivers, tributaries, and drainage systems in AP.
 */

export interface RiverGeometry {
  id: string;
  name: string;
  basin: string;
  color: string;
  weight: number;
  coordinates: [number, number][]; // [lat, lng]
}

export const AP_RIVER_VECTORS: RiverGeometry[] = [
  // 1. GODAVARI MAINSTREAM & DELTA
  {
    id: 'godavari-main',
    name: 'Godavari River (Main Course)',
    basin: 'Godavari Basin',
    color: '#0284c7', // Sky-blue / Waterway
    weight: 4.5,
    coordinates: [
      [17.7420, 81.3980], // Chinturu (Sabari)
      [17.5855, 81.2585], // Kunavaram Sangam
      [17.4820, 81.4250], // Papi Hills Gorge (Koida)
      [17.3850, 81.5650], // Devipatnam
      [17.2535, 81.6525], // Polavaram Dam
      [17.1500, 81.7100], // Pattiseema
      [17.0050, 81.7720], // Rajahmundry Rail Bridge
      [16.9425, 81.7765], // Dowleswaram Barrage
    ],
  },
  {
    id: 'gautami-godavari',
    name: 'Gowthami Godavari Distributary',
    basin: 'Godavari Basin',
    color: '#0284c7',
    weight: 3.8,
    coordinates: [
      [16.9425, 81.7765], // Dowleswaram
      [16.8320, 81.7820], // Atreyapuram
      [16.7450, 81.8450], // Jonnada-Ravulapalem Bridge
      [16.6500, 82.0200], // Kotipalli
      [16.5800, 82.1500], // Yanam
      [16.7100, 82.2600], // Bay of Bengal Outfall (Coringa)
    ],
  },
  {
    id: 'vasishta-godavari',
    name: 'Vasishta Godavari Distributary',
    basin: 'Godavari Basin',
    color: '#0284c7',
    weight: 3.8,
    coordinates: [
      [16.9425, 81.7765], // Dowleswaram
      [16.8200, 81.7600], // Alamuru
      [16.7150, 81.8250], // Eethakota - Siddhantham Bridge
      [16.5250, 81.9120], // P. Gannavaram Aqueduct
      [16.4850, 81.7920], // Chinchinada NH216 Bridge
      [16.3200, 81.7200], // Antarvedi / Bay of Bengal Estuary
    ],
  },
  {
    id: 'sileru-river',
    name: 'Sileru River',
    basin: 'Godavari Basin',
    color: '#38bdf8',
    weight: 3.0,
    coordinates: [
      [18.2500, 82.1500], // Upper Sileru
      [18.0620, 82.0480], // Guntawada Reservoir
      [17.8800, 82.0500], // Donkarai Reservoir
      [17.7500, 81.8500], // Lower Sileru (Mothugudem)
      [17.7420, 81.3980], // Sabari River Confluence
    ],
  },
  {
    id: 'sabari-river',
    name: 'Sabari River',
    basin: 'Godavari Basin',
    color: '#38bdf8',
    weight: 3.2,
    coordinates: [
      [18.1500, 81.5200], // Sukma border
      [17.7420, 81.3980], // Chinturu
      [17.5855, 81.2585], // Kunavaram Sangam (Confluence with Godavari)
    ],
  },

  // 2. KRISHNA MAINSTREAM & DELTA
  {
    id: 'krishna-main',
    name: 'Krishna River (Main Course)',
    basin: 'Krishna Basin',
    color: '#0369a1',
    weight: 4.8,
    coordinates: [
      [16.0880, 78.8980], // Srisailam Dam
      [16.2500, 79.1500], // Nagarjuna Sagar Reach
      [16.5200, 79.3100], // Nagarjuna Sagar Dam
      [16.6500, 79.6500], // Wadapally / Miryalaguda border
      [16.7580, 80.0620], // Pulichintala Dam (Dr. KLRS)
      [16.6850, 80.2150], // Keesara Munneru Confluence
      [16.5950, 80.4500], // Amaravati Capital Waterfront
      [16.5085, 80.6055], // Prakasam Barrage (Vijayawada)
      [16.2950, 80.8200], // Kolluru
      [16.0250, 80.9180], // Avanigadda Bridge
      [15.7800, 80.9500], // Hamsaladeevi / Bay of Bengal Confluence
    ],
  },
  {
    id: 'tungabhadra-river',
    name: 'Tungabhadra River',
    basin: 'Krishna Basin',
    color: '#0284c7',
    weight: 4.0,
    coordinates: [
      [15.7450, 77.0150], // Melaganur
      [15.8200, 77.2200], // Madhavaram
      [15.9350, 77.4250], // Mantralayam
      [15.8810, 77.8200], // Sunkesula Barrage
      [15.8320, 78.0450], // Kurnool Town Bridge
      [15.8950, 78.0250], // Bawapuram
      [15.9800, 78.2200], // Sangameswaram Confluence (Krishna River)
    ],
  },
  {
    id: 'handri-river',
    name: 'Handri River',
    basin: 'Krishna Basin',
    color: '#38bdf8',
    weight: 3.0,
    coordinates: [
      [15.4150, 77.5250], // Pathikonda
      [15.5450, 77.8250], // Krishnagiri
      [15.6850, 77.6250], // Gajuladinne Dam
      [15.6850, 77.7850], // Kodumuru
      [15.8120, 78.0450], // Bastipadu
      [15.8320, 78.0450], // Kurnool Tungabhadra Confluence
    ],
  },
  {
    id: 'munneru-river',
    name: 'Munneru River',
    basin: 'Krishna Basin',
    color: '#0284c7',
    weight: 3.2,
    coordinates: [
      [17.1500, 80.1200], // Khammam/AP border
      [16.9450, 80.3120], // Polampalli Anicut
      [16.8920, 80.3250], // Khabhampadu / Koduru
      [16.7850, 80.2450], // Kodavakallu
      [16.6850, 80.2150], // Keesara CWC Bridge (Krishna Confluence)
    ],
  },
  {
    id: 'paleru-river',
    name: 'Paleru River',
    basin: 'Krishna Basin',
    color: '#38bdf8',
    weight: 3.0,
    coordinates: [
      [17.2000, 79.9800], // Palair Reservoir
      [16.9450, 80.1450], // Budawada
      [16.8850, 80.0950], // Thakellapadu AWLR
      [16.7200, 80.1200], // Jaggayyapeta reach
      [16.6850, 80.1500], // Confluence with Krishna River
    ],
  },

  // 3. PENNAR / PENNA BASIN & TRIBUTARIES
  {
    id: 'pennar-main',
    name: 'Pennar River (Main Course)',
    basin: 'Pennar Basin',
    color: '#0284c7',
    weight: 4.5,
    coordinates: [
      [13.7950, 77.4950], // Kumudvathi / Hindupur
      [14.2850, 77.2450], // Sasanakota
      [14.3200, 77.2200], // Upper Pennar (Perur Dam)
      [14.4150, 77.3250], // Pendekallu
      [14.7850, 77.2150], // Kalvapalli
      [14.8620, 77.3420], // PABR Dam
      [14.8650, 77.4150], // Mid Pennar Reservoir (MPR)
      [14.9450, 77.5850], // Pamidi Bridge (NH44)
      [14.9141, 78.0014], // Tadipatri CWC Station
      [14.8520, 78.3240], // Mylavaram Reservoir Dam
      [14.8200, 78.4800], // Gandikota Gorge & Reservoir
      [14.5450, 78.7950], // Chennur near Kadapa
      [14.4450, 78.9650], // Sidhout Bridge
      [14.5020, 79.3050], // Somasila Dam Reservoir
      [14.5850, 79.7450], // Sangam Barrage
      [14.4750, 79.9150], // Depuru Boggeru Confluence
      [14.4550, 79.9750], // Nellore Anicut & CWC Bridge
      [14.5800, 80.1500], // Utukuru / Bay of Bengal Estuary
    ],
  },
  {
    id: 'chitravathi-river',
    name: 'Chitravathi River',
    basin: 'Pennar Basin',
    color: '#38bdf8',
    weight: 3.2,
    coordinates: [
      [14.1500, 77.6200], // Gollapalli Reservoir
      [14.3550, 77.8250], // Maddileru / Nagireddypalli
      [14.3950, 77.9450], // Gaddamvaripalli SR-III
      [14.4550, 78.0250], // Dampetla
      [14.5200, 78.1200], // Chitravathi Balancing Reservoir (CBR Dam)
      [14.5450, 78.0950], // Singavaram
      [14.5850, 78.0650], // Goddumarri Anicut
      [14.8200, 78.3000], // Confluence with Pennar River (Gandikota)
    ],
  },
  {
    id: 'papagni-river',
    name: 'Papagni River',
    basin: 'Pennar Basin',
    color: '#38bdf8',
    weight: 3.2,
    coordinates: [
      [13.6850, 78.6850], // T. Sadum
      [14.0450, 78.4750], // Veligallu Reservoir Dam
      [14.2500, 78.5500], // Rayachoti Reach
      [14.4150, 78.5450], // Nandimandalam
      [14.4450, 78.4850], // Animela Sangam
      [14.5850, 78.6750], // Kamalapuram CWC Bridge
      [14.5450, 78.7950], // Confluence with Pennar River at Chennur
    ],
  },
  {
    id: 'kunderu-river',
    name: 'Kunderu River (Kundu)',
    basin: 'Pennar Basin',
    color: '#38bdf8',
    weight: 3.2,
    coordinates: [
      [15.4850, 78.4850], // Nandyal Town
      [15.2850, 78.3450], // NTR TGP Subsidiary feeder
      [15.1000, 78.5500], // Koilkuntla reach
      [14.7850, 78.6820], // Alladupalli CWC Station
      [14.7150, 78.5850], // Chapad
      [14.5450, 78.7950], // Confluence with Pennar River
    ],
  },
  {
    id: 'cheyyeru-river',
    name: 'Cheyyeru / Bahuda River',
    basin: 'Pennar Basin',
    color: '#38bdf8',
    weight: 3.0,
    coordinates: [
      [13.7120, 78.4850], // Bahuda Dam
      [13.6750, 78.5450], // Mahal
      [14.1250, 79.0450], // Pincha Project Dam
      [14.1650, 79.0650], // Bodumalluvaripalle
      [14.2150, 79.0850], // Annamayya Project Dam
      [14.2550, 79.1150], // Gundluru
      [14.2650, 79.1250], // Nandalur CWC Bridge
      [14.4450, 78.9650], // Confluence with Pennar River at Sidhout
    ],
  },
  {
    id: 'sagileru-river',
    name: 'Sagileru River',
    basin: 'Pennar Basin',
    color: '#38bdf8',
    weight: 3.0,
    coordinates: [
      [15.2850, 79.0150], // Upper Sagileru Reservoir Dam
      [15.1120, 78.9520], // Kalasapadu CWC Station
      [14.9850, 78.9850], // Lower Sagileru Project Dam
      [14.7450, 79.0620], // Badvel Tank
      [14.6250, 79.1150], // Nandipalli Bridge
      [14.5020, 79.3050], // Confluence with Pennar River (Somasila Dam pool)
    ],
  },

  // 4. NORTH COASTAL RIVERS (Vamsadhara, Nagavali, Champavathi, Gosthani)
  {
    id: 'vamsadhara-river',
    name: 'Vamsadhara River',
    basin: 'East Flowing Rivers between Mahanadi and Pennar',
    color: '#0284c7',
    weight: 4.0,
    coordinates: [
      [18.9500, 83.8200], // Odisha / AP border Gunupur
      [18.7850, 83.8950], // Nivagam AWLR
      [18.6620, 83.9650], // Heeramandalam Reservoir
      [18.6650, 83.9850], // Gotta Barrage
      [18.5250, 84.0350], // Madapam Bridge
      [18.3200, 84.1400], // Kalingapatnam / Bay of Bengal Estuary
    ],
  },
  {
    id: 'nagavali-river',
    name: 'Nagavali River',
    basin: 'East Flowing Rivers between Mahanadi and Pennar',
    color: '#0284c7',
    weight: 4.0,
    coordinates: [
      [18.9800, 83.4200], // Rayagada / AP border
      [18.8650, 83.4650], // Sankhili Bridge
      [18.8250, 83.4850], // Janjhavati Confluence (Komarada)
      [18.7820, 83.4980], // Thotapalli Barrage
      [18.6850, 83.6150], // Veeragattam Vottigedda confluence
      [18.5850, 83.6150], // Madduvalasa Suvarnamukhi confluence
      [18.4850, 83.8250], // Narayanapuram Anicut
      [18.2980, 83.8950], // Srikakulam Town CWC Bridge
      [18.2200, 83.9800], // Mofazbandar / Bay of Bengal Outfall
    ],
  },
  {
    id: 'champavathi-river',
    name: 'Champavathi River',
    basin: 'East Flowing Rivers between Mahanadi and Pennar',
    color: '#38bdf8',
    weight: 3.0,
    coordinates: [
      [18.3500, 83.1800], // Andra Reservoir Dam
      [18.2750, 83.3350], // Lingalavalasa
      [18.2520, 83.3550], // Aguru
      [18.1650, 83.4450], // Nellimarla Bridge
      [18.0600, 83.5500], // Bay of Bengal Outfall (Konada)
    ],
  },
  {
    id: 'gosthani-river',
    name: 'Gosthani River',
    basin: 'East Flowing Rivers between Mahanadi and Pennar',
    color: '#38bdf8',
    weight: 3.0,
    coordinates: [
      [18.2800, 83.0500], // Ananthagiri Hills
      [18.1730, 83.1950], // Tatipudi Reservoir Dam
      [17.9820, 83.3120], // Padmanabham
      [17.9320, 83.4250], // Tagarapuvalasa NH16 Bridge
      [17.8920, 83.4520], // Bheemunipatnam (Bheemili) Estuary
    ],
  },

  // 5. GUNDLAKAMMA, MUSI, MANNERU
  {
    id: 'gundlakamma-river',
    name: 'Gundlakamma River',
    basin: 'East Flowing Rivers between Mahanadi and Pennar',
    color: '#0284c7',
    weight: 3.8,
    coordinates: [
      [15.8850, 79.4820], // Ainavolu
      [15.9800, 79.6200], // Markapur Reach
      [16.0250, 79.7850], // Battepadu NSP Aqueduct
      [15.7500, 79.8500], // Addanki Reach
      [15.6180, 80.0480], // Gundlakamma Reservoir Dam (Mallavaram)
      [15.5200, 80.1800], // Ongole Delta
      [15.4800, 80.2500], // Bay of Bengal Outfall
    ],
  },
  {
    id: 'musi-river-ap',
    name: 'Musi River (Prakasam/Bapatla)',
    basin: 'Pennar Basin',
    color: '#38bdf8',
    weight: 3.0,
    coordinates: [
      [15.7420, 79.7120], // Podili / Darsi
      [15.7120, 79.8850], // Kunchepalli
      [15.6350, 79.9450], // Ananthavaram
      [15.5500, 80.1200], // Kothapatnam Bay of Bengal
    ],
  },
  {
    id: 'manneru-river',
    name: 'Manneru River',
    basin: 'Pennar Basin',
    color: '#38bdf8',
    weight: 3.0,
    coordinates: [
      [15.1150, 79.4250], // Mopadu Reservoir (NH565)
      [15.1450, 79.8450], // Kambaladinne (Isukadamarla)
      [15.1800, 79.9200], // Rallapadu Reservoir Dam
      [15.0850, 79.9450], // Gudluru
      [15.0250, 79.8850], // Veera Raghavani Kota Anicut
      [14.9800, 80.0800], // Karedu / Bay of Bengal
    ],
  },

  // 6. SOUTHERN AP RIVERS (Swarnamukhi, Kalangi, Arani, Nagari)
  {
    id: 'swarnamukhi-river',
    name: 'Swarnamukhi River',
    basin: 'Pennar Basin',
    color: '#0284c7',
    weight: 3.4,
    coordinates: [
      [13.6600, 79.2800], // Kalyani Dam Reservoir
      [13.5850, 79.4850], // Gajulamandyam
      [13.6850, 79.5450], // Mallavaram
      [13.7500, 79.7000], // Srikalahasti Holy Temple Ghats
      [13.7850, 79.7450], // Subbanaidu Kandriga
      [13.9120, 79.9050], // Naidupeta CWC Bridge
      [14.0200, 80.1200], // Bay of Bengal Outfall (Pulicat lagoon)
    ],
  },
  {
    id: 'kalangi-river',
    name: 'Kalangi River',
    basin: 'Pennar Basin',
    color: '#38bdf8',
    weight: 2.8,
    coordinates: [
      [13.8200, 79.8200], // Kalangi Reservoir Dam
      [13.7850, 79.8850], // Pallamala CWC Station
      [13.7050, 80.0150], // Sullurpet NH16 Bridge
      [13.6500, 80.1500], // Pulicat Lake Outfall
    ],
  },
  {
    id: 'arani-river',
    name: 'Arani River (Araniar)',
    basin: 'Pennar Basin',
    color: '#38bdf8',
    weight: 2.8,
    coordinates: [
      [13.3850, 79.9850], // Araniar Dam Reservoir (Pichatur)
      [13.3400, 80.1200], // Satyavedu reach
      [13.3000, 80.2800], // Pulicat Estuary
    ],
  },

  // 7. DELTA FLOODWAYS & WATERWAYS (Budameru, Tammileru, Errakalva, Yeleru)
  {
    id: 'budameru-channel',
    name: 'Budameru River & Flood Diversion Channel',
    basin: 'Krishna Basin',
    color: '#0284c7',
    weight: 3.2,
    coordinates: [
      [16.6850, 80.8150], // Pulivagu Confluence
      [16.6450, 80.6120], // Kothakovuluru
      [16.6350, 80.5480], // Velagaleru Diversion Regulator
      [16.5850, 80.7850], // Chainage Km 42.500 Floodway
      [16.4350, 80.9950], // Gudivada Chandraiah Drain
      [16.3200, 81.1800], // Kolleru Lake Outfall
    ],
  },
  {
    id: 'tammileru-river',
    name: 'Tammileru River',
    basin: 'Krishna Basin',
    color: '#38bdf8',
    weight: 3.0,
    coordinates: [
      [16.8450, 81.1450], // Gullapudi
      [16.7150, 81.1020], // East Tammileru at Eluru
      [16.7120, 81.0850], // West Tammileru at Eluru
      [16.6200, 81.1500], // Kolleru Lake Inflow
    ],
  },
  {
    id: 'errakalva-river',
    name: 'Errakalva River & Yenamaduru Drain',
    basin: 'Godavari Basin',
    color: '#38bdf8',
    weight: 3.0,
    coordinates: [
      [17.1250, 81.2850], // Jangareddygudem Reservoir
      [16.9450, 81.4450], // Anantapalli
      [16.5820, 81.5250], // Yenamaduru Drain Outfall
      [16.5450, 81.5650], // Gollalakoderu / Bhimavaram
      [16.3800, 81.6500], // Bay of Bengal Outlet
    ],
  },
  {
    id: 'yeleru-river',
    name: 'Yeleru River',
    basin: 'Godavari Basin',
    color: '#0284c7',
    weight: 3.2,
    coordinates: [
      [17.2950, 82.0850], // Yeleswaram Reservoir Dam
      [17.2650, 82.1150], // Somavaram
      [17.3650, 82.2150], // Dokkapalem / Maderu
      [17.0200, 82.2400], // Kakinada Canal / Bay of Bengal
    ],
  },
  {
    id: 'upputeru-waterway',
    name: 'Upputeru Tidal Waterway',
    basin: 'Godavari Basin',
    color: '#0284c7',
    weight: 3.2,
    coordinates: [
      [16.5920, 81.3850], // Akividu (Kolleru Outlet)
      [16.4450, 81.6150], // Chinagollapalem
      [16.3650, 81.5450], // Kalipatnam Outfall
      [16.2800, 81.6000], // Bay of Bengal Estuary
    ],
  },
];
