export type Gender = 'Bhaiya' | 'Bahin';

export type SchoolPlan = 'free' | 'pro';

export type ProFeatureKey = 
  | 'staff_payroll' 
  | 'reports_patra' 
  | 'whatsapp_alerts' 
  | 'id_cards' 
  | 'transfer_cert' 
  | 'bulk_attendance' 
  | 'csv_export';

export interface School {
  id: string;
  name: string;
  hindiName: string;
  tagline: string;
  affiliate: string;
  affiliationNo: string;
  established: string;
  address: string;
  city: string;
  state: string;
  prant: string;
  phone: string;
  email: string;
  timings: string;
  principalName: string;
  adminPasscode: string;
  plan?: SchoolPlan;
}

export interface Student {
  id: string;
  schoolId?: string;
  rollNo: string;
  name: string;
  gender: Gender;
  class: string;
  section: string;
  fatherName: string;
  motherName: string;
  contact: string;
  address: string;
  dob: string;
  admissionDate: string;
  bloodGroup: string;
  photoUrl?: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Leave';

export interface AttendanceRecord {
  id: string;
  schoolId?: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
}

export interface FeeRecord {
  id: string;
  schoolId?: string;
  studentId: string;
  term: string;
  academicYear: string;
  totalAmount: number;
  paidAmount: number;
  status: 'Paid' | 'Pending' | 'Partial';
  paidDate?: string;
  receiptNo?: string;
  paymentMode?: string;
}

export interface SubjectMarks {
  subject: string;
  code: string;
  maxMarks: number;
  marksObtained: number;
  grade: string;
}

export interface PanchmukhiDimension {
  grade: string; // 'O' | 'A+' | 'A' | 'B';
  skills: string;
  remarks: string;
}

export interface PanchmukhiEvaluation {
  sharirik: PanchmukhiDimension;
  yog: PanchmukhiDimension;
  sangeet: PanchmukhiDimension;
  sanskrit: PanchmukhiDimension;
  naitik: PanchmukhiDimension;
}

export interface ReportCard {
  id: string;
  schoolId?: string;
  studentId: string;
  examTerm: string;
  academicYear: string;
  marks: SubjectMarks[];
  totalMax: number;
  totalObtained: number;
  percentage: number;
  grade: string;
  acharyaRemarks: string;
  attendancePercentage: number;
  moralConduct: string; // 'उत्तम' | 'अति उत्तम' | 'श्रेष्ठ'
  panchmukhiEvaluation?: PanchmukhiEvaluation;
}

export interface Notice {
  id: string;
  schoolId?: string;
  title: string;
  category: 'Academics' | 'Events' | 'Examinations' | 'Holidays' | 'Vidya Bharati';
  date: string;
  content: string;
  isUrgent?: boolean;
}

export interface Prayer {
  id: string;
  title: string;
  subtitle: string;
  sanskrit: string;
  hindi: string;
  occasion: string;
}

export interface Acharya {
  id: string;
  name: string;
  title: string; // 'आचार्य जी' or 'दीदी जी'
  designation: string;
  qualification: string;
  subjects: string[];
  experience: string;
}

export interface PanchmukhiPillar {
  id: string;
  title: string;
  hindiTitle: string;
  sanskritMotto: string;
  description: string;
  activities: string[];
  color: string;
}

export type ViewMode = 'public' | 'admin' | 'student';

export interface Homework {
  id: string;
  schoolId?: string;
  class: string;
  section?: string;
  subject: string;
  title: string;
  description: string;
  assignedBy: string;
  date: string;
  dueDate: string;
  status?: 'Active' | 'Completed';
  createdAt?: string;
}

export interface Staff {
  id: string;
  schoolId?: string;
  name: string;
  gender: 'Acharya' | 'Didi';
  designation: string;
  qualification?: string;
  subjects?: string;
  phone: string;
  email?: string;
  monthlySalary: number;
  basicPay?: number;
  daHra?: number;
  pfDeduction?: number;
  samitiDeduction?: number;
  joiningDate: string;
  status: 'Active' | 'OnLeave' | 'Resigned';
}

