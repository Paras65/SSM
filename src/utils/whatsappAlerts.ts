export function formatWhatsAppPhone(phone: string): string {
  if (!phone) return '';
  // Strip all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // If 10 digits (standard Indian mobile), prepend 91
  if (digits.length === 10) {
    return `91${digits}`;
  }
  // If starts with 0 and followed by 10 digits
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }
  // If already includes country code (e.g. 919876543210)
  return digits;
}

export function generateAbsenteeWhatsAppLink(params: {
  studentName: string;
  className: string;
  date: string;
  schoolName: string;
  phone: string;
}): string {
  const cleanPhone = formatWhatsAppPhone(params.phone);
  const text = 
`🚩 *सादर नमस्ते जी* 🚩
*${params.schoolName}*
--------------------------------
*दैनिक उपस्थिति सूचना:*
आपके पाल्य/पाल्या *${params.studentName}* (कक्षा: ${params.className}) आज दिनांक *${params.date}* को विद्यालय में अनुपस्थित रहे हैं।

कृपया अस्वस्थता अथवा अनुपस्थिति का कारण विद्यालय डायरी में दर्ज करें अथवा इस नंबर पर सूचित करने की कृपा करें।

धन्यवाद!
— कार्यालय, ${params.schoolName}`;

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
}

export function generateFeeReminderWhatsAppLink(params: {
  studentName: string;
  className: string;
  term: string;
  pendingAmount: number;
  schoolName: string;
  phone: string;
}): string {
  const cleanPhone = formatWhatsAppPhone(params.phone);
  const text = 
`🚩 *सादर नमस्ते जी* 🚩
*${params.schoolName}*
--------------------------------
*शिक्षण शुल्क अनुस्मारक सूचना:*
अभिभावक जी, आपके पाल्य/पाल्या *${params.studentName}* (कक्षा: ${params.className}) का *${params.term}* का शुल्क देय है:

💰 *देय धनराशि:* ₹${params.pendingAmount.toLocaleString('en-IN')}

कृपया ससमय विद्यालय कार्यालय अथवा ऑनलाइन माध्यम से शुल्क जमा कर अधिकृत रसीद प्राप्त करें।

सहयोग हेतु आभार!
— लेखा विभाग, ${params.schoolName}`;

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
}

export function generateGeneralNoticeWhatsAppLink(params: {
  title: string;
  content: string;
  schoolName: string;
  phone: string;
}): string {
  const cleanPhone = formatWhatsAppPhone(params.phone);
  const text = 
`🚩 *सरस्वती शिशु मंदिर आवश्यक सूचना* 🚩
*${params.schoolName}*
--------------------------------
📌 *${params.title}*

${params.content}

— प्रधानाचार्य / कार्यालय, ${params.schoolName}`;

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
}

export function generateReportCardWhatsAppMessage(params: {
  studentName: string;
  className: string;
  rollNo: string;
  term: string;
  academicYear: string;
  percentage: number;
  grade: string;
  moralConduct: string;
  acharyaRemarks: string;
  panchmukhi?: {
    sharirikGrade?: string;
    yogGrade?: string;
    sangeetGrade?: string;
    sanskritGrade?: string;
    naitikGrade?: string;
  };
  schoolName: string;
}): string {
  return (
`🚩 *सादर नमस्ते जी* 🚩
*${params.schoolName}*
--------------------------------
📜 *प्रगति पत्र (Student Progress Report Card)*
सत्र: ${params.academicYear} • ${params.term}

👤 *छात्र/छात्रा:* ${params.studentName}
🔢 *अनुक्रमांक (Roll No):* ${params.rollNo}
🏫 *कक्षा:* ${params.className}

📊 *शैक्षणिक परिणाम:*
• प्राप्तांक प्रतिशत: *${params.percentage.toFixed(2)}%*
• अंतिम श्रेणी: *${params.grade}*
• नैतिक एवं संस्कार आचरण: *${params.moralConduct}*
${params.panchmukhi ? `
🌟 *पंचमुखी शिक्षा सर्वांगीण मूल्यांकन (NEP 2020 HPC):*
• शारीरिक विकास: *${params.panchmukhi.sharirikGrade || 'A+'}*
• योग एवं प्राणायाम: *${params.panchmukhi.yogGrade || 'A+'}*
• संगीत एवं घोष: *${params.panchmukhi.sangeetGrade || 'A'}*
• संस्कृत संभाषण व श्लोक: *${params.panchmukhi.sanskritGrade || 'O'}*
• नैतिक एवं आध्यात्मिक: *${params.panchmukhi.naitikGrade || 'O'}*` : ''}

✍️ *कक्षाचार्य सम्मति:*
"${params.acharyaRemarks}"

विद्यार्थी के उज्ज्वल भविष्य एवं राष्ट्रसेवा की मंगलकामनाओं सहित!
— प्रधानाचार्य एवं आचार्य परिवार, ${params.schoolName}`
  );
}

export function generateReportCardWhatsAppLink(params: {
  studentName: string;
  className: string;
  rollNo: string;
  term: string;
  academicYear: string;
  percentage: number;
  grade: string;
  moralConduct: string;
  acharyaRemarks: string;
  panchmukhi?: {
    sharirikGrade?: string;
    yogGrade?: string;
    sangeetGrade?: string;
    sanskritGrade?: string;
    naitikGrade?: string;
  };
  schoolName: string;
  phone: string;
}): string {
  const cleanPhone = formatWhatsAppPhone(params.phone);
  const text = generateReportCardWhatsAppMessage(params);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
}

