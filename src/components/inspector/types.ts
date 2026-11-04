export interface ScheduledInspectionTask {
  id: string;
  assetCode: string;
  name: string;
  cadastralParcel: string;
  ayacutHectares: number;
  rechargeType: string;
  sourceType: 'Citizen Complaint' | 'Scheduled Cadence' | 'Pre-monsoon Readiness';
  priority: 'Critical' | 'Routine' | 'Overdue SLA Breach';
  distanceMeters: number;
  bearing: string; // e.g. "North", "West", "Arrived on site"
  scheduledWindow: string; // e.g. "10:30 AM (In 45m)"
  isOverdue?: boolean;
  overdueHours?: number;
  pastRecordSummary?: string;
  pastRetentionPercent?: number;
  archivePhotoUrl?: string;
  photoPromptRequired?: string;
  citizenComplaintId?: string;
  coordinates: { lat: number; lng: number };
  mandal?: string;
  district?: string;
  citizenName?: string;
  citizenPhone?: string;
}

export interface VerificationReadingMetric {
  parameter: string;
  unit: string;
  beforeValue: string;
  beforeStatusClass: string;
  workerClaimValue: string;
  inspectorCheckValue: string;
  complianceLabel: string;
  isCompliant: boolean;
}

export interface VerificationTaskItem {
  id: string;
  taskId: string;
  priority: 'High Priority (Level 2)' | 'Critical Priority' | 'Routine Quality Check';
  title: string;
  locationName: string;
  assetCode: string;
  catchmentBasin: string;
  subBasin: string;
  actionWorkerName: string;
  actionWorkerTeam: string;
  workExecutionClosedDate: string;
  executionDurationDays: number;
  originallyFlaggedBy: string;
  isSelfLoggedByCurrentUser: boolean;
  statutoryRuleSatisfied: boolean;
  beforePhotoUrl: string;
  beforeDate: string;
  beforeInspectorId: string;
  beforeSiltLevel: string;
  beforeDefectNotes: string;
  afterPhotoUrl: string;
  afterDate: string;
  afterWorkerName: string;
  afterExcavationCubicMeters: string;
  afterWorkerClosureNotes: string;
  readings: VerificationReadingMetric[];
  inspectorObservations: string;
  status: 'PENDING_SIGN_OFF' | 'VERIFIED' | 'REJECTED' | 'RE_INSPECT_REQUIRED';
  citizenComplaintId?: string;
}

export interface CompletedInspectionItem {
  id: string;
  complaintId: string;
  name: string;
  assetCode: string;
  cadastralParcel?: string;
  district: string;
  mandal: string;
  inspectedAt: string;
  inspectorName: string;
  tdsReadingPpm: number;
  waterPresence: string;
  wasteLevel: string;
  wasteType: string;
  sitePhotoUrl: string;
  validationRemarks: string;
  status: string;
  coordinates: { lat: number; lng: number };
}

export interface CalibratedHardwareDevice {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  calibratedOn: string;
  validUntil: string;
  calibrationAgency: string;
  status: 'Calibrated & Valid' | 'Calibration Due Soon' | 'Expired';
  accuracyTolerance: string;
}

export interface OfflineVaultQueueItem {
  id: string;
  assetName: string;
  timestamp: string;
  sizeKb: number;
  recordType: 'Full Inspection Dossier' | 'Post-Work Verification' | 'Hydrology Field Probe';
  syncStatus: 'QUEUED_LOCAL' | 'SYNCED_CLOUD' | 'SYNCING';
  cryptographicHash: string;
}

export interface CadastralMapAssetItem {
  id: string;
  name: string;
  assetCode: string;
  parcelNo: string;
  type: 'Sluice Gate' | 'Check Dam' | 'Feeder Channel' | 'Percolation Tank' | 'Recharge Shaft';
  status: 'Critical' | 'Due' | 'In Progress' | 'Verified';
  lat: number;
  lng: number;
  distanceMeters: number;
  ayacutHa: number;
  controllingAuthority: string;
  citizenReportSummary?: string;
  photoUrl?: string;
}
