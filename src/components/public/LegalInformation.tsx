import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const LegalInformation: React.FC = () => {
  const { language, t } = useLanguage();
  const content = language === 'hi'
    ? {
        privacy: 'यह मंच अभिभावक या अधिकृत संरक्षक द्वारा दी गई छात्र एवं संपर्क जानकारी केवल प्रवेश पूछताछ को चुनी गई शाखा तक भेजने और विद्यालय प्रबंधन सेवाएं देने के लिए एकत्र करता है। जानकारी उसी शाखा और उसके अधिकृत कर्मचारियों के साथ साझा की जाती है।',
        rights: 'आप चुनी गई शाखा से अपने डेटा की जानकारी, सुधार, सहमति वापस लेने या कानून के अनुसार हटाने का अनुरोध कर सकते हैं। छात्र जानकारी का उपयोग विज्ञापन या अनावश्यक प्रोफाइलिंग के लिए नहीं किया जाता।',
        terms: 'शाखा प्रशासक अपने विद्यालय के लिए दर्ज रिकॉर्ड की शुद्धता, वैध उपयोग, संरक्षण और अवधि के लिए जिम्मेदार हैं। प्रवेश विवरण और प्रमाण-पत्र साझा नहीं किए जाने चाहिए।',
        review: 'यह सूचना प्रारूप है और उत्पादन उपयोग से पहले विद्यालय संगठन तथा योग्य कानूनी सलाहकार द्वारा अनुमोदित की जानी चाहिए।'
      }
    : {
        privacy: 'This platform collects student and contact information submitted by a parent or authorised guardian only to route an admission enquiry to the selected branch and provide school-management services. Information is shared with that branch and its authorised staff.',
        rights: 'You may request access, correction, withdrawal of consent, or deletion where legally permitted by contacting the selected branch. Student information is not used for advertising or unrelated profiling.',
        terms: 'Branch administrators are responsible for the accuracy, lawful use, protection, and retention of records entered for their school. Credentials and admission details must not be shared.',
        review: 'This is draft product wording and must be reviewed and approved by the school organisation and qualified legal counsel before production use.'
      };

  return (
    <section id="privacy" className="bg-stone-100 border-t border-stone-200 py-10 text-sm text-stone-700">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h2 className="text-xl font-bold text-stone-900">{t('privacyNotice')}</h2>
        <p className="mt-2 leading-relaxed">{content.privacy}</p>
        <p className="mt-2 leading-relaxed">{content.rights}</p>
      </div>
      <div id="terms">
        <h2 className="text-xl font-bold text-stone-900">{t('termsOfUse')}</h2>
        <p className="mt-2 leading-relaxed">{content.terms}</p>
      </div>
      <p className="text-xs text-stone-500">{content.review}</p>
    </div>
  </section>
  );
};
