import React, { useState } from 'react';
import { FileText, Award, BookOpen, CheckCircle, ShieldCheck, Cpu, Zap, Layers } from 'lucide-react';

export const ScientificDocs: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'abstract' | 'problem' | 'methodology' | 'references'>('abstract');

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 space-x-reverse text-cyan-400 text-xs font-semibold mb-1">
            <Award className="w-4 h-4" />
            <span>ملف مشروع إبداع 2026 - موهبة</span>
          </div>
          <h2 className="text-2xl font-black text-white">الملف العلمي والبحثي لمشروع رواء (RIWAA)</h2>
          <p className="text-xs text-slate-400 mt-1">
            تطوير نظام صحي ذكي للتحقق من دقة صرف الجرعات الدوائية باستخدام آلية صرف ميكانيكية ونظام استشعار مزدوج وطاقة وتبريد متعدد المصادر.
          </p>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex space-x-2 space-x-reverse overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'abstract', label: 'الملخص والفكرة والأهداف', icon: BookOpen },
          { id: 'problem', label: 'المشكلة والسؤال البحثي والفرضية', icon: ShieldCheck },
          { id: 'methodology', label: 'المنهجية والتصميم الهندسي', icon: Cpu },
          { id: 'references', label: 'المراجع العلمية (WHO & NIST)', icon: FileText },
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`flex items-center space-x-2 space-x-reverse px-4 py-2.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6 text-slate-300 text-sm leading-relaxed">
        
        {activeSection === 'abstract' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2 space-x-reverse">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span>الملخص العلمي لمشروع رواء (RIWAA)</span>
              </h3>
              <p className="leading-relaxed">
                رواء (RIWAA) هو نظام صحي ذكي مقترح للتحقق من دقة عمليات صرف الجرعات الدوائية من خلال دمج آلية صرف ميكانيكية للجرعة الواحدة مع نظام استشعار مزدوج يتكون من مستشعر للتحقق من مرور الجرعة ونظام لقياس وزن المادة المصروفة (Load Cells). يهدف النظام إلى التمييز بين حالات الصرف الصحيح وغير الصحيح، بما في ذلك عدم الصرف والصرف الناقص والزائد والصرف المتعدد والانحشار، بدل الاعتماد على أمر الصرف الإلكتروني وحده.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-base">الهدف الرئيسي</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  تطوير نظام صحي ذكي قادر على صرف الجرعات والتحقق من عملية الصرف ومراقبة حالة النظام باستخدام آلية ميكانيكية واستشعار مزدوج ومنظومة طاقة وتبريد متعددة المصادر.
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-base">الأهداف الفرعية</h4>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>تطوير آلية ميكانيكية لصرف جرعة واحدة.</li>
                  <li>تقليل احتمالية خروج أكثر من جرعة (الصرف المتعدد).</li>
                  <li>التحقق من مرور الجرعة وقياس كمية المادة بالوزن.</li>
                  <li>اكتشاف حالات الانحشار والصرف الناقص أو الزائد.</li>
                  <li>مراقبة الظروف الحرارية ودراسة استمرارية التشغيل بالطاقة المتعددة.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'problem' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2 space-x-reverse">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span>المشكلة والسؤال البحثي والفرضية</span>
              </h3>
              <p className="leading-relaxed">
                <strong>المشكلة:</strong> قد لا يعني تشغيل آلية الصرف أو إرسال أمر إلكتروني أن الجرعة خرجت بالشكل الصحيح؛ فقد تحدث حالات مثل: عدم خروج الجرعة، خروج كمية أقل أو أكبر من المطلوبة، خروج أكثر من جرعة، أو انحشار آلية الصرف. لذلك توجد حاجة ملحة إلى نظام يستطيع صرف الجرعة والتحقق من نتيجة الصرف بدقة.
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-base">السؤال البحثي</h4>
              <p className="text-xs text-slate-300">
                إلى أي مدى يمكن لنظام رواء، عند دمج آلية الصرف الميكانيكية مع نظام استشعار مزدوج ومنظومة طاقة وتبريد متعددة المصادر، أن يتحقق من دقة صرف الجرعات ويكتشف حالات الصرف غير الصحيح والانحشار؟
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-base">الفرضية العلمية</h4>
              <p className="text-xs text-slate-300">
                إذا دمجت آلية ميكانيكية لصرف جرعة واحدة مع مستشعر للتحقق من مرور الجرعة ومستشعر وزن للتحقق من الكمية المصروفة، فمن المتوقع أن يتمكن النظام من التمييز بصورة أفضل بين حالات الصرف الصحيحة وغير الصحيحة مقارنة بالاعتماد على أمر الصرف الإلكتروني وحده.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'methodology' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2 space-x-reverse">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span>مبدأ عمل النظام والتصميم الهندسي</span>
              </h3>
              <p className="leading-relaxed">
                التخزين → فصل الجرعة → الصرف الميكانيكي → التحقق من المرور → قياس الوزن → تحليل البيانات → تحديد حالة الصرف → تسجيل النتيجة → التنبيه عند وجود خلل.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h5 className="font-bold text-cyan-400 text-xs mb-1">وحدة الفصل الميكانيكي</h5>
                <p className="text-[11px] text-slate-400">تعتمد على 12 آلية تفصل جرعة واحدة عن بقية الجرعات وتوجهها إلى منطقة التحقق.</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h5 className="font-bold text-blue-400 text-xs mb-1">الاستشعار المزدوج</h5>
                <p className="text-[11px] text-slate-400">مستشعر المرور (Optical) ومستشعر الوزن (Load Cells) لتقييم دقيق ثنائي المؤشر.</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h5 className="font-bold text-emerald-400 text-xs mb-1">الطاقة والتبريد</h5>
                <p className="text-[11px] text-slate-400">كهرباء رئيسية، طاقة شمسية، بطاريات ليثيوم، وتبخير مائي للتحكم الحراري.</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'references' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2 space-x-reverse">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span>المراجع العلمية المعتمدة</span>
              </h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <strong>World Health Organization (WHO).</strong> Medication Without Harm: Global burden of preventable medication-related harm in health care, 2024.
                </li>
                <li className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <strong>Gallina, M., Testagrossa, M., & Provenzani, A. (2026).</strong> Unit dose drug dispensing systems in hospitals: a systematic review of medication error reduction. European Journal of Hospital Pharmacy.
                </li>
                <li className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <strong>National Institute of Standards and Technology (NIST).</strong> Yee, K. W. (1992). Automation of Strain-Gauge Load-Cell Force Calibration. NIST IR 4823.
                </li>
                <li className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <strong>ASHRAE Handbook.</strong> Evaporative Cooling and Thermal Control Principles in Medical Storage Devices.
                </li>
              </ul>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
