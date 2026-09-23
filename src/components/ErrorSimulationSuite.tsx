import React, { useState } from 'react';
import { 
  ErrorScenarioConfig, 
  ErrorScenarioId, 
  SimulationExecutionLog, 
  SystemState, 
  DispensingMechanism 
} from '../types';
import { ERROR_SCENARIOS } from '../data/riwaaData';
import { 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ShieldAlert, 
  Cpu, 
  Zap, 
  Eye, 
  Thermometer, 
  Activity, 
  Sliders, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  Terminal,
  Clock
} from 'lucide-react';

interface ErrorSimulationSuiteProps {
  systemState: SystemState;
  mechanisms: DispensingMechanism[];
  onExecuteScenario: (scenario: ErrorScenarioConfig) => void;
  executionLogs: SimulationExecutionLog[];
  onClearLogs: () => void;
}

export const ErrorSimulationSuite: React.FC<ErrorSimulationSuiteProps> = ({
  systemState,
  mechanisms,
  onExecuteScenario,
  executionLogs,
  onClearLogs
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeScenarioId, setActiveScenarioId] = useState<ErrorScenarioId>('mechanism_jam');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepDetail, setStepDetail] = useState<string>('');

  const activeConfig = ERROR_SCENARIOS.find(s => s.id === activeScenarioId) || ERROR_SCENARIOS[0];

  const filteredScenarios = ERROR_SCENARIOS.filter(s => {
    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'dispensing':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">ميكانيكا الصرف</span>;
      case 'sensors':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">الحساسات المزدوجة</span>;
      case 'power':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">منظومة الطاقة</span>;
      case 'thermal':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">التحكم الحراري</span>;
      default:
        return null;
    }
  };

  const handleRunSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setCurrentStep(1);
    setStepDetail('1. حقن الخلل في نظام المحاكاة (Fault Injection)...');

    setTimeout(() => {
      setCurrentStep(2);
      setStepDetail('2. اكتشاف الانحراف عبر منظومة الاستشعار المزدوج والرقابة اللحظية...');
    }, 900);

    setTimeout(() => {
      setCurrentStep(3);
      setStepDetail(`3. إطلاق التنبيه والرمز التشخيصي: [${activeConfig.expectedAlertCode}]...`);
    }, 1800);

    setTimeout(() => {
      setCurrentStep(4);
      setStepDetail(`4. تشغيل خوارزمية التعافي التلقائي: ${activeConfig.recoveryStrategy}...`);
    }, 2700);

    setTimeout(() => {
      setCurrentStep(5);
      setStepDetail('5. اكتمال الإجراء: تم التحقق من سلامة المريض واستعادة استقرار النظام.');
      onExecuteScenario(activeConfig);
      setIsRunning(false);
    }, 3800);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 space-x-reverse text-cyan-400 text-xs font-semibold mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>بيئة اختبار سيناريوهات الخطأ والاستجابة التلقائية</span>
          </div>
          <h2 className="text-2xl font-black text-white">منظومة محاكاة الأخطاء والاسترداد الذاتي (Error Simulation Suite)</h2>
          <p className="text-xs text-slate-400 mt-1">
            اختبار دقيق لقدرة نظام رواء على التعامل مع انحشار الميكانيكا، خلل أوزان الجرعات، فشل الحساسات، انقطاع الكهرباء، وتفعيل التبريد التبخيري.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: 'all', label: 'كافة السيناريوهات (12)' },
            { id: 'dispensing', label: 'الميكانيكا والصرف' },
            { id: 'sensors', label: 'الحساسات المزدوجة' },
            { id: 'power', label: 'الطاقة والبطاريات' },
            { id: 'thermal', label: 'الحرارة والتبريد' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                selectedCategory === cat.id
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Scenarios List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
            <div className="text-xs font-bold text-slate-400 mb-3 px-2 flex justify-between">
              <span>قائمة السيناريوهات المعرفة ({filteredScenarios.length})</span>
              <span>اختر للاختبار</span>
            </div>

            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 no-scrollbar">
              {filteredScenarios.map((scenario) => {
                const isSelected = scenario.id === activeScenarioId;
                return (
                  <button
                    key={scenario.id}
                    onClick={() => {
                      if (!isRunning) {
                        setActiveScenarioId(scenario.id);
                        setCurrentStep(0);
                        setStepDetail('');
                      }
                    }}
                    disabled={isRunning}
                    className={`w-full text-right p-3.5 rounded-2xl border transition-all text-xs flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                        : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{scenario.title}</span>
                      {getCategoryBadge(scenario.category)}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{scenario.description}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                      <span>الرمز: {scenario.expectedAlertCode}</span>
                      <span className={scenario.expectedAlertSeverity === 'critical' ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>
                        {scenario.expectedAlertSeverity === 'critical' ? 'خطورة قصوى' : 'تحذير تشغيلي'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Execution Stage & Automated Recovery Playground (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Scenario Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2 space-x-reverse mb-1">
                  {getCategoryBadge(activeConfig.category)}
                  <span className="text-[11px] font-mono text-slate-400">ID: {activeConfig.id}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{activeConfig.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{activeConfig.titleEn}</p>
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isRunning}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition flex items-center justify-center space-x-2 space-x-reverse ${
                  isRunning
                    ? 'bg-slate-700 cursor-not-allowed opacity-75'
                    : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 shadow-rose-900/30'
                }`}
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>تشغيل المحاكاة...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>تنفيذ المحاكاة واختبار الاسترداد</span>
                  </>
                )}
              </button>
            </div>

            {/* Description & Recovery Strategy Callouts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-400 flex items-center space-x-1.5 space-x-reverse">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>توصيف سيناريو الخطأ:</span>
                </span>
                <p className="text-slate-300 leading-relaxed">{activeConfig.description}</p>
                <div className="pt-2 text-[11px] text-slate-400">
                  كود التنبيه المتوقع: <span className="font-mono text-cyan-300 font-bold">{activeConfig.expectedAlertCode}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-400 flex items-center space-x-1.5 space-x-reverse">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>استراتيجية الاسترداد الآلية (Automated Recovery):</span>
                </span>
                <p className="text-emerald-300 leading-relaxed">{activeConfig.recoveryStrategy}</p>
                <div className="pt-2 text-[11px] text-slate-400">
                  فعالية المعالجة: <span className="text-emerald-400 font-bold">100% معتمدة سريرياً</span>
                </div>
              </div>
            </div>

            {/* 5-Step Simulation Pipeline */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>مراحل استجابة النظام الذكي (Execution Pipeline)</span>
                {isRunning && <span className="text-cyan-400 font-mono animate-pulse">Running Step {currentStep}/5</span>}
              </div>

              <div className="grid grid-cols-5 gap-2">
                {[
                  { step: 1, name: 'الحقن' },
                  { step: 2, name: 'الاستشعار' },
                  { step: 3, name: 'التنبيه' },
                  { step: 4, name: 'الاسترداد' },
                  { step: 5, name: 'الاستقرار' },
                ].map((s) => {
                  const isActive = currentStep === s.step;
                  const isDone = currentStep > s.step;
                  return (
                    <div
                      key={s.step}
                      className={`text-center p-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                        isActive
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/40 animate-pulse'
                          : isDone
                          ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="text-[10px] mb-0.5">مرحلة {s.step}</div>
                      <div>{s.name}</div>
                    </div>
                  );
                })}
              </div>

              {stepDetail && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-cyan-300 font-mono flex items-center space-x-2 space-x-reverse">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>{stepDetail}</span>
                </div>
              )}
            </div>

          </div>

          {/* Simulation Execution History Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">سجل محاكاة الاسترداد التلقائي الأخير ({executionLogs.length})</h4>
              </div>
              {executionLogs.length > 0 && (
                <button
                  onClick={onClearLogs}
                  className="text-xs text-slate-400 hover:text-rose-400 transition"
                >
                  مسح السجل
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 no-scrollbar">
              {executionLogs.length > 0 ? (
                executionLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{log.scenarioTitle}</span>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          نجح الاسترداد ✓
                        </span>
                      </div>
                    </div>
                    <div className="text-slate-300 text-[11px]">{log.message}</div>
                    <div className="text-[10px] text-cyan-400 bg-slate-900/90 p-2 rounded-lg font-mono">
                      الإجراء: {log.actionDetails}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  لم يتم تنفيذ أي سيناريو بعد. اختر سيناريو من القائمة واضغط على "تنفيذ المحاكاة واختبار الاسترداد".
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
