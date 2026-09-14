import React from 'react';
import { createPortal } from 'react-dom';
import { useSchool } from '../../context/SchoolContext';
import { Printer, X, ShieldCheck, Crown, Calendar, Sparkles, Building2, Phone, Mail } from 'lucide-react';

interface SchoolProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolProposalModal: React.FC<SchoolProposalModalProps> = ({ isOpen, onClose }) => {
  const { currentSchool } = useSchool();
  const upgradeContact = import.meta.env.VITE_UPGRADE_CONTACT || 'support@init65.co.in';

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto border-2 border-orange-300 print:border-none print:shadow-none print:rounded-none print:max-w-none print:m-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action Header (Hidden in Print) */}
        <div className="bg-gradient-to-r from-orange-800 to-amber-700 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-yellow-300" />
            <h3 className="font-bold text-sm sm:text-base">
              प्रस्ताव पत्र व संस्थागत कोटेशन (Official Proposal Letter)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-orange-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>A4 प्रिंट करें / PDF सेव करें</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="बंद करें"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body (A4 Layout) */}
        <div className="p-8 sm:p-12 text-stone-900 space-y-6 font-sans text-sm leading-relaxed print:p-8">
          
          {/* Letterhead */}
          <div className="border-b-2 border-orange-600 pb-5 text-center relative">
            <div className="flex items-center justify-center gap-3 mb-1">
              <span className="text-3xl text-orange-600">🪷</span>
              <h1 className="text-2xl sm:text-3xl font-black text-orange-800 tracking-tight">
                सरस्वती शिशु मंदिर डिजिटल ईआरपी
              </h1>
            </div>
            <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              विद्या भारती अखिल भारतीय शिक्षा संस्थान • स्वतंत्र तकनीकी सहयोग एवं अनुरक्षण
            </p>
            <p className="text-[11px] text-stone-500 mt-1 font-mono">
              वेबसाइट: www.init65.co.in • संपर्क: {upgradeContact}
            </p>
          </div>

          {/* Reference & Date */}
          <div className="flex justify-between items-center text-xs text-stone-600 pt-1">
            <span>
              <strong>पत्रांक:</strong> SSM-PROP/{new Date().getFullYear()}/{currentSchool.city?.toUpperCase() || 'UP'}
            </span>
            <span>
              <strong>दिनांक:</strong> {todayStr}
            </span>
          </div>

          {/* Addressee */}
          <div className="bg-orange-50/70 p-4 rounded-xl border border-orange-200">
            <p className="font-bold text-stone-800">प्रति,</p>
            <p className="font-bold text-orange-950 text-base">
              आदरणीय प्रधानाचार्य / प्रबंधक जी,
            </p>
            <p className="text-stone-700">
              {currentSchool.hindiName || currentSchool.name}
            </p>
            <p className="text-xs text-stone-600">
              {currentSchool.city}, {currentSchool.prant || 'विद्या भारती'}
            </p>
          </div>

          {/* Subject */}
          <div className="font-bold text-stone-900 border-l-4 border-orange-600 pl-3 py-1">
            विषय: विद्या भारती अनुरूप विद्यालय ईआरपी प्रबंधन एवं 15-दिवसीय पूर्ण निःशुल्क परीक्षण प्रस्ताव।
          </div>

          {/* Body Prose */}
          <div className="space-y-3 text-stone-800 text-xs sm:text-sm text-justify leading-relaxed">
            <p>
              <strong>सादर वन्दे। 🙏</strong>
            </p>
            <p>
              अत्यंत हर्ष के साथ सूचित किया जाता है कि हमने सरस्वती शिशु एवं विद्या मंदिरों की विशिष्ट आवश्यकताओं,
              <strong> पंचमुखी शिक्षा (शारीरिक, योग, संगीत, संस्कृत, नैतिक)</strong>, और राष्ट्रीय शिक्षा नीति (NEP 2020) के मानकों
              के पूर्ण अनुकूलन हेतु एक आधुनिक, सुरक्षित एवं सुगम डिजिटल ईआरपी प्रणाली विकसित की है।
            </p>
            <p>
              हम आपके प्रतिष्ठित विद्यालय <strong>"{currentSchool.hindiName || currentSchool.name}"</strong> को बिना किसी अग्रिम शुल्क
              अथवा वित्तीय बाध्यता के <strong>15 दिनों का पूर्ण निःशुल्क परीक्षण (15-Day Free Pilot Trial)</strong> सादर समर्पित करते हैं।
              आप स्वयं, आपके कक्षाचार्य एवं प्रबंध समिति इसका व्यावहारिक उपयोग कर इसके लाभों का प्रत्यक्ष अनुभव कर सकते हैं।
            </p>
          </div>

          {/* Transparent Quotation Table */}
          <div className="pt-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-700 mb-2">
              📊 संस्थागत वार्षिक तकनीकी सहयोग योजनाएं (Institutional AMC Support):
            </h4>
            <div className="border border-stone-300 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-orange-100 text-orange-950 font-bold border-b border-stone-300">
                    <th className="p-3 border-r border-stone-300">योजना (Plan Tier)</th>
                    <th className="p-3 border-r border-stone-300">सम्मिलित मुख्य सुविधाएं</th>
                    <th className="p-3 text-right">वार्षिक सहयोग शुल्क</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  <tr className="bg-white">
                    <td className="p-3 font-bold text-emerald-800 border-r border-stone-200">
                      १. निःशुल्क सेवा (Free Seva)
                    </td>
                    <td className="p-3 text-stone-700 border-r border-stone-200">
                      छात्र प्रवेश पंजिका, दैनिक उपस्थिति, मासिक शुल्क रसीदें, सूचना पट्ट एवं दैनिक वैदिक पंचांग।
                    </td>
                    <td className="p-3 text-right font-black text-emerald-700">
                      ₹0 / आजीवन
                    </td>
                  </tr>
                  <tr className="bg-amber-50/50">
                    <td className="p-3 font-bold text-orange-800 border-r border-stone-200">
                      २. परीक्षा व प्रगति पत्र (Academic Pack)
                    </td>
                    <td className="p-3 text-stone-700 border-r border-stone-200">
                      <strong>NEP 2020 360° समग्र प्रगति पत्र</strong>, बारकोड युक्त <strong>डिजिटल छात्र पहचान पत्र</strong>, आधिकारिक <strong>स्थानांतरण प्रमाण पत्र (TC)</strong> व TR सारिणी।
                    </td>
                    <td className="p-3 text-right font-black text-orange-700">
                      ₹3,999 / वर्ष <br />
                      <span className="text-[10px] text-stone-500 font-normal">(~₹330/माह)</span>
                    </td>
                  </tr>
                  <tr className="bg-orange-50/60">
                    <td className="p-3 font-bold text-amber-900 border-r border-stone-200">
                      ३. सम्पूर्ण प्रो ईआरपी (Full Smart ERP)
                    </td>
                    <td className="p-3 text-stone-700 border-r border-stone-200">
                      <strong>Academic Pack की समस्त सुविधाएं</strong> + <strong>आचार्य पेरोल</strong>, <strong>व्हाट्सएप त्वरित सूचना</strong>, <strong>1-क्लिक थोक उपस्थिति</strong> व समर्पित क्लाउड बैकअप।
                    </td>
                    <td className="p-3 text-right font-black text-amber-900">
                      ₹7,999 / वर्ष <br />
                      <span className="text-[10px] text-stone-500 font-normal">(~₹660/माह)</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Security & Ownership Pledge */}
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-300 text-xs text-emerald-950 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong>डेटा सुरक्षा एवं स्वामित्व गारंटी (DPDP Act 2023 Compliant):</strong>
              <p className="text-[11px] text-emerald-900 mt-0.5">
                विद्यालय के समस्त छात्र एवं शिक्षक डेटा का 100% स्वामित्व आपके विद्यालय का रहेगा। कोई व्यावसायिक विज्ञापन नहीं,
                कोई थर्ड-पार्टी ट्रैकिंग नहीं। संपूर्ण डेटा एन्क्रिप्टेड भारतीय सुरक्षित सर्वर पर सुरक्षित है।
              </p>
            </div>
          </div>

          {/* Signature Block */}
          <div className="pt-8 border-t border-stone-300 flex justify-between items-end text-xs">
            <div className="text-center space-y-8">
              <div className="h-10" />
              <p className="border-t border-stone-400 pt-1 font-bold text-stone-800">
                (स्वीकृति हस्ताक्षर एवं विद्यालय मुहर) <br />
                <span className="text-[10px] text-stone-500 font-normal">प्रधानाचार्य / प्रबंधक महोदय</span>
              </p>
            </div>

            <div className="text-center space-y-8">
              <div className="h-10 flex items-center justify-center">
                <span className="font-mono font-bold text-orange-700">init65 Technical Desk</span>
              </div>
              <p className="border-t border-stone-400 pt-1 font-bold text-stone-800">
                प्राधिकृत तकनीकी समन्वयक <br />
                <span className="text-[10px] text-stone-500 font-normal">ईआरपी विकास एवं सहयोग प्रकोष्ठ</span>
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>,
    document.body
  );
};
