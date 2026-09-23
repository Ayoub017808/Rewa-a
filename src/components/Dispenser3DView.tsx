import React, { useState } from 'react';
import { MedicationCartridge, DispenseCondition, TrialRecord } from '../types';
import { 
  Cpu, 
  Layers, 
  RotateCw, 
  CheckCircle, 
  AlertTriangle, 
  Sliders, 
  Play, 
  Box, 
  Thermometer, 
  ShieldCheck,
  Zap,
  RefreshCw
} from 'lucide-react';

interface Dispenser3DViewProps {
  cartridges: MedicationCartridge[];
  onTriggerDispense: (cartridgeId: number, condition: DispenseCondition) => void;
  lastTrial: TrialRecord | null;
}

export const Dispenser3DView: React.FC<Dispenser3DViewProps> = ({
  cartridges,
  onTriggerDispense,
  lastTrial
}) => {
  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  const [testCondition, setTestCondition] = useState<DispenseCondition>('correct');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeAnimationStep, setActiveAnimationStep] = useState<number>(0);

  const currentCartridge = cartridges.find(c => c.id === selectedSlot) || cartridges[0];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setActiveAnimationStep(1); // Step 1: Motor Rotation & Separation

    setTimeout(() => {
      setActiveAnimationStep(2); // Step 2: Passage Sensor Check
    }, 500);

    setTimeout(() => {
      setActiveAnimationStep(3); // Step 3: Load Cell Weight Measurement
    }, 900);

    setTimeout(() => {
      setActiveAnimationStep(4); // Step 4: Decision & Result
      onTriggerDispense(selectedSlot, testCondition);
      setIsSimulating(false);
    }, 1400);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 space-x-reverse text-cyan-400 text-xs font-semibold mb-1">
            <Cpu className="w-4 h-4" />
            <span>المحاكاة الهندسية الميكانيكية</span>
          </div>
          <h2 className="text-2xl font-black text-white">آليات الصرف الـ 12 ومنطقة الفصل والتحقق</h2>
          <p className="text-xs text-slate-400 mt-1">
            تعمل الآلية على فصل جرعة واحدة بدقة وتوجيهها إلى منطقة الاستلام والتحقق لمنع الصرف المتعدد والانحشار.
          </p>
        </div>
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">الوحدة النشطة</div>
            <div className="text-sm font-bold text-cyan-400">#{selectedSlot} - {currentCartridge.name}</div>
          </div>
        </div>
      </div>

      {/* Main Interactive Schematic Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: 12 Cartridges Grid / Carousel View */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 space-x-reverse">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>وحدات التخزين والصرف الـ 12</span>
            </h3>
            <span className="text-xs font-medium text-slate-400">Carousel (1-12)</span>
          </div>

          <p className="text-xs text-slate-400">
            انقر على أي وحدة لاختبار صرف جرعتها المباشرة عبر محرك التدرج (Stepper Motor):
          </p>

          <div className="grid grid-cols-3 gap-2.5 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
            {cartridges.map((cart) => {
              const isSelected = cart.id === selectedSlot;
              const isRefrigerated = cart.category === 'refrigerated';
              return (
                <button
                  key={cart.id}
                  onClick={() => setSelectedSlot(cart.id)}
                  className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-cyan-950/80 border-cyan-500 shadow-lg shadow-cyan-950' 
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isRefrigerated ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-slate-900 text-slate-300'
                    }`}>
                      #{cart.id}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${cart.quantityRemaining > 20 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  </div>
                  <div className="text-xs font-bold text-white truncate mb-1">{cart.name}</div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>{cart.quantityRemaining} جرعة</span>
                    <span className="text-cyan-400">{cart.doseWeightMg} مغ</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center/Right: Interactive 2D/3D Schematic & Simulation Flow */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Visual Schematic Box */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Box className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">المخطط الهندسي لآلية الفصل والصرف</h3>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse text-xs">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {currentCartridge.category === 'refrigerated' ? 'غرفة مبردة (2-8°C)' : 'غرفة درجة حرارة الغرفة'}
                </span>
              </div>
            </div>

            {/* Step-by-Step Visualizer */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 my-6">
              {[
                { step: 1, label: 'فصل الجرعة', desc: 'محرك تدرج يتدوير الآلية', icon: RotateCw },
                { step: 2, label: 'مستشعر المرور', desc: 'رصد الأشعة تحت الحمراء', icon: ShieldCheck },
                { step: 3, label: 'قياس الوزن', desc: 'خلايا الحمل (Load Cell)', icon: Sliders },
                { step: 4, label: 'اتخاذ القرار', desc: 'تقييم النتيجة وتنبيه', icon: CheckCircle },
              ].map((item) => {
                const Icon = item.icon;
                const isCurrent = isSimulating && activeAnimationStep === item.step;
                const isCompleted = !isSimulating && lastTrial && activeAnimationStep === 0;
                return (
                  <div key={item.step} className={`p-4 rounded-2xl border transition-all ${
                    isCurrent 
                      ? 'bg-cyan-950 border-cyan-500 shadow-lg shadow-cyan-950 animate-pulse' 
                      : 'bg-slate-900/80 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                        isCurrent ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {item.step}
                      </span>
                      <Icon className={`w-4 h-4 ${isCurrent ? 'text-cyan-400 animate-spin' : 'text-slate-400'}`} />
                    </div>
                    <div className="text-xs font-bold text-white">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* Test Scenario Selector & Trigger */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white">إعداد سيناريو الاختبار والتجربة للوحدة #{selectedSlot}</h4>
                  <p className="text-xs text-slate-400">اختر الحالة المراد محاكاتها للتحقق من كفاءة خوارزميات رواء:</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'correct', label: 'صرف صحيح', desc: 'الوزن والمرور سليم' },
                  { id: 'no_dispense', label: 'عدم صرف', desc: 'فشل خروج الجرعة' },
                  { id: 'undersized', label: 'صرف ناقص', desc: 'أقل من المعيار' },
                  { id: 'oversized', label: 'صرف زائد', desc: 'أكبر من المعيار' },
                  { id: 'multiple', label: 'صرف متعدد', desc: 'خروج أكثر من جرعة' },
                  { id: 'jammed', label: 'انحشار ميكانيكي', desc: 'توقف الحركة' },
                ].map((cond) => {
                  const isSelected = testCondition === cond.id;
                  return (
                    <button
                      key={cond.id}
                      onClick={() => setTestCondition(cond.id as DispenseCondition)}
                      className={`p-2.5 rounded-xl border text-right transition-all ${
                        isSelected 
                          ? 'bg-cyan-950 border-cyan-500 text-white font-bold' 
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-semibold">{cond.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{cond.desc}</div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className={`px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition flex items-center space-x-2 space-x-reverse ${
                    isSimulating 
                      ? 'bg-slate-700 cursor-not-allowed opacity-75' 
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-900/40'
                  }`}
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جارٍ تنفيذ الصرف الميكانيكي والتحقق...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>تشغيل تجربة الآلية #{selectedSlot}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Last Trial Summary Footer */}
            {lastTrial && (
              <div className="mt-4 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className={`w-3 h-3 rounded-full ${lastTrial.systemDecision === 'correct' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  <div>
                    <span className="text-slate-400 ml-1">آخر نتيجة محاكاة:</span>
                    <span className="font-bold text-white">{lastTrial.medicationName}</span>
                    <span className="mx-2 text-slate-500">|</span>
                    <span className="text-cyan-400">قرار النظام: {lastTrial.systemDecision}</span>
                  </div>
                </div>
                <div className="text-slate-400">
                  الوزن المقاس: <strong className="text-white">{lastTrial.measuredWeightMg} مغ</strong> (المرجعي: {lastTrial.referenceWeightMg} مغ)
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
