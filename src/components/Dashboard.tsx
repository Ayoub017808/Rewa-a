import React, { useState } from 'react';
import { SystemState, MedicationCartridge, TrialRecord, DispenseCondition, PowerSourceType } from '../types';
import { 
  Play, 
  CheckCircle2, 
  AlertOctagon, 
  RefreshCw, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Sun, 
  Battery, 
  Thermometer, 
  Droplet, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Award
} from 'lucide-react';

interface DashboardProps {
  systemState: SystemState;
  cartridges: MedicationCartridge[];
  trials: TrialRecord[];
  onTriggerDispense: (cartridgeId: number, simulatedCondition?: DispenseCondition) => void;
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  systemState,
  cartridges,
  trials,
  onTriggerDispense,
  setActiveTab
}) => {
  const [selectedCartridgeId, setSelectedCartridgeId] = useState<number>(1);
  const [selectedCondition, setSelectedCondition] = useState<DispenseCondition>('correct');
  const [isDispensing, setIsDispensing] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<TrialRecord | null>(trials[trials.length - 1] || null);

  const handleRunDispense = () => {
    setIsDispensing(true);
    setTimeout(() => {
      onTriggerDispense(selectedCartridgeId, selectedCondition);
      setIsDispensing(false);
      // Get latest trial
      setTimeout(() => {
        // Updated from props parent
      }, 100);
    }, 1200);
  };

  const accuracyRate = trials.length > 0 
    ? ((trials.filter(t => t.isCorrectClassification).length / trials.length) * 100).toFixed(1)
    : '100.0';

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center space-x-2 space-x-reverse px-3 py-1 bg-cyan-950/80 border border-cyan-800/80 rounded-full text-cyan-300 text-xs font-semibold">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>مشروع إبداع 2026 - الهندسة الطبية الحيوية (ENBM)</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              نظام <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">RIWAA - رواء</span> الصحي الذكي
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              محاكاة متقدمة للتحقق من دقة صرف الجرعات الدوائية. يدمج النظام آلية صرف ميكانيكية تفصل جرعة واحدة عبر 12 وحدة، مع نظام استشعار مزدوج (مرور الجرعة + خلايا الحمل للوزن)، ومراقبة حرارية ومنظومة طاقة وتبريد متعددة المصادر.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => setActiveTab('dispenser')}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-900/40 transition flex items-center space-x-2 space-x-reverse"
              >
                <span>بدء المحاكاة ثلاثية الأبعاد</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('docs')}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl border border-slate-700 transition"
              >
                الملف العلمي والبحثي
              </button>
            </div>
          </div>

          {/* Key Metric Card */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 shadow-inner space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-slate-400">مؤشرات الأداء اللحظية</span>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="text-2xl font-black text-cyan-400">{systemState.totalDispenses}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">إجمالي عمليات الصرف</div>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="text-2xl font-black text-emerald-400">{accuracyRate}%</div>
                <div className="text-[11px] text-slate-400 mt-0.5">دقة التحقق المزدوج</div>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="text-2xl font-black text-amber-400">{systemState.jamCount}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">حالات الانحشار المكتشفة</div>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="text-2xl font-black text-blue-400">{systemState.refrigeratedTempC.toFixed(1)}°C</div>
                <div className="text-[11px] text-slate-400 mt-0.5">حرارة الغرفة المبردة</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: 12 Mechanisms */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition">
          <div className="absolute top-0 right-0 w-2 h-full bg-cyan-500"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-cyan-400">الآليات الميكانيكية</span>
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white mb-1">12 وحدة صرف</div>
          <p className="text-xs text-slate-400 mb-4">فصل جرعة واحدة بدقة وتوجيهها لمنطقة التحقق لمنع الصرف المتعدد.</p>
          <button 
            onClick={() => setActiveTab('dispenser')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 space-x-reverse"
          >
            <span>استعراض الوحدات</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Dual Sensor Verification */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition">
          <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-blue-400">التحقق الاستشعاري المزدوج</span>
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white mb-1">مستشعر مرور + وزن</div>
          <p className="text-xs text-slate-400 mb-4">هل مرت الجرعة؟ وهل الوزن المقاس ضمن الحدود؟ تقييم ذكي فوري.</p>
          <button 
            onClick={() => setActiveTab('sensors')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1 space-x-reverse"
          >
            <span>فحص نظام الاستشعار</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Power & Thermal System */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition">
          <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-400">الطاقة والتبريد متعدد المصادر</span>
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white mb-1">طاقة شمسية + بطارية + تبخير</div>
          <p className="text-xs text-slate-400 mb-4">تبديل تلقائي مستمر ومراقبة حرارية دقيقة للغرفة المبردة (2-8°C).</p>
          <button 
            onClick={() => setActiveTab('power_cooling')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 space-x-reverse"
          >
            <span>إدارة الطاقة والتبريد</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: Experimental Data */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-purple-500/50 transition">
          <div className="absolute top-0 right-0 w-2 h-full bg-purple-500"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-purple-400">سجل البيانات والتجارب</span>
            <Layers className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white mb-1">{trials.length} تجارب مسجلة</div>
          <p className="text-xs text-slate-400 mb-4">تحليل الأخطاء، نسب الدقة، وزمن الاستجابة لمقارنة الحالات الفعلية.</p>
          <button 
            onClick={() => setActiveTab('logs')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center space-x-1 space-x-reverse"
          >
            <span>عرض السجلات والنتائج</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Quick Interactive Dispensing Sandbox */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2 space-x-reverse">
              <Play className="w-5 h-5 text-cyan-400" />
              <span>محاكاة صرف جرعة تجريبية سريعة</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">اختر الدواء من الآليات الـ 12 وحالة الصرف لاختبار دقة استجابة المستشعر المزدوج.</p>
          </div>
          <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-medium rounded-lg">
            وضع الاختبار التجريبي الآمن
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
          
          {/* Controls */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">اختر آلية الصرف والدواء:</label>
                <select
                  value={selectedCartridgeId}
                  onChange={(e) => setSelectedCartridgeId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {cartridges.map((c) => (
                    <option key={c.id} value={c.id}>
                      الآلية #{c.id} - {c.name} ({c.category === 'refrigerated' ? 'مبرد 2-8°C' : 'حرارة الغرفة'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">حالة الصرف المطلوبة (للاختبار):</label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value as DispenseCondition)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="correct">صرف صحيح (دقيق)</option>
                  <option value="no_dispense">عدم صرف (فشل خروج الجرعة)</option>
                  <option value="undersized">صرف ناقص (أقل من الوزن المطلوب)</option>
                  <option value="oversized">صرف زائد (أكثر من الوزن المطلوب)</option>
                  <option value="multiple">صرف متعدد (أكثر من جرعة)</option>
                  <option value="jammed">انحشار آلية الصرف (ميكانيكي)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-3 space-x-reverse">
              <button
                onClick={handleRunDispense}
                disabled={isDispensing}
                className={`px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition flex items-center space-x-2 space-x-reverse ${
                  isDispensing 
                    ? 'bg-slate-700 cursor-not-allowed opacity-75' 
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-900/40'
                }`}
              >
                {isDispensing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جارٍ التشغيل والتحقق المزدوج...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>إرسال أمر الصرف والتحقق</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Panel */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 mb-2 flex items-center justify-between">
                <span>نتيجة التحقق اللحظي</span>
                <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  استشعار مزدوج نشط
                </span>
              </div>

              {trials.length > 0 ? (
                (() => {
                  const latest = trials[trials.length - 1];
                  const isSuccess = latest.systemDecision === 'correct';
                  return (
                    <div className="space-y-3 mt-3">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <div className={`w-3 h-3 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></div>
                        <span className="text-sm font-bold text-white">
                          {isSuccess ? 'عملية صرف صحيحة ومؤكدة' : `تنبيه خلل: ${latest.systemDecision}`}
                        </span>
                      </div>
                      
                      <div className="text-xs space-y-1.5 text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <div className="flex justify-between">
                          <span className="text-slate-400">الدواء:</span>
                          <span className="font-semibold text-white">{latest.medicationName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">الوزن المرجعي:</span>
                          <span className="font-semibold">{latest.referenceWeightMg} مغ</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">الوزن المقاس:</span>
                          <span className="font-semibold text-cyan-400">{latest.measuredWeightMg} مغ</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">مستشعر المرور:</span>
                          <span className={latest.sensorPassageDetected ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {latest.sensorPassageDetected ? 'تم رصد المرور ✓' : 'لم يتم رصد المرور ✗'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">زمن الاستجابة:</span>
                          <span>{latest.responseTimeMs} ms</span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-xs text-slate-500 py-6 text-center">
                  اضغط على "إرسال أمر الصرف والتحقق" لبدء التجربة.
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-500 pt-3 border-t border-slate-900">
              خوارزمية رواء: لا يعتبر النظام الصرف ناجحاً لمجرد تشغيل المحرك.
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
