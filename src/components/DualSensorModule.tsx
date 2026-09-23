import React from 'react';
import { TrialRecord } from '../types';
import { ShieldCheck, CheckCircle2, AlertTriangle, Activity, Sliders, Eye, Zap } from 'lucide-react';

interface DualSensorModuleProps {
  trials: TrialRecord[];
}

export const DualSensorModule: React.FC<DualSensorModuleProps> = ({ trials }) => {
  const recentTrials = trials.slice(-6).reverse();

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 space-x-reverse text-blue-400 text-xs font-semibold mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>منظومة التحقق الاستشعاري المزدوج</span>
        </div>
        <h2 className="text-2xl font-black text-white">الجمع بين مستشعر المرور ومستشعر الوزن (Load Cells)</h2>
        <p className="text-xs text-slate-400 mt-1">
          بعد أمر الصرف، لا يكتفي النظام بتشغيل المحرك؛ بل يسأل النظام سؤالين جوهريين: هل مرت الجرعة؟ وهل الوزن المقاس يتوافق مع حدود الحالة الصحيحة؟
        </p>
      </div>

      {/* Two Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sensor 1: Passage / Optical IR Sensor */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 space-x-reverse">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>المستشعر الأول: مستشعر مرور/وجود الجرعة</span>
            </h3>
            <span className="px-2.5 py-1 bg-cyan-950 text-cyan-300 text-xs font-semibold rounded-full border border-cyan-800">
              Optical / IR
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            يتم وضع مستشعر بصري أو بالأشعة تحت الحمراء عند مخرج قناة التوجيه. وظيفته التحقق الفوري من مرور المادة المصروفة خلال قناة التوجيه نحو منطقة الاستلام.
          </p>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>الحالة التشغيلية:</span>
              <span className="text-emerald-400 font-bold">نشط ويستجيب في 25ms</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>كفاءة الكشف:</span>
              <span className="text-cyan-400">99.4%</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>السؤال الجوهري:</span>
              <span className="text-white font-semibold">«هل مرت الجرعة؟ (نعم / لا)»</span>
            </div>
          </div>
        </div>

        {/* Sensor 2: Weight Sensor / Load Cell */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 space-x-reverse">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>المستشعر الثاني: وحدة قياس الوزن (Load Cells)</span>
            </h3>
            <span className="px-2.5 py-1 bg-blue-950 text-blue-300 text-xs font-semibold rounded-full border border-blue-800">
              Strain-Gauge
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            تعتمد على خلايا الحمل (Load Cells) تحت كوب الاستلام لقياس التغير في الكتلة والوزن بدقة عالية، للتمييز بين الصرف الصحيح والصرف الناقص أو الزائد أو المتعدد.
          </p>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>حساسية المعايرة:</span>
              <span className="text-emerald-400 font-bold">± 0.5 مغ</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>نطاق القراءة:</span>
              <span className="text-blue-400">0 - 5000 مغ</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>السؤال الجوهري:</span>
              <span className="text-white font-semibold">«هل الوزن المقاس ضمن الحدود الصحيحة؟»</span>
            </div>
          </div>
        </div>

      </div>

      {/* Decision Truth Table & Recent Verifications */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2 space-x-reverse">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>سجل التحقق المزدوج للعمليات الأخيرة</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4">رقم التجربة</th>
                <th className="py-3 px-4">الدواء</th>
                <th className="py-3 px-4">الوزن المرجعي</th>
                <th className="py-3 px-4">الوزن المقاس</th>
                <th className="py-3 px-4">مستشعر المرور</th>
                <th className="py-3 px-4">قرار النظام</th>
                <th className="py-3 px-4">زمن الاستجابة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentTrials.map((t) => {
                const isCorrect = t.systemDecision === 'correct';
                return (
                  <tr key={t.id} className="hover:bg-slate-950/50 transition">
                    <td className="py-3 px-4 font-mono text-cyan-400">{t.id}</td>
                    <td className="py-3 px-4 text-white font-semibold">{t.medicationName}</td>
                    <td className="py-3 px-4 text-slate-300">{t.referenceWeightMg} مغ</td>
                    <td className="py-3 px-4 text-cyan-300 font-semibold">{t.measuredWeightMg} مغ</td>
                    <td className="py-3 px-4">
                      <span className={t.sensorPassageDetected ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {t.sensorPassageDetected ? 'مرت (✓)' : 'لم تمر (✗)'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-[11px] font-bold ${
                        isCorrect ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {t.systemDecision}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{t.responseTimeMs} ms</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
