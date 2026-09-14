/**
 * WhatsApp Direct Messaging Utilities
 * Generates direct wa.me URLs with pre-formatted Hindi messages for zero-cost communication.
 */

export function cleanIndianPhone(phone: string): string | null {
  if (!phone) return null;
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 10) return null;
  const last10 = digitsOnly.slice(-10);
  return `91${last10}`;
}

export function generateAdmissionWhatsAppUrl(
  phone: string,
  studentName: string,
  applyingClass: string,
  schoolName: string,
  schoolCity: string
): string | null {
  const formattedPhone = cleanIndianPhone(phone);
  if (!formattedPhone) return null;

  const message = `सादर प्रणाम। 🙏\n\nसरस्वती शिशु मंदिर (${schoolCity}) द्वारा सूचित किया जाता है कि आपके पाल्य *${studentName}* का *${applyingClass}* हेतु नवीन प्रवेश आवेदन सफलतापूर्वक प्राप्त हो गया है।\n\nकृपया प्रवेश प्रक्रिया पूर्ण करने हेतु आवश्यक दस्तावेजों (जन्म प्रमाण पत्र, आधार कार्ड व पासपोर्ट फोटो) सहित विद्यालय कार्यालय में संपर्क करें।\n\n- प्रधानाचार्य\n${schoolName}`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

export function generateFeeReminderWhatsAppUrl(
  phone: string,
  studentName: string,
  studentClass: string,
  month: string,
  amount: number | string,
  schoolCity: string
): string | null {
  const formattedPhone = cleanIndianPhone(phone);
  if (!formattedPhone) return null;

  const message = `सादर प्रणाम। 🙏\n\nसरस्वती शिशु मंदिर (${schoolCity}) से सादर निवेदन है कि आपके पाल्य *${studentName}* (कक्षा: *${studentClass}*) का *${month}* माह का विद्यालय शुल्क *₹${amount}* देय है।\n\nकृपया समयानुसार विद्यालय कार्यालय में शुल्क जमा कर आधिकारिक रसीद प्राप्त करें।\n\nसहयोग हेतु सादर धन्यवाद।\n- कार्यालय, सरस्वती शिशु मंदिर`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

export function generateAttendanceAlertWhatsAppUrl(
  phone: string,
  studentName: string,
  studentClass: string,
  date: string,
  status: string,
  schoolCity: string
): string | null {
  const formattedPhone = cleanIndianPhone(phone);
  if (!formattedPhone) return null;

  const statusHindi = status === 'Absent' ? 'अनुपस्थित (Absent)' : status === 'Leave' ? 'अवकाश (Leave)' : 'उपस्थित (Present)';

  const message = `सादर प्रणाम। 🙏\n\nसरस्वती शिशु मंदिर (${schoolCity}) दैनिक उपस्थिति सूचना:\nआपका पाल्य *${studentName}* (कक्षा: *${studentClass}*) आज दिनांक *${date}* को विद्यालय में *${statusHindi}* है।\n\n- कक्षाचार्य, सरस्वती शिशु मंदिर`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

export function generateSchoolOnboardingWhatsAppUrl(
  phone: string,
  schoolName: string,
  city: string,
  principalName: string,
  adminPasscode: string,
  affiliationNo: string,
  isPro: boolean
): string | null {
  const formattedPhone = cleanIndianPhone(phone);
  if (!formattedPhone) return null;

  const planText = isPro
    ? '15-दिवसीय पूर्ण निःशुल्क प्रो ट्रायल (15-Day Free Trial Activated)'
    : 'निःशुल्क सेवा (Free Seva Tier)';

  const originUrl = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://ssm.edu.in';

  const message = `सादर प्रणाम। 🙏\n\nसरस्वती शिशु मंदिर ईआरपी पोर्टल पर आपके विद्यालय *${schoolName}* (${city}) का पंजीकरण सफलतापूर्वक संपन्न हुआ।\n\n*पंजीकरण एवं लॉगिन विवरण:*\n• सम्बद्धता क्रमांक: *${affiliationNo}*\n• प्रधानाचार्य: *${principalName}*\n• एडमिन पासकोड: *${adminPasscode}*\n• सक्रिय योजना: *${planText}*\n• ईआरपी पोर्टल: ${originUrl}\n\nअब आप इस पासकोड से एडमिन डैशबोर्ड में लॉगिन कर छात्र पंजिका, उपस्थिति, शुल्क एवं परीक्षा प्रबंधन तुरंत शुरू कर सकते हैं।\n\n- विद्या भारती अखिल भारतीय शिक्षा संस्थान`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

