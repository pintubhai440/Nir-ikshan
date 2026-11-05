import {
  ScheduledInspectionTask,
  VerificationTaskItem,
  CalibratedHardwareDevice,
  OfflineVaultQueueItem,
  CadastralMapAssetItem,
} from './types';

export const INITIAL_SCHEDULED_TASKS: ScheduledInspectionTask[] = [];

export const INITIAL_VERIFICATION_TASKS: VerificationTaskItem[] = [];

export const INITIAL_CALIBRATED_DEVICES: CalibratedHardwareDevice[] = [
  {
    id: 'DEV-01',
    name: 'DiP Digital TDS & Conductivity Tester',
    model: 'Hanna Instruments HI-98301 DiP',
    serialNumber: 'HAN-TDS-884102',
    calibratedOn: '12 May 2024',
    validUntil: '12 Nov 2024',
    calibrationAgency: 'AP Water Quality Directorate (Visakhapatnam Lab)',
    status: 'Calibrated & Valid',
    accuracyTolerance: '±2% Full Scale (Buffer 1413 µS/cm)',
  },
  {
    id: 'DEV-02',
    name: 'Dual-Junction Waterproof pH Tester',
    model: 'Oakton pHTestr 30 (NIST 3-Point)',
    serialNumber: 'OKT-PH-49218',
    calibratedOn: '10 May 2024',
    validUntil: '10 Nov 2024',
    calibrationAgency: 'AP Water Quality Directorate (Visakhapatnam Lab)',
    status: 'Calibrated & Valid',
    accuracyTolerance: '±0.01 pH (Buffers: 4.01, 7.00, 10.01)',
  },
  {
    id: 'DEV-03',
    name: 'Limnological Secchi Transparency Disc',
    model: 'Standard 20cm Black & White Quadrant Disc',
    serialNumber: 'SEC-20CM-AP-09',
    calibratedOn: '04 Jan 2024',
    validUntil: '04 Jan 2025',
    calibrationAgency: 'National Hydrology Project Quality Protocol',
    status: 'Calibrated & Valid',
    accuracyTolerance: 'Graduated braided line checked to ±5mm',
  },
  {
    id: 'DEV-04',
    name: 'Sub-meter RTK GNSS Receiver',
    model: 'Trimble R2 Sub-meter Multi-Constellation',
    serialNumber: 'TRM-R2-GNSS-30291',
    calibratedOn: '18 Apr 2024',
    validUntil: '18 Apr 2025',
    calibrationAgency: 'Survey of India (Vijayawada CORS Network)',
    status: 'Calibrated & Valid',
    accuracyTolerance: 'Horizontal: ±1.8m (RTK Fixed to Base Tower BOB-N)',
  },
];

export const INITIAL_OFFLINE_VAULT: OfflineVaultQueueItem[] = [];

export const CADASTRAL_MAP_ASSETS: CadastralMapAssetItem[] = [];
