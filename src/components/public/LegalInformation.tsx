import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const LegalInformation: React.FC = () => {
  const { language, t } = useLanguage();
  const content = language === 'hi'
    ? {
        dpdpTitle: 'डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम (DPDPA 2023) अनुपालन',
        privacy: 'यह सॉफ्टवेयर मंच (SSM ERP) भारतीय डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 (DPDP Act, 2023) के प्रावधानों के अनुरूप संचालित होता है। छात्र-छात्राओं के व्यक्तिगत विवरण केवल अधिकृत अभिभावक अथवा संरक्षक की वैध सहमति से ही प्रवेश व विद्यालयी प्रबंधन सेवाओं हेतु एकत्र किए जाते हैं।',
        rights: 'अभिभावकों को अपने बच्चे के डेटा तक पहुंच, उसमें संशोधन, सहमति वापस लेने अथवा कानूनी आवश्यकता समाप्त होने पर डेटा हटाने (Right to Erasure) का पूर्ण अधिकार है। छात्रों के डेटा का उपयोग किसी भी प्रकार के व्यावसायिक विज्ञापनों, ट्रैकिंग अथवा तृतीय-पक्ष प्रोफाइलिंग के लिए कदापि नहीं किया जाता।',
        securityTitle: 'आईटी अधिनियम 2000 एवं सूचना सुरक्षा (IT Act 2000)',
        security: 'सभी पासवर्ड एवं सत्र टोकन उद्योग-मानक एन्क्रिप्शन (JWT) द्वारा सुरक्षित हैं। अनुचित पहुंच की रोकथाम हेतु ऑडिट लॉग्स और सुरक्षा दर सीमाएं (Rate Limits) सक्रिय हैं।',
        termsTitle: 'उपयोग की शर्तें एवं बौद्धिक संपदा (Terms of Use & IP)',
        terms: 'यह सॉफ्टवेयर init65.co.in द्वारा स्वतंत्र रूप से निर्मित एवं संचालित है। प्रत्येक विद्यालय शाखा अपने द्वारा दर्ज छात्र एवं वित्तीय अभिलेखों की सत्यता हेतु उत्तरदायी है। विद्या भारती एवं सरस्वती शिशु मंदिर के नाम एवं ध्येय वाक्यों का उल्लेख केवल शैक्षणिक व सांस्कृतिक संदर्भ हेतु निष्पक्ष उपयोग (Fair Use) के तहत किया गया है।',
        developerNote: 'सॉफ्टवेयर अधिकार © 2026 init65.co.in। सर्वाधिकार सुरक्षित।'
      }
    : {
        dpdpTitle: 'Digital Personal Data Protection Act (DPDPA 2023) Compliance',
        privacy: 'This platform operates in strict compliance with the Indian Digital Personal Data Protection Act, 2023 (DPDPA 2023). Student personal data is processed strictly under verifiable parental or legal guardian consent for school administration and academic tracking.',
        rights: 'Parents/guardians retain the statutory right to access, correct, withdraw consent, or request erasure of their children\'s records. Student data is never sold, used for commercial advertisements, or shared for third-party profiling.',
        securityTitle: 'Information Technology Act (IT Act 2000) & Security Safeguards',
        security: 'All authentication sessions are cryptographically signed with JWT tokens. Multi-tenant isolation and administrative audit logs are maintained to prevent unauthorized data access.',
        termsTitle: 'Terms of Use & Intellectual Property (IP)',
        terms: 'This software is independently engineered and owned by init65.co.in. Each school branch is solely responsible for the accuracy and lawful retention of records entered. Traditional educational terms associated with Vidya Bharati are referenced under fair use for educational context.',
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
