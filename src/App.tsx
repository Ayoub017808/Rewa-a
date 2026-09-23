import React, { useState, useEffect } from 'react';
import { 
  SystemState, 
  DispensingMechanism, 
  TrialRecord, 
  DispenseCondition, 
  PowerSourceType,
  SystemAlert,
  ErrorScenarioConfig,
  SimulationExecutionLog 
} from './types';
import { INITIAL_MECHANISMS, INITIAL_TRIALS, INITIAL_ALERTS } from './data/riwaaData';
import { Header } from './components/Header';
import { RealTimeDashboard } from './components/RealTimeDashboard';
import { RIWAAThreeDView } from './components/RIWAAThreeDView';
import { ErrorSimulationSuite } from './components/ErrorSimulationSuite';
import { DualSensorModule } from './components/DualSensorModule';
import { PowerThermalSystem } from './components/PowerThermalSystem';
import { ExperimentalLogs } from './components/ExperimentalLogs';
import { ScientificDocs } from './components/ScientificDocs';
import { AlertModal } from './components/AlertModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mechanisms, setMechanisms] = useState<DispensingMechanism[]>(INITIAL_MECHANISMS);
  const [trials, setTrials] = useState<TrialRecord[]>(INITIAL_TRIALS);
  const [alerts, setAlerts] = useState<SystemAlert[]>(INITIAL_ALERTS);
  const [executionLogs, setExecutionLogs] = useState<SimulationExecutionLog[]>([]);
  const [selectedMechanismId, setSelectedMechanismId] = useState<number>(1);

  const [systemState, setSystemState] = useState<SystemState>({
    activePowerSource: 'ac',
    acPowerActive: true,
    solarPowerActive: true,
    batteryLevel: 88,
    solarGenerationWatts: 135,
    gridVoltage: 228,
    batteryVoltage: 12.6,
    totalSystemLoadWatts: 54,
    refrigeratedTempC: 4.2,
    ambientTempC: 22.5,
    humidityPercent: 45,
    waterTankLevel: 92,
    evaporativeCoolingActive: false,
    peltierCoolerActive: true,
    systemStatus: 'normal',
    activeAlarm: null,
    totalDispenses: INITIAL_TRIALS.length,
    successCount: INITIAL_TRIALS.filter(t => t.systemDecision === 'correct').length,
    errorCount: INITIAL_TRIALS.filter(t => t.systemDecision !== 'correct' && t.systemDecision !== 'jammed').length,
    jamCount: INITIAL_TRIALS.filter(t => t.systemDecision === 'jammed').length,
    wsConnected: true,
    wsLatencyMs: 24,
    wsPacketsPerSec: 10
  });

  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: ''
  });

  // Simulated WebSocket Live Telemetry Heartbeat
  useEffect(() => {
    if (!systemState.wsConnected) return;

    const interval = setInterval(() => {
      // Natural slight telemetry flutter
      setSystemState(prev => {
        const jitterTemp = (Math.random() - 0.5) * 0.05;
        const newTemp = Math.max(2.1, Math.min(7.8, prev.refrigeratedTempC + jitterTemp));
        const newPing = Math.floor(20 + Math.random() * 12);
        const solarW = prev.activePowerSource === 'solar' ? Math.floor(130 + Math.random() * 10) : prev.solarGenerationWatts;

        return {
          ...prev,
          refrigeratedTempC: newTemp,
          wsLatencyMs: newPing,
          solarGenerationWatts: solarW
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [systemState.wsConnected]);

  const handleToggleWebSocket = () => {
    setSystemState(prev => ({
      ...prev,
      wsConnected: !prev.wsConnected,
      wsLatencyMs: !prev.wsConnected ? 22 : 0,
      wsPacketsPerSec: !prev.wsConnected ? 10 : 0
    }));
  };

  const handlePowerSourceChange = (source: PowerSourceType) => {
    setSystemState(prev => ({
      ...prev,
      activePowerSource: source,
      acPowerActive: source === 'ac',
      solarPowerActive: source === 'solar',
      evaporativeCoolingActive: source !== 'ac' ? true : prev.evaporativeCoolingActive
    }));

    const alertMsg = source === 'ac' 
      ? 'التبديل إلى شبكة الكهرباء الرئيسية (Mains 220V)' 
      : source === 'solar' 
      ? 'تفعيل الألواح الشمسية ومتحكم MPPT' 
      : 'تفعيل مسار التفريغ من بطارية الليثيوم الاحتياطية';

    setAlerts(prev => [
      {
        id: `ALT-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        severity: 'info',
        code: `INF_POWER_${source.toUpperCase()}`,
        component: 'power',
        message: alertMsg,
        messageEn: `Switched active power bus to ${source.toUpperCase()}`,
        acknowledged: false
      },
      ...prev
    ]);
  };

  const handleEmergencyStop = () => {
    setSystemState(prev => ({
      ...prev,
      systemStatus: 'error',
      activeAlarm: 'تم تفعيل زر إيقاف الطوارئ من قبل المستخدم. تم قفل كافة الآليات الميكانيكية.'
    }));

    setMechanisms(prev => prev.map(m => ({ ...m, status: 'error' })));

    setAlerts(prev => [
      {
        id: `ALT-EMG-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        severity: 'critical',
        code: 'EMG_ESTOP_ACTIVE',
        component: 'system',
        message: 'تم الضغط على زر التوقف في حالات الطوارئ (E-STOP)؛ قفل آليات الصرف فورياً',
        messageEn: 'Emergency Stop button depressed; mechanical dispensers locked',
        acknowledged: false,
        actionTaken: 'Interlock circuit opened, stepper drivers disabled'
      },
      ...prev
    ]);

    setAlertModal({
      isOpen: true,
      message: 'تنبيه طوارئ: تم إيقاف جميع المحركات والمغذيات الميكانيكية فورياً لسلامة النظام.'
    });
  };

  const handleToggleEvaporativeCooling = () => {
    setSystemState(prev => ({
      ...prev,
      evaporativeCoolingActive: !prev.evaporativeCoolingActive
    }));
  };

  // Dispense Handler supporting 12 mechanisms & dual-sensor verification logic
  const handleTriggerDispense = (cartridgeId: number, simulatedCondition: DispenseCondition = 'correct') => {
    const targetMech = mechanisms.find(c => c.id === cartridgeId) || mechanisms[0];
    
    // Set to Dispensing status
    setMechanisms(prev => prev.map(m => m.id === cartridgeId ? { ...m, status: 'dispensing' } : m));

    setTimeout(() => {
      // Set to Verifying
      setMechanisms(prev => prev.map(m => m.id === cartridgeId ? { ...m, status: 'verifying' } : m));

      // Calculate simulated measurements based on condition
      let measuredWeight = targetMech.doseWeightMg;
      let sensorPassage = true;
      let systemDecision: DispenseCondition = simulatedCondition;
      let motorCurrent = targetMech.motorCurrentMa;
      let recoveryAction: string | undefined = undefined;

      if (simulatedCondition === 'no_dispense') {
        measuredWeight = 0;
        sensorPassage = false;
        systemDecision = 'no_dispense';
      } else if (simulatedCondition === 'undersized') {
        measuredWeight = Math.round(targetMech.doseWeightMg * 0.65);
        sensorPassage = true;
        systemDecision = 'undersized';
      } else if (simulatedCondition === 'oversized') {
        measuredWeight = Math.round(targetMech.doseWeightMg * 1.45);
        sensorPassage = true;
        systemDecision = 'oversized';
      } else if (simulatedCondition === 'multiple') {
        measuredWeight = Math.round(targetMech.doseWeightMg * 2.1);
        sensorPassage = true;
        systemDecision = 'multiple';
      } else if (simulatedCondition === 'jammed') {
        measuredWeight = 0;
        sensorPassage = false;
        systemDecision = 'jammed';
        motorCurrent = 480; // Stall current
        recoveryAction = 'تنفيذ Reverse Jog آلي 15°';
      }

      const isCorrect = systemDecision === simulatedCondition;
      const responseTime = Math.floor(Math.random() * 150) + 280;
      const now = new Date();
      const timeString = now.toTimeString().split(' ')[0];

      const newTrial: TrialRecord = {
        id: `TR-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: timeString,
        medicationName: targetMech.name,
        cartridgeId: targetMech.id,
        actualCondition: simulatedCondition,
        referenceWeightMg: targetMech.doseWeightMg,
        measuredWeightMg: measuredWeight,
        sensorPassageDetected: sensorPassage,
        systemDecision: systemDecision,
        responseTimeMs: responseTime,
        isCorrectClassification: isCorrect,
        notes: simulatedCondition === 'correct' 
          ? 'صرف سليم وتطابق تام بين حساس المرور البصري وخلية الوزن' 
          : `اكتشاف حالة غير طبيعية (${simulatedCondition})`,
        powerSource: systemState.activePowerSource,
        temperatureC: targetMech.category === 'refrigerated' ? systemState.refrigeratedTempC : systemState.ambientTempC,
        recoveryActionApplied: recoveryAction
      };

      setTrials(prev => [...prev, newTrial]);

      // Update mechanism
      setMechanisms(prev => prev.map(m => {
        if (m.id === cartridgeId) {
          return {
            ...m,
            status: simulatedCondition === 'jammed' ? 'jammed' : 'idle',
            quantityRemaining: simulatedCondition === 'correct' ? Math.max(0, m.quantityRemaining - 1) : m.quantityRemaining,
            totalDispensedCount: simulatedCondition === 'correct' ? m.totalDispensedCount + 1 : m.totalDispensedCount,
            motorCurrentMa: simulatedCondition === 'jammed' ? 480 : 120,
            jamRecoveryAttempts: simulatedCondition === 'jammed' ? m.jamRecoveryAttempts + 1 : m.jamRecoveryAttempts
          };
        }
        return m;
      }));

      // Update system stats
      setSystemState(prev => ({
        ...prev,
        totalDispenses: prev.totalDispenses + 1,
        successCount: simulatedCondition === 'correct' ? prev.successCount + 1 : prev.successCount,
        errorCount: simulatedCondition !== 'correct' && simulatedCondition !== 'jammed' ? prev.errorCount + 1 : prev.errorCount,
        jamCount: simulatedCondition === 'jammed' ? prev.jamCount + 1 : prev.jamCount,
        systemStatus: simulatedCondition === 'jammed' ? 'jammed' : simulatedCondition !== 'correct' ? 'warning' : 'normal'
      }));

      // Log alert if not correct
      if (simulatedCondition !== 'correct') {
        const newAlert: SystemAlert = {
          id: `ALT-${Date.now().toString().slice(-4)}`,
          timestamp: timeString,
          severity: simulatedCondition === 'jammed' || simulatedCondition === 'multiple' ? 'critical' : 'warning',
          code: simulatedCondition === 'jammed' ? 'ERR_JAM_MECHANISM' : simulatedCondition === 'multiple' ? 'ERR_MULTIPLE_DOSE' : 'ERR_DOSE_MISMATCH',
          component: 'dispenser',
          message: `تنبيه صرف (${targetMech.name}): تم رصد حالة [${simulatedCondition}]. الوزن المقاس: ${measuredWeight}مغ`,
          messageEn: `Dispense condition [${simulatedCondition}] detected for mechanism #${targetMech.id}`,
          acknowledged: false,
          actionTaken: simulatedCondition === 'jammed' ? 'تم تشغيل تفريج الانحشار العكسي Reverse Jog' : 'تعليق تسليم الجرعة'
        };
        setAlerts(prev => [newAlert, ...prev]);

        if (simulatedCondition === 'jammed') {
          setAlertModal({
            isOpen: true,
            message: `تنبيه حرج لنظام رواء: تم رصد انحشار بآلية الصرف رقم #${targetMech.id} (${targetMech.name}). قام النظام بتشغيل مناورة الفك التذبذبية Reverse Jog.`
          });
        }
      }

    }, 800);
  };

  // Error Suite Execution Handler
  const handleExecuteScenario = (scenario: ErrorScenarioConfig) => {
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0];

    const telemetryBefore = {
      power: systemState.activePowerSource,
      tempC: systemState.refrigeratedTempC,
      battery: systemState.batteryLevel,
      systemStatus: systemState.systemStatus
    };

    let actionDetails = scenario.recoveryStrategy;

    // Apply domain specific recovery effects
    if (scenario.id === 'mechanism_jam') {
      setMechanisms(prev => prev.map(m => m.id === 2 ? { ...m, status: 'jammed', motorCurrentMa: 480 } : m));
      setSystemState(prev => ({ ...prev, systemStatus: 'jammed', jamCount: prev.jamCount + 1 }));
      actionDetails = 'تم تنفيذ 3 نبضات تذبذبية عكسية (Reverse Jog 15°)؛ تحررت حبة الدواء وعاد تيار المحرك إلى 120mA';
      setTimeout(() => {
        setMechanisms(prev => prev.map(m => m.id === 2 ? { ...m, status: 'idle', motorCurrentMa: 120 } : m));
        setSystemState(prev => ({ ...prev, systemStatus: 'normal' }));
      }, 3000);
    } else if (scenario.id === 'power_mains_failure') {
      setSystemState(prev => ({
        ...prev,
        activePowerSource: 'battery',
        acPowerActive: false,
        gridVoltage: 0,
        systemStatus: 'power_switch'
      }));
      actionDetails = 'التبديل الفوري عبر ATS (Zero-ms Switch) إلى بطارية الليثيوم 12.6V وحماية جرعات المرضى من الانقطاع';
    } else if (scenario.id === 'solar_blackout') {
      setSystemState(prev => ({
        ...prev,
        activePowerSource: 'battery',
        solarGenerationWatts: 0,
        solarPowerActive: false
      }));
      actionDetails = 'تحويل مسار التغذية إلى حزمة بطاريات الليثيوم الاحتياطية تلقائياً';
    } else if (scenario.id === 'battery_depletion') {
      setSystemState(prev => ({
        ...prev,
        batteryLevel: 12,
        systemStatus: 'warning'
      }));
      actionDetails = 'تفعيل نمط التوفير الأقصى Power Save Mode: إبقاء تبريد الإنسولين 4.2°C نشطاً مع تعتيم شاشات العرض';
    } else if (scenario.id === 'thermal_runaway') {
      setSystemState(prev => ({
        ...prev,
        refrigeratedTempC: 8.4,
        systemStatus: 'warning',
        peltierCoolerActive: true
      }));
      actionDetails = 'تشغيل مضخم التبريد بلتير 100% وإشعال مروحة التشتيت الحراري للعودة إلى 4.2°C';
      setTimeout(() => {
        setSystemState(prev => ({ ...prev, refrigeratedTempC: 4.8, systemStatus: 'normal' }));
      }, 3500);
    } else if (scenario.id === 'cooling_system_failure') {
      setSystemState(prev => ({
        ...prev,
        peltierCoolerActive: false,
        evaporativeCoolingActive: true,
        systemStatus: 'warning'
      }));
      actionDetails = 'تفعيل التبريد التبخيري المائي الاحتياطي فورياً + تفريغ وسائد PCM للحفاظ على حرارة الدواء';
    } else if (scenario.id === 'passage_sensor_fail') {
      actionDetails = 'إعادة ضبط حساسية المستقبل الضوئي IR Auto-Gain؛ وتأكيد القياس عبر خلية الوزن';
    } else if (scenario.id === 'weight_sensor_fail') {
      actionDetails = 'تنفيذ معايرة تصفير رقمية فورية (Auto-Tare) لمضخم HX711';
    }

    const telemetryAfter = {
      power: systemState.activePowerSource,
      tempC: systemState.refrigeratedTempC,
      battery: systemState.batteryLevel,
      systemStatus: 'normal'
    };

    // New Alert
    const newAlert: SystemAlert = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      timestamp: timeString,
      severity: scenario.expectedAlertSeverity,
      code: scenario.expectedAlertCode,
      component: scenario.category === 'sensors' ? 'sensor_optical' : scenario.category === 'power' ? 'power' : scenario.category === 'thermal' ? 'thermal' : 'dispenser',
      message: `محاكاة خطأ: ${scenario.title}. ${scenario.description}`,
      messageEn: `Scenario ${scenario.id} executed: ${scenario.titleEn}`,
      acknowledged: false,
      actionTaken: actionDetails
    };

    setAlerts(prev => [newAlert, ...prev]);

    // New Log
    const newLog: SimulationExecutionLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: timeString,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      stage: 'completed',
      message: `تم تنفيذ السيناريو بنجاح. استجابت خوارزمية الأمان في غضون 320ms.`,
      telemetryBefore,
      telemetryAfter,
      recoverySuccess: true,
      actionDetails
    };

    setExecutionLogs(prev => [newLog, ...prev]);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  };

  const handleClearAlerts = () => {
    setAlerts([]);
  };

  const handleResetTrials = () => {
    setTrials(INITIAL_TRIALS);
    setSystemState(prev => ({
      ...prev,
      totalDispenses: INITIAL_TRIALS.length,
      successCount: INITIAL_TRIALS.filter(t => t.systemDecision === 'correct').length,
      errorCount: 0,
      jamCount: INITIAL_TRIALS.filter(t => t.systemDecision === 'jammed').length
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white" dir="rtl">
      
      {/* Top Header */}
      <Header
        systemState={systemState}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onPowerSourceChange={handlePowerSourceChange}
        onEmergencyStop={handleEmergencyStop}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && (
          <RealTimeDashboard
            systemState={systemState}
            mechanisms={mechanisms}
            alerts={alerts}
            trials={trials}
            onPowerSourceChange={handlePowerSourceChange}
            onTriggerDispense={handleTriggerDispense}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onClearAlerts={handleClearAlerts}
            onToggleWebSocket={handleToggleWebSocket}
            onSelectMechanismFor3D={(id) => {
              setSelectedMechanismId(id);
              setActiveTab('three_d');
            }}
          />
        )}

        {activeTab === 'three_d' && (
          <RIWAAThreeDView
            mechanisms={mechanisms}
            systemState={systemState}
            selectedMechanismId={selectedMechanismId}
            onSelectMechanism={setSelectedMechanismId}
            onTriggerDispense={handleTriggerDispense}
          />
        )}

        {activeTab === 'error_suite' && (
          <ErrorSimulationSuite
            systemState={systemState}
            mechanisms={mechanisms}
            onExecuteScenario={handleExecuteScenario}
            executionLogs={executionLogs}
            onClearLogs={() => setExecutionLogs([])}
          />
        )}

        {activeTab === 'sensors' && (
          <DualSensorModule trials={trials} />
        )}

        {activeTab === 'power_cooling' && (
          <PowerThermalSystem
            systemState={systemState}
            onPowerSourceChange={handlePowerSourceChange}
            onToggleEvaporativeCooling={handleToggleEvaporativeCooling}
          />
        )}

        {activeTab === 'logs' && (
          <ExperimentalLogs
            trials={trials}
            onResetTrials={handleResetTrials}
          />
        )}

        {activeTab === 'docs' && (
          <ScientificDocs />
        )}
      </main>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        onClose={() => setAlertModal({ isOpen: false, message: '' })}
      />

      {/* Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span>نظام رواء الصحي الذكي (RIWAA Virtual Simulation)</span>
            <span className="mx-2">•</span>
            <span>تحقق مزدوج (مرور + وزن) | 12 آلية صرف ميكانيكية</span>
          </div>
          <div className="text-slate-500 font-mono">
            WebSocket Live Telemetry | Three.js 3D Engine | ISO-13485 Compliant Architecture
          </div>
        </div>
      </footer>

    </div>
  );
}
