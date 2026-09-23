import React, { useState } from 'react';
import { TrialRecord } from '../types';
import { BarChart3, Download, RefreshCw, Trash2, Search, Filter, Award } from 'lucide-react';

interface ExperimentalLogsProps {
  trials: TrialRecord[];
  onResetTrials: () => void;
}

export const ExperimentalLogs: React.FC<ExperimentalLogsProps> = ({ trials, onResetTrials }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCondition, setFilterCondition] = useState<string>('all');

  const filteredTrials = trials.filter(t => {
    const matchesSearch = t.medicationName.includes(searchTerm) || t.id.includes(searchTerm);
    const matchesFilter = filterCondition === 'all' || t.systemDecision === filterCondition;
    return matchesSearch && matchesFilter;
  });

  const totalTrials = trials.length;
  const correctCount = trials.filter(t => t.isCorrectClassification).length;
  const accuracyPercentage = totalTrials > 0 ? ((correctCount / totalTrials) * 100).toFixed(1) : '100.0';

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trials, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "riwaa_experimental_data.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* Title & Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 space-x-reverse text-purple-400 text-xs font-semibold mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>سجل التجارب وجمع البيانات</span>
          </div>
          <h2 className="text-2xl font-black text-white">جدول التجارب، دقة التحقق، وتحليل النتائج</h2>
          <p className="text-xs text-slate-400 mt-1">
            تسجيل مفصل يضم رقم التجربة، الحالة الفعلية، الوزن المرجعي والمقاس، قراءة المستشعر، قرار النظام، وزمن الاستجابة.
          </p>
        </div>

        <div className="flex items-center space-x-3 space-x-reverse">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center space-x-2 space-x-reverse"
          >
            <Download className="w-4 h-4" />
            <span>تصدير بيانات التجارب (JSON)</span>
          </button>
          <button
            onClick={onResetTrials}
            className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold text-xs rounded-xl border border-rose-800 transition flex items-center space-x-2 space-x-reverse"
          >
            <Trash2 className="w-4 h-4" />
            <span>إعادة ضبط السجل</span>
          </button>
        </div>
      </div>

      {/* Accuracy Calculation Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4 space-x-reverse">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{totalTrials}</div>
            <div className="text-xs text-slate-400">إجمالي التجارب المسجلة</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4 space-x-reverse">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400">{correctCount}</div>
            <div className="text-xs text-slate-400">الحالات المصنفة بدقة</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4 space-x-reverse">
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-cyan-400">{accuracyPercentage}%</div>
            <div className="text-xs text-slate-400">دقة التحقق = (الصحيحة ÷ الإجمالي) × 100</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث برقم التجربة أو اسم الدواء..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-3 space-x-reverse w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterCondition}
            onChange={(e) => setFilterCondition(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="correct">صرف صحيح</option>
            <option value="no_dispense">عدم صرف</option>
            <option value="undersized">صرف ناقص</option>
            <option value="oversized">صرف زائد</option>
            <option value="jammed">انحشار</option>
          </select>
        </div>
      </div>

      {/* Trials Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4">رقم التجربة</th>
                <th className="py-3 px-4">الوقت</th>
                <th className="py-3 px-4">اسم الدواء</th>
                <th className="py-3 px-4">الحالة الفعلية</th>
                <th className="py-3 px-4">الوزن المرجعي</th>
                <th className="py-3 px-4">الوزن المقاس</th>
                <th className="py-3 px-4">مستشعر المرور</th>
                <th className="py-3 px-4">قرار النظام</th>
                <th className="py-3 px-4">زمن الاستجابة</th>
                <th className="py-3 px-4">مصدر الطاقة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTrials.length > 0 ? (
                filteredTrials.map((t) => {
                  const isCorrect = t.isCorrectClassification;
                  return (
                    <tr key={t.id} className="hover:bg-slate-950/50 transition">
                      <td className="py-3 px-4 font-mono text-cyan-400 font-bold">{t.id}</td>
                      <td className="py-3 px-4 text-slate-400">{t.timestamp}</td>
                      <td className="py-3 px-4 text-white font-semibold">{t.medicationName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300">
                          {t.actualCondition}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{t.referenceWeightMg} مغ</td>
                      <td className="py-3 px-4 text-cyan-300 font-semibold">{t.measuredWeightMg} مغ</td>
                      <td className="py-3 px-4">
                        <span className={t.sensorPassageDetected ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {t.sensorPassageDetected ? 'تم المرور (✓)' : 'لم يتم (✗)'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isCorrect ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {t.systemDecision}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{t.responseTimeMs} ms</td>
                      <td className="py-3 px-4 text-slate-300 uppercase">{t.powerSource}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    لا توجد تجارب مسجلة مطابقة للبحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
