import type { Student, ReportCard } from '../types';

export interface StudentResultRow {
  student: Student;
  report?: ReportCard;
  subjectScores: Record<string, { obtained: number; max: number; grade: string }>;
  grandTotalObtained: number;
  grandTotalMax: number;
  percentage: number;
  overallGrade: string;
  division: 'प्रथम (I)' | 'द्वितीय (II)' | 'तृतीय (III)' | 'अनुत्तीर्ण (Fail)' | 'अपेक्षित (Awaited)';
  resultStatus: 'उत्तीर्ण (PASS)' | 'पूरक (COMP)' | 'अनुत्तीर्ण (FAIL)' | 'अनुपस्थित (ABS)' | 'लंबित (PENDING)';
  failedSubjectsCount: number;
}

export interface ClassTabulationStatistics {
  totalStudents: number;
  evaluatedCount: number;
  passCount: number;
  firstDivCount: number;
  secondDivCount: number;
  thirdDivCount: number;
  compCount: number;
  failCount: number;
  passPercentage: number;
  avgPercentage: number;
  topper: { name: string; rollNo: string; pct: number } | null;
}

export const DEFAULT_SUBJECT_LIST = [
  'हिन्दी',
  'अंग्रेज़ी',
  'संस्कृत',
  'गणित',
  'विज्ञान',
  'सामाजिक विज्ञान',
  'कम्प्यूटर',
  'नैतिक शिक्षा'
];

export function computeGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 75) return 'A';
  if (percentage >= 60) return 'B';
  if (percentage >= 45) return 'C';
  if (percentage >= 33) return 'D';
  return 'E';
}

export function computeStudentResultRow(
  student: Student,
  report: ReportCard | undefined,
  classSubjects: string[]
): StudentResultRow {
  const subjectScores: Record<string, { obtained: number; max: number; grade: string }> = {};
  let totalObt = 0;
  let totalMax = 0;
  let failedSubs = 0;

  if (report && Array.isArray(report.marks) && report.marks.length > 0) {
    report.marks.forEach(m => {
      const maxMarks = m.maxMarks || 100;
      const obtained = m.marksObtained ?? 0;
      subjectScores[m.subject] = {
        obtained,
        max: maxMarks,
        grade: m.grade || computeGrade(maxMarks > 0 ? (obtained / maxMarks) * 100 : 0)
      };
      totalObt += obtained;
      totalMax += maxMarks;

      const subPct = maxMarks > 0 ? (obtained / maxMarks) * 100 : 0;
      if (subPct < 33) {
        failedSubs++;
      }
    });

    // For any classSubjects not explicitly in report marks
    classSubjects.forEach(sub => {
      if (!subjectScores[sub]) {
        subjectScores[sub] = { obtained: 0, max: 100, grade: '-' };
      }
    });
  } else {
    classSubjects.forEach(sub => {
      subjectScores[sub] = { obtained: 0, max: 100, grade: '-' };
    });
    totalMax = classSubjects.length * 100;
  }

  const percentage = totalMax > 0 ? (totalObt / totalMax) * 100 : 0;
  const overallGrade = computeGrade(percentage);

  let division: StudentResultRow['division'] = 'अपेक्षित (Awaited)';
  if (report && report.marks && report.marks.length > 0) {
    if (percentage >= 60 && failedSubs === 0) division = 'प्रथम (I)';
    else if (percentage >= 45 && failedSubs === 0) division = 'द्वितीय (II)';
    else if (percentage >= 33 && failedSubs === 0) division = 'तृतीय (III)';
    else division = 'अनुत्तीर्ण (Fail)';
  }

  let resultStatus: StudentResultRow['resultStatus'] = 'लंबित (PENDING)';
  if (report && report.marks && report.marks.length > 0) {
    if (failedSubs === 0 && percentage >= 33) resultStatus = 'उत्तीर्ण (PASS)';
    else if (failedSubs === 1) resultStatus = 'पूरक (COMP)';
    else resultStatus = 'अनुत्तीर्ण (FAIL)';
  }

  return {
    student,
    report,
    subjectScores,
    grandTotalObtained: totalObt,
    grandTotalMax: totalMax,
    percentage,
    overallGrade,
    division,
    resultStatus,
    failedSubjectsCount: failedSubs
  };
}

export function computeClassStatistics(studentResults: StudentResultRow[]): ClassTabulationStatistics {
  const totalStudents = studentResults.length;
  let evaluatedCount = 0;
  let passCount = 0;
  let firstDivCount = 0;
  let secondDivCount = 0;
  let thirdDivCount = 0;
  let compCount = 0;
  let failCount = 0;
  let totalPctSum = 0;
  let topper: { name: string; rollNo: string; pct: number } | null = null;

  studentResults.forEach(r => {
    if (r.report && r.report.marks && r.report.marks.length > 0) {
      evaluatedCount++;
      totalPctSum += r.percentage;

      if (r.resultStatus === 'उत्तीर्ण (PASS)') passCount++;
      if (r.division === 'प्रथम (I)') firstDivCount++;
      else if (r.division === 'द्वितीय (II)') secondDivCount++;
      else if (r.division === 'तृतीय (III)') thirdDivCount++;

      if (r.resultStatus === 'पूरक (COMP)') compCount++;
      if (r.resultStatus === 'अनुत्तीर्ण (FAIL)') failCount++;

      if (!topper || r.percentage > topper.pct) {
        topper = {
          name: r.student.name,
          rollNo: r.student.rollNo,
          pct: r.percentage
        };
      }
    }
  });

  const passPercentage = evaluatedCount > 0 ? (passCount / evaluatedCount) * 100 : 0;
  const avgPercentage = evaluatedCount > 0 ? totalPctSum / evaluatedCount : 0;

  return {
    totalStudents,
    evaluatedCount,
    passCount,
    firstDivCount,
    secondDivCount,
    thirdDivCount,
    compCount,
    failCount,
    passPercentage,
    avgPercentage,
    topper
  };
}

export function generateTabulationCSV(
  studentResults: StudentResultRow[],
  classSubjects: string[]
): string {
  const headers = [
    'क्र_सं',
    'अनुक्रमांक',
    'छात्र_का_नाम',
    'पिता_का_नाम',
    'कक्षा',
    'वर्ग',
    ...classSubjects.map(sub => `${sub}_प्राप्तांक`),
    'कुल_पूर्णांक',
    'कुल_प्राप्तांक',
    'प्रतिशत',
    'ग्रेड',
    'श्रेणी',
    'परिणाम'
  ];

  const rows = studentResults.map((row, idx) => {
    const subMarks = classSubjects.map(sub => row.subjectScores[sub]?.obtained ?? 0);
    return [
      idx + 1,
      row.student.rollNo,
      `"${(row.student.name || '').replace(/"/g, '""')}"`,
      `"${(row.student.fatherName || '').replace(/"/g, '""')}"`,
      row.student.class,
      row.student.section,
      ...subMarks,
      row.grandTotalMax,
      row.grandTotalObtained,
      `${row.percentage.toFixed(1)}%`,
      row.overallGrade,
      row.division,
      row.resultStatus
    ];
  });

  return '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
