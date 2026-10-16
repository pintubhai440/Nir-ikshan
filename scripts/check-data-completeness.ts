import { HYDROLOGICAL_STATIONS, AP_OFFICIAL_RIVER_GAUGE_STATIONS } from '../src/data/indiaHydrologyData';
import { AP_OFFICIAL_RESERVOIRS } from '../src/data/apReservoirsData';
import { AP_MANDAL_RAINFALL_STATIONS } from '../src/data/apMandalWiseRainfall2026';
import { AP_RAINFALL_HYDROLOGICAL_STATIONS } from '../src/data/apMonsoonRainfall2026';
import { AP_GROUNDWATER_DTWL_2026, AP_GROUNDWATER_HYDROLOGICAL_STATIONS } from '../src/data/apGroundwaterDtwl2026';

console.log('=== DATA AUDIT SUMMARY ===');
console.log('1. Reservoirs (AP):', AP_OFFICIAL_RESERVOIRS.length);
console.log('   Reservoirs total in HYDROLOGICAL_STATIONS:', HYDROLOGICAL_STATIONS.filter(s => s.category === 'reservoir').length);

console.log('2. River Gauges & Discharges:');
console.log('   AP_OFFICIAL_RIVER_GAUGE_STATIONS:', AP_OFFICIAL_RIVER_GAUGE_STATIONS.length);
console.log('   River level stations in HYDROLOGICAL_STATIONS:', HYDROLOGICAL_STATIONS.filter(s => s.category === 'river_level').length);
console.log('   River discharge stations in HYDROLOGICAL_STATIONS:', HYDROLOGICAL_STATIONS.filter(s => s.category === 'river_discharge').length);

console.log('3. Rainfall Telemetry:');
console.log('   AP_MANDAL_RAINFALL_STATIONS:', AP_MANDAL_RAINFALL_STATIONS.length);
console.log('   AP_RAINFALL_HYDROLOGICAL_STATIONS:', AP_RAINFALL_HYDROLOGICAL_STATIONS.length);
console.log('   Rainfall stations in HYDROLOGICAL_STATIONS:', HYDROLOGICAL_STATIONS.filter(s => s.category === 'rainfall').length);

console.log('4. Groundwater Telemetry:');
console.log('   AP_GROUNDWATER_DTWL_2026 records:', AP_GROUNDWATER_DTWL_2026.length);
console.log('   AP_GROUNDWATER_HYDROLOGICAL_STATIONS:', AP_GROUNDWATER_HYDROLOGICAL_STATIONS.length);
console.log('   Groundwater stations in HYDROLOGICAL_STATIONS:', HYDROLOGICAL_STATIONS.filter(s => s.category === 'groundwater').length);

console.log('5. Bhuvan WBIS Water Spread & NDWI:');
console.log('   bhuvan_wbis in HYDROLOGICAL_STATIONS:', HYDROLOGICAL_STATIONS.filter(s => s.category === 'bhuvan_wbis').length);
console.log('   Extinct / dried-up / grey status stations:', HYDROLOGICAL_STATIONS.filter(s => s.isExtinct || s.status === 'grey').length);
