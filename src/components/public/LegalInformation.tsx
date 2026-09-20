import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const LegalInformation: React.FC = () => {
  const { language, t } = useLanguage();
  const content = language === 'hi'
    ? {
        dpdpTitle: 'डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम (DPDPA 2023) अनुपालन',
        privacy: 'यह सॉफ्टवेयर मंच भारतीय डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 (DPDP Act, 2023) के प्रावधानों के अनुरूप संचालित होता है। संबंधित विद्यालय संस्था अपने विद्यार्थियों एवं अभिभावकों के डेटा की विधिक संरक्षक (Data Fiduciary / Controller) है, तथा यह मंच केवल अधिकृत शैक्षणिक एवं प्रशासनिक प्रबंधन हेतु सुरक्षित डेटा संसाधन (Data Processor) उपलब्ध कराता है। छात्र-छात्राओं के व्यक्तिगत विवरण अभिभावक की सहमति से ही दर्ज किए जाते हैं।',
        rights: 'अभिभावकों को अपने बच्चे के डेटा तक पहुंच, उसमें संशोधन, तथा कानूनी आवश्यकताओं के अनुरूप डेटा हटाने का अधिकार है। विद्यार्थियों का डेटा किसी भी प्रकार के व्यावसायिक विज्ञापनों, ट्रैकिंग अथवा तृतीय-पक्ष प्रोफाइलिंग के लिए कदापि साझा या विक्रय नहीं किया जाता।',
        securityTitle: 'आईटी अधिनियम 2000 एवं संस्थागत डेटा सुरक्षा (IT Act 2000)',
        security: 'सभी पासवर्ड एवं सत्र उद्योग-मानक एन्क्रिप्शन, बहु-स्तरीय प्रमाणीकरण तथा रोल-आधारित अभिगम नियंत्रण द्वारा सुरक्षित हैं। आकस्मिक डेटा सुरक्षा एवं संस्थागत निरंतरता हेतु विद्यालय प्रबंधन को नियमित रूप से 1-क्लिक ऑफ़लाइन बैकअप डाउनलोड कर सुरक्षित रखने की सुविधा व अनुशंसा दी जाती है।',
        termsTitle: 'उपयोग की शर्तें एवं बौद्धिक संपदा (Terms of Use & IP)',
        terms: 'यह सॉफ्टवेयर मंच init65.co.in द्वारा स्वतंत्र रूप से निर्मित एवं संचालित शैक्षणिक प्रबंधन प्रणाली है। प्रत्येक विद्यालय शाखा अपने द्वारा दर्ज छात्र, परीक्षा एवं वित्तीय अभिलेखों की सत्यता व विधिक संधारण हेतु पूर्णतः उत्तरदायी है। विद्या भारती एवं सरस्वती शिशु मंदिर के नाम एवं ध्येय वाक्यों का उल्लेख केवल शैक्षणिक व सांस्कृतिक संदर्भ हेतु निष्पक्ष उपयोग (Fair Use) के तहत किया गया है।',
        developerNote: 'सॉफ्टवेयर अधिकार © 2026 init65.co.in। सर्वाधिकार सुरक्षित।'
      }
    : {
        dpdpTitle: 'Digital Personal Data Protection Act (DPDPA 2023) Compliance',
        privacy: 'This platform operates in alignment with the Indian Digital Personal Data Protection Act, 2023 (DPDPA 2023). The respective school institution acts as the Data Fiduciary/Controller, while this ERP serves as a secure Data Processor for lawful educational administration. Student records are processed under parental or guardian consent.',
        rights: 'Parents and guardians retain statutory rights to access, review, correct, or request deletion of student records in accordance with law. Student data is strictly confidential and is never sold, monetized, or shared for commercial advertising or profiling.',
        securityTitle: 'Information Technology Act (IT Act 2000) & Data Continuity',
        security: 'All administrative sessions are protected using industry-standard cryptographic encryption, multi-tenant isolation, and bounded access controls. To ensure institutional data sovereignty and disaster resilience, school administrators are provided with and advised to maintain regular 1-click offline encrypted backups.',
        termsTitle: 'Terms of Use & Intellectual Property (IP)',
        terms: 'This software is an independently engineered school management platform owned by init65.co.in. Each subscribing school branch is solely responsible for the authenticity, lawful collection, and retention of student and financial records entered. Cultural and educational terms associated with Vidya Bharati and Saraswati Shishu Mandir are referenced under fair use for educational context.',
        developerNote: 'Software Copyright © 2026 init65.co.in. All rights reserved.'
      };

  return (
    <section id="privacy" className="bg-stone-100 border-t border-stone-200 py-12 text-xs sm:text-sm text-stone-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 flex items-center gap-2">
            <span>🛡️</span>
            <span>{content.dpdpTitle}</span>
          </h2>
          <p className="mt-2.5 leading-relaxed">{content.privacy}</p>
          <p className="mt-2 leading-relaxed">{content.rights}</p>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 flex items-center gap-2">
            <span>🔒</span>
            <span>{content.securityTitle}</span>
          </h2>
          <p className="mt-2.5 leading-relaxed">{content.security}</p>
        </div>

        <div id="terms">
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 flex items-center gap-2">
            <span>📜</span>
            <span>{content.termsTitle}</span>
          </h2>
          <p className="mt-2.5 leading-relaxed">{content.terms}</p>
        </div>

        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 gap-2">
          <span>{content.developerNote}</span>
          <a href="https://www.init65.co.in" target="_blank" rel="noopener noreferrer" className="text-orange-700 font-bold hover:underline">
            init65.co.in
          </a>
        </div>
      </div>
    </section>
  );
};
