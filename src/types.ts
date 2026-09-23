export type PowerSourceType = 'ac' | 'solar' | 'battery';

export type DispenseCondition = 
  | 'correct' 
  | 'no_dispense' 
  | 'undersized' 
  | 'oversized' 
  | 'multiple' 
  | 'jammed';

export type MechanismStatus = 'idle' | 'dispensing' | 'verifying' | 'jammed' | 'error';

export interface DispensingMechanism {
  id: number;
  name: string;
  genericName: string;
  category: 'ambient' | 'refrigerated';
  doseWeightMg: number;
  quantityRemaining: number;
  maxCapacity: number;
  status: MechanismStatus;
  motorCurrentMa: number; // e.g. 120mA normal, 450mA stall
  stepPosition: number; // 0 to 360 deg
  temperatureC: number;
  lastDispensedTime?: string;
  totalDispensedCount: number;
  jamRecoveryAttempts: number;
}

export interface MedicationCartridge extends DispensingMechanism {}

export interface SystemAlert {
  id: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
  code: string;
  component: 'dispenser' | 'sensor_optical' | 'sensor_loadcell' | 'power' | 'thermal' | 'cooling' | 'system';
  message: string;
  messageEn: string;
  acknowledged: boolean;
  actionTaken?: string;
}

export interface TrialRecord {
  id: string;
  timestamp: string;
  medicationName: string;
  cartridgeId: number;
  actualCondition: DispenseCondition;
  referenceWeightMg: number;
  measuredWeightMg: number;
  sensorPassageDetected: boolean;
  systemDecision: DispenseCondition;
  responseTimeMs: number;
  isCorrectClassification: boolean;
  notes: string;
  powerSource: PowerSourceType;
  temperatureC: number;
  recoveryActionApplied?: string;
}

export interface SystemState {
  activePowerSource: PowerSourceType;
  acPowerActive: boolean;
  solarPowerActive: boolean;
  batteryLevel: number; // 0 - 100%
  solarGenerationWatts: number; // e.g. 0 - 150W
  gridVoltage: number; // 220V - 230V
  batteryVoltage: number; // 12.6V
  totalSystemLoadWatts: number; // 45W - 85W
  refrigeratedTempC: number; // 2-8°C target
  ambientTempC: number; // 20-25°C
  humidityPercent: number; // e.g. 45%
  waterTankLevel: number; // 0 - 100% (evaporative cooling)
  evaporativeCoolingActive: boolean;
  peltierCoolerActive: boolean;
  systemStatus: 'normal' | 'warning' | 'error' | 'jammed' | 'power_switch';
  activeAlarm: string | null;
  totalDispenses: number;
  successCount: number;
  errorCount: number;
  jamCount: number;
  // WebSocket simulation
  wsConnected: boolean;
  wsLatencyMs: number;
  wsPacketsPerSec: number;
}

export type ErrorScenarioId = 
  | 'under_dose'
  | 'over_dose'
  | 'no_dispense'
  | 'multiple_dose'
  | 'mechanism_jam'
  | 'passage_sensor_fail'
  | 'weight_sensor_fail'
  | 'power_mains_failure'
  | 'solar_blackout'
  | 'battery_depletion'
  | 'thermal_runaway'
  | 'cooling_system_failure';

export interface ErrorScenarioConfig {
  id: ErrorScenarioId;
  title: string;
  titleEn: string;
  category: 'dispensing' | 'sensors' | 'power' | 'thermal';
  description: string;
  expectedAlertCode: string;
  expectedAlertSeverity: 'info' | 'warning' | 'critical';
  recoveryStrategy: string;
  targetMechanismId?: number;
}

export interface SimulationExecutionLog {
  id: string;
  timestamp: string;
  scenarioId: ErrorScenarioId;
  scenarioTitle: string;
  stage: 'injecting' | 'detecting' | 'alerting' | 'recovering' | 'completed';
  message: string;
  telemetryBefore: Record<string, any>;
  telemetryAfter: Record<string, any>;
  recoverySuccess: boolean;
  actionDetails: string;
}
