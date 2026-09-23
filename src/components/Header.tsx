import React from 'react';
import { SystemState, PowerSourceType } from '../types';
import { 
  ShieldCheck, 
  Zap, 
  Sun, 
  Battery, 
  Thermometer, 
  Activity, 
  AlertTriangle, 
  Cpu,
  Layers,
  FileText,
  BarChart3,
  Power,
  Box,
  ShieldAlert,
  Radio
} from 'lucide-react';

interface HeaderProps {
  systemState: SystemState;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onPowerSourceChange: (source: PowerSourceType) => void;
  onEmergencyStop: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  systemState,
  activeTab,
  setActiveTab,
  onPowerSourceChange,
  onEmergencyStop
}) => {
  const getPowerIcon = (source: PowerSourceType) => {
    switch (source) {
      case 'ac': return <Zap className="w-4 h-4 text-amber-400 animate-pulse" />;
      case 'solar': return <Sun className="w-4 h-4 text-yellow-400" />;
      case 'battery': return <Battery className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-4 space-x-reverse cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative w-12 h-12 bg-slate-900 border border-cyan-500/50 rounded-xl flex items-center justify-center text-cyan-400 font-bold text-xl shadow-inner">
                رواء
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                  نظام RIWAA الصحي الذكي
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-full">
                  Virtual Simulation
                </span>
              </div>
              <p className="text-xs text-slate-400">
                12 آلية صرف ميكانيكية | تحقق مزدوج (مرور + وزن) | Three.js 3D | بث WebSocket
              </p>
            </div>
          </div>

          {/* Quick Status Bar */}
          <div className="hidden xl:flex items-center space-x-3 space-x-reverse bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800/80">
            
            {/* WebSocket Telemetry Pill */}
            <div className="flex items-center space-x-1.5 space-x-reverse px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-800 text-[11px] font-mono">
              <span className={`w-2 h-2 rounded-full ${systemState.wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
              <span className={systemState.wsConnected ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {systemState.wsConnected ? 'LIVE WS' : 'OFFLINE'}
              </span>
            </div>

            {/* Power Source Badge */}
            <div className="flex items-center space-x-1.5 space-x-reverse bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              {getPowerIcon(systemState.activePowerSource)}
              <span className="text-xs font-medium text-slate-300">
                {systemState.activePowerSource === 'ac' ? 'الكهرباء AC' : systemState.activePowerSource === 'solar' ? 'طاقة شمسية' : 'بطارية'}
              </span>
              <div className="flex space-x-1 space-x-reverse mr-1">
                <button 
                  onClick={() => onPowerSourceChange('ac')} 
                  title="التبديل إلى الكهرباء"
                  className={`px-1.5 py-0.5 text-[10px] rounded ${systemState.activePowerSource === 'ac' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  AC
                </button>
                <button 
                  onClick={() => onPowerSourceChange('solar')} 
                  title="التبديل إلى الطاقة الشمسية"
                  className={`px-1.5 py-0.5 text-[10px] rounded ${systemState.activePowerSource === 'solar' ? 'bg-yellow-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  شمس
                </button>
                <button 
                  onClick={() => onPowerSourceChange('battery')} 
                  title="التبديل إلى البطارية"
                  className={`px-1.5 py-0.5 text-[10px] rounded ${systemState.activePowerSource === 'battery' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  بطارية
                </button>
              </div>
            </div>

            {/* Battery Level */}
            <div className="flex items-center space-x-1.5 space-x-reverse bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              <Battery className={`w-4 h-4 ${systemState.batteryLevel > 20 ? 'text-emerald-400' : 'text-rose-500 animate-pulse'}`} />
              <span className="text-xs font-semibold text-slate-200">{systemState.batteryLevel}%</span>
            </div>

            {/* Temperature */}
            <div className="flex items-center space-x-1.5 space-x-reverse bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              <Thermometer className="w-4 h-4 text-cyan-400" />
              <div className="text-xs">
                <span className="text-slate-400 ml-1">تبريد:</span>
                <span className="font-semibold text-cyan-300">{systemState.refrigeratedTempC.toFixed(1)}°C</span>
              </div>
            </div>

            {/* Emergency Button */}
            <button
              onClick={onEmergencyStop}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-md transition flex items-center space-x-1 space-x-reverse"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>إيقاف طوارئ</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 space-x-reverse overflow-x-auto pb-3 pt-1 border-t border-slate-800/60 no-scrollbar">
          {[
            { id: 'dashboard', label: 'لوحة المراقبة اللحظية (Real-Time)', icon: Activity },
            { id: 'three_d', label: 'المحاكاة ثلاثية الأبعاد (Three.js 3D)', icon: Box },
            { id: 'error_suite', label: 'محاكاة سيناريوهات الأعطال (Suite)', icon: ShieldAlert },
            { id: 'sensors', label: 'الاستشعار المزدوج والتحقق', icon: ShieldCheck },
            { id: 'power_cooling', label: 'منظومة الطاقة والتبريد المائي', icon: Zap },
            { id: 'logs', label: 'سجل التجارب وتحليل الدقة', icon: BarChart3 },
            { id: 'docs', label: 'الملف العلمي والبحثي', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/30 border border-cyan-400/30 font-bold'
                    : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
