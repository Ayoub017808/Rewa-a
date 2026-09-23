import React, { useState, useEffect } from 'react';
import { 
  SystemState, 
  DispensingMechanism, 
  SystemAlert, 
  TrialRecord, 
  PowerSourceType,
  MechanismStatus
} from '../types';
import { 
  Activity, 
  Zap, 
  Sun, 
  Battery, 
  Thermometer, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  RefreshCw, 
  Radio, 
  Sliders, 
  Power, 
  ArrowUpRight, 
  Layers, 
  Cpu, 
  Eye, 
  Droplet,
  CheckCircle,
  Clock,
  Filter,
  Trash2,
  Play
} from 'lucide-react';

interface RealTimeDashboardProps {
  systemState: SystemState;
  mechanisms: DispensingMechanism[];
  alerts: SystemAlert[];
  trials: TrialRecord[];
  onPowerSourceChange: (source: PowerSourceType) => void;
  onTriggerDispense: (cartridgeId: number) => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onClearAlerts: () => void;
  onToggleWebSocket: () => void;
  onSelectMechanismFor3D: (id: number) => void;
}

export const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({
  systemState,
  mechanisms,
  alerts,
  trials,
  onPowerSourceChange,
  onTriggerDispense,
  onAcknowledgeAlert,
  onClearAlerts,
  onToggleWebSocket,
  onSelectMechanismFor3D
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [telemetryTicker, setTelemetryTicker] = useState<number>(0);
  const [showLiveJson, setShowLiveJson] = useState<boolean>(false);

  // Live telemetry pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryTicker(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalDispenses = systemState.totalDispenses;
  const successCount = systemState.successCount;
  const errorCount = systemState.errorCount;
  const jamCount = systemState.jamCount;
  
  const successRate = totalDispenses > 0 
    ? ((successCount / totalDispenses) * 100).toFixed(1) 
    : '100.0';
  
  const failureRate = totalDispenses > 0 
    ? (((errorCount + jamCount) / totalDispenses) * 100).toFixed(1) 
    : '0.0';

  const filteredAlerts = alerts.filter(a => {
    if (selectedSeverity === 'all') return true;
    return a.severity === selectedSeverity;
  });

  const getStatusColor = (status: MechanismStatus) => {
    switch (status) {
      case 'idle': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'dispensing': return 'bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse';
      case 'verifying': return 'bg-blue-500/20 text-blue-300 border-blue-400 animate-pulse';
      case 'jammed': return 'bg-rose-500/20 text-rose-400 border-rose-500 animate-bounce';
      case 'error': return 'bg-amber-500/20 text-amber-400 border-amber-500';
    }
  };

  const getStatusLabel = (status: MechanismStatus) => {
    switch (status) {
      case 'idle': return 'جاهز (Idle)';
      case 'dispensing': return 'صرف جاري...';
      case 'verifying': return 'تحقق مزدوج...';
      case 'jammed': return 'انحشار ميكانيكي!';
      case 'error': return 'خطأ استشعار!';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* WebSocket Live Telemetry Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="relative flex items-center justify-center">
            <span className={`w-3 h-3 rounded-full ${systemState.wsConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            {systemState.wsConnected && (
              <span className="w-3 h-3 rounded-full bg-emerald-400 absolute animate-ping opacity-75"></span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-xs font-bold text-white">اتصال WebSocket المباشر</span>
              <span className={`px-2 py-0.5 text-[10px] font-mono rounded-full font-bold ${
                systemState.wsConnected ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}>
                {systemState.wsConnected ? 'متصل (Live Stream)' : 'منفصل (Disconnected)'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-2 space-x-reverse mt-0.5">
              <span>ws://riwaa-telemetry.edge/v1/stream</span>
              <span className="text-slate-600">|</span>
              <span>زمن الاستجابة: {systemState.wsLatencyMs} ms</span>
              <span className="text-slate-600">|</span>
              <span>الحزم: {systemState.wsPacketsPerSec} pkt/s</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => setShowLiveJson(!showLiveJson)}
            className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            {showLiveJson ? 'إخفاء شريط البيانات' : 'شريط Telemetry JSON'}
          </button>
          <button
            onClick={onToggleWebSocket}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center space-x-1.5 space-x-reverse ${
              systemState.wsConnected 
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{systemState.wsConnected ? 'فصل البث' : 'إعادة الاتصال'}</span>
          </button>
        </div>
      </div>

      {/* Live JSON Ticker */}
      {showLiveJson && (
        <div className="bg-slate-950 border border-cyan-900/60 rounded-xl p-3 font-mono text-[11px] text-cyan-300 overflow-x-auto shadow-inner">
          <div className="flex justify-between items-center text-slate-400 text-[10px] mb-1">
            <span>LIVE SENSOR TELEMETRY FRAME #{telemetryTicker}</span>
            <span className="text-emerald-400">CRC32: OK</span>
          </div>
          <pre className="text-xs">
{JSON.stringify({
  timestamp: new Date().toISOString(),
  power: {
    source: systemState.activePowerSource,
    grid_v: systemState.gridVoltage,
    battery_pct: systemState.batteryLevel,
    solar_w: systemState.solarGenerationWatts,
    load_w: systemState.totalSystemLoadWatts
  },
  thermal: {
    refrigerated_c: Number(systemState.refrigeratedTempC.toFixed(2)),
    ambient_c: systemState.ambientTempC,
    evaporative_cooling: systemState.evaporativeCoolingActive,
    water_tank_pct: systemState.waterTankLevel
  },
  mechanisms_active_count: mechanisms.filter(m => m.status !== 'idle').length,
  dual_sensor_status: 'online'
}, null, 2)}
          </pre>
        </div>
      )}

      {/* Key Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Dispense Success Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">معدل نجاح الصرف المعتمد</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2 space-x-reverse">
            <span className="text-3xl font-black text-white">{successRate}%</span>
            <span className="text-xs text-emerald-400 font-medium">({successCount}/{totalDispenses})</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.max(0, Number(successRate)))}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
            <span>معدل الخطأ/الانحشار: {failureRate}%</span>
            <span>تحقق مزدوج نشط</span>
          </div>
        </div>

        {/* Metric 2: Active Power System */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">مصدر الطاقة الحالي</span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="text-2xl font-black text-white capitalize">
              {systemState.activePowerSource === 'ac' ? 'الكهرباء الرئيسية (AC)' : systemState.activePowerSource === 'solar' ? 'الطاقة الشمسية' : 'بطارية ليثيوم'}
            </span>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse text-xs text-slate-300 mt-2">
            <span>الجهد: {systemState.activePowerSource === 'ac' ? `${systemState.gridVoltage}V` : `${systemState.batteryVoltage}V`}</span>
            <span className="text-slate-600">|</span>
            <span>الحمل: {systemState.totalSystemLoadWatts}W</span>
          </div>
          <div className="flex space-x-1.5 space-x-reverse mt-3">
            <button
              onClick={() => onPowerSourceChange('ac')}
              className={`flex-1 py-1 text-[10px] font-bold rounded ${
                systemState.activePowerSource === 'ac' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              مأخذ AC
            </button>
            <button
              onClick={() => onPowerSourceChange('solar')}
              className={`flex-1 py-1 text-[10px] font-bold rounded ${
                systemState.activePowerSource === 'solar' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              شمسي ({systemState.solarGenerationWatts}W)
            </button>
            <button
              onClick={() => onPowerSourceChange('battery')}
              className={`flex-1 py-1 text-[10px] font-bold rounded ${
                systemState.activePowerSource === 'battery' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              بطارية
            </button>
          </div>
        </div>

        {/* Metric 3: Battery Storage */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">بطارية الليثيوم الاحتياطية</span>
            <div className={`p-2 rounded-xl ${systemState.batteryLevel > 20 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-500 animate-pulse'}`}>
              <Battery className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2 space-x-reverse">
            <span className={`text-3xl font-black ${systemState.batteryLevel > 20 ? 'text-white' : 'text-rose-400'}`}>
              {systemState.batteryLevel}%
            </span>
            <span className="text-xs text-slate-400">12.6V Pack</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                systemState.batteryLevel > 40 ? 'bg-emerald-500' : systemState.batteryLevel > 20 ? 'bg-amber-500' : 'bg-rose-500'
              }`} 
              style={{ width: `${systemState.batteryLevel}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
            <span>زمن التشغيل المقدر: ~{(systemState.batteryLevel * 0.18).toFixed(1)} ساعة</span>
            <span className="text-emerald-400">BMS آمن</span>
          </div>
        </div>

        {/* Metric 4: Thermal Health & Cold Chamber */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">حجرة التبريد (304 Stainless)</span>
            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
              <Thermometer className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2 space-x-reverse">
            <span className={`text-3xl font-black ${
              systemState.refrigeratedTempC >= 2 && systemState.refrigeratedTempC <= 8 ? 'text-cyan-400' : 'text-rose-400 animate-pulse'
            }`}>
              {systemState.refrigeratedTempC.toFixed(1)}°C
            </span>
            <span className="text-xs text-slate-400">المحيط: {systemState.ambientTempC}°C</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300 mt-3 pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-400">التبخير المائي:</span>
            <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
              systemState.evaporativeCoolingActive ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-800 text-slate-400'
            }`}>
              {systemState.evaporativeCoolingActive ? 'نشط (رذاذ)' : 'استعداد'}
            </span>
            <span className="text-[11px] text-slate-400">خزان الماء: {systemState.waterTankLevel}%</span>
          </div>
        </div>

      </div>

      {/* Section: 12 Dispensing Mechanisms Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2 space-x-reverse text-cyan-400 text-xs font-semibold mb-1">
              <Cpu className="w-4 h-4" />
              <span>مصفوفة المحركات ووحدات الفصل الـ 12</span>
            </div>
            <h3 className="text-xl font-bold text-white">حالات آليات الصرف الفردية (Individual Mechanism Status)</h3>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse text-xs">
            <span className="inline-flex items-center space-x-1 space-x-reverse px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Idle</span>
            </span>
            <span className="inline-flex items-center space-x-1 space-x-reverse px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>Dispensing</span>
            </span>
            <span className="inline-flex items-center space-x-1 space-x-reverse px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>Verifying</span>
            </span>
            <span className="inline-flex items-center space-x-1 space-x-reverse px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>Jammed</span>
            </span>
          </div>
        </div>

        {/* 12 Mechanisms Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mechanisms.map((mech) => {
            const isRefrigerated = mech.category === 'refrigerated';
            const statusClass = getStatusColor(mech.status);
            return (
              <div
                key={mech.id}
                className="bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl p-4 transition-all duration-200 shadow-md flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      M#{mech.id.toString().padStart(2, '0')}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusClass}`}>
                      {getStatusLabel(mech.status)}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-white truncate mb-0.5">
                    {mech.name}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mb-3">
                    {mech.genericName}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">الحجرة:</span>
                      <span className={isRefrigerated ? 'text-blue-400 font-semibold' : 'text-slate-300'}>
                        {isRefrigerated ? 'مبردة (2-8°C)' : 'حرارة الغرفة'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">المخزون المتبقي:</span>
                      <span className="font-semibold text-white">{mech.quantityRemaining} / {mech.maxCapacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">وزن الجرعة:</span>
                      <span className="text-cyan-400 font-semibold">{mech.doseWeightMg} مغ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">تيار المحرك:</span>
                      <span className={`font-mono ${mech.motorCurrentMa > 300 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                        {mech.motorCurrentMa} mA
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 space-x-reverse pt-1">
                  <button
                    onClick={() => onTriggerDispense(mech.id)}
                    disabled={mech.status !== 'idle'}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 space-x-reverse ${
                      mech.status === 'idle'
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Play className="w-3 h-3" />
                    <span>صرف</span>
                  </button>
                  <button
                    onClick={() => onSelectMechanismFor3D(mech.id)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition"
                    title="معاينة في العرض ثلاثي الأبعاد"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section: Alert Log for Anomalies */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">سجل التنبيهات واكتشاف الحالات غير الطبيعية (Alert Log)</h3>
              <p className="text-xs text-slate-400">تسجيل فوري لحالات الانحشار، اختلال الأوزان، فشل الحساسات، والظروف الحرارية.</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="flex space-x-1 space-x-reverse bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setSelectedSeverity('all')}
                className={`px-3 py-1 rounded-lg transition ${selectedSeverity === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                الكل ({alerts.length})
              </button>
              <button
                onClick={() => setSelectedSeverity('critical')}
                className={`px-3 py-1 rounded-lg transition ${selectedSeverity === 'critical' ? 'bg-rose-900/60 text-rose-300 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                حرجة ({alerts.filter(a => a.severity === 'critical').length})
              </button>
              <button
                onClick={() => setSelectedSeverity('warning')}
                className={`px-3 py-1 rounded-lg transition ${selectedSeverity === 'warning' ? 'bg-amber-900/60 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                تحذيرات ({alerts.filter(a => a.severity === 'warning').length})
              </button>
            </div>

            <button
              onClick={onClearAlerts}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded-xl transition"
              title="مسح التنبيهات المقروءة"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Alert Items List */}
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 no-scrollbar">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => {
              const isCrit = alert.severity === 'critical';
              const isWarn = alert.severity === 'warning';
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCrit 
                      ? 'bg-rose-950/30 border-rose-800/80 text-rose-200' 
                      : isWarn 
                      ? 'bg-amber-950/20 border-amber-800/70 text-amber-200' 
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  } ${!alert.acknowledged ? 'ring-1 ring-cyan-500/40' : 'opacity-85'}`}
                >
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className="mt-0.5">
                      {isCrit && <AlertOctagon className="w-5 h-5 text-rose-400 animate-pulse" />}
                      {isWarn && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                      {!isCrit && !isWarn && <CheckCircle className="w-5 h-5 text-cyan-400" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 space-x-reverse mb-1">
                        <span className="font-mono text-xs font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {alert.code}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{alert.timestamp}</span>
                        <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-slate-900/80 text-slate-400">
                          {alert.component}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-white">{alert.message}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{alert.messageEn}</div>
                      {alert.actionTaken && (
                        <div className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1 space-x-reverse">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>إجراء المعالجة: {alert.actionTaken}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse self-end sm:self-center">
                    {!alert.acknowledged ? (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-sm transition"
                      >
                        إقرار ومتابعة
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium">تم الإقرار ✓</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              لا توجد تنبيهات نشطة مطابقة للفلتر. النظام يعمل ضمن المعايير الطبيعية.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
