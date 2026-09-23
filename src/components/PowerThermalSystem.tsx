import React from 'react';
import { SystemState, PowerSourceType } from '../types';
import { Zap, Sun, Battery, Thermometer, Droplet, RefreshCw, ShieldCheck, Cpu } from 'lucide-react';

interface PowerThermalSystemProps {
  systemState: SystemState;
  onPowerSourceChange: (source: PowerSourceType) => void;
  onToggleEvaporativeCooling: () => void;
}

export const PowerThermalSystem: React.FC<PowerThermalSystemProps> = ({
  systemState,
  onPowerSourceChange,
  onToggleEvaporativeCooling
}) => {
  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 space-x-reverse text-emerald-400 text-xs font-semibold mb-1">
          <Zap className="w-4 h-4" />
          <span>منظومة الطاقة والتبريد متعددة المصادر</span>
        </div>
        <h2 className="text-2xl font-black text-white">إدارة الطاقة والتحكم الحراري والاستمرارية</h2>
        <p className="text-xs text-slate-400 mt-1">
          تعتمد المنظومة على الكهرباء الرئيسية، الطاقة الشمسية، بطاريات الليثيوم، والتبخير المائي كوسيلة للتحكم الحراري (وليس مصدراً للكهرباء) لضمان استمرارية التشغيل.
        </p>
      </div>

      {/* Grid: Power Sources & Thermal Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Power Management Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 space-x-reverse">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>منظومة مصادر الطاقة المتعددة</span>
            </h3>
            <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-800">
              تبديل تلقائي (Auto-Switch)
            </span>
          </div>

          <div className="space-y-4">
            {/* AC Power */}
            <div className={`p-4 rounded-2xl border transition flex items-center justify-between ${
              systemState.activePowerSource === 'ac' ? 'bg-amber-950/40 border-amber-500/60' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">الكهرباء الرئيسية (AC Main)</div>
                  <div className="text-xs text-slate-400">مزود الطاقة الأساسي للمنشأة الطبية</div>
                </div>
              </div>
              <button
                onClick={() => onPowerSourceChange('ac')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                  systemState.activePowerSource === 'ac' ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {systemState.activePowerSource === 'ac' ? 'نشط حالياً' : 'تفعيل'}
              </button>
            </div>

            {/* Solar Power */}
            <div className={`p-4 rounded-2xl border transition flex items-center justify-between ${
              systemState.activePowerSource === 'solar' ? 'bg-yellow-950/40 border-yellow-500/60' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-400">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">الطاقة الشمسية (Solar Panel)</div>
                  <div className="text-xs text-slate-400">توليد مستمر طوال فترة النهار (120W)</div>
                </div>
              </div>
              <button
                onClick={() => onPowerSourceChange('solar')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                  systemState.activePowerSource === 'solar' ? 'bg-yellow-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {systemState.activePowerSource === 'solar' ? 'نشط حالياً' : 'تفعيل'}
              </button>
            </div>

            {/* Lithium Battery Backup */}
            <div className={`p-4 rounded-2xl border transition flex items-center justify-between ${
              systemState.activePowerSource === 'battery' ? 'bg-emerald-950/40 border-emerald-500/60' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <Battery className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">بطاريات الليثيوم (Lithium Backup)</div>
                  <div className="text-xs text-slate-400">مستوى الشحن: {systemState.batteryLevel}% (طوارئ واستمرارية)</div>
                </div>
              </div>
              <button
                onClick={() => onPowerSourceChange('battery')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                  systemState.activePowerSource === 'battery' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {systemState.activePowerSource === 'battery' ? 'نشط حالياً' : 'تفعيل'}
              </button>
            </div>
          </div>
        </div>

        {/* Thermal & Evaporative Cooling Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 space-x-reverse">
              <Thermometer className="w-4 h-4 text-cyan-400" />
              <span>النظام الحراري والتبخير المائي</span>
            </h3>
            <span className="px-2.5 py-1 bg-cyan-950 text-cyan-300 text-xs font-semibold rounded-full border border-cyan-800">
              التبريد بالتبخير
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400 mb-1">درجة حرارة الغرفة المبردة</div>
              <div className="text-3xl font-black text-cyan-400">{systemState.refrigeratedTempC.toFixed(1)}°C</div>
              <div className="text-[10px] text-emerald-400 mt-1">ضمن نطاق الأدوية الحساسة (2-8°C)</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400 mb-1">خزان التبخير المائي</div>
              <div className="text-3xl font-black text-blue-400">{systemState.waterTankLevel}%</div>
              <div className="text-[10px] text-slate-400 mt-1">مستوى الماء الاحتياطي</div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">نظام التبخير المائي الاحتياطي:</span>
              <button
                onClick={onToggleEvaporativeCooling}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  systemState.evaporativeCoolingActive ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {systemState.evaporativeCoolingActive ? 'نشط (يعمل)' : 'متوقف'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              يُستخدم التبخير المائي كوسيلة للتحكم الحراري الفعّال في حالات انقطاع الطاقة الرئيسية، لمنع ارتفاع حرارة الأدوية المخزنة داخل الغرفة.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
