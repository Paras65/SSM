export type Gender = 'Bhaiya' | 'Bahin';

export const SSM_CLASSES = [
  'Arun (Nursery)',
  'Uday (LKG)',
  'Prabhat (UKG)',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12'
] as const;

export type SSMClass = typeof SSM_CLASSES[number];

/**
 * Standard numbered classes (Class 1 to Class 12) for exams, question papers, and marks matrices.
 */
export const SSM_STANDARD_CLASSES = SSM_CLASSES.filter(c => c.startsWith('Class')) as readonly string[];

export type SchoolPlan = 'free' | 'pro';

export type ProFeatureKey = 
  | 'staff_payroll' 
  | 'reports_patra' 
  | 'whatsapp_alerts' 
  | 'id_cards' 
  | 'transfer_cert' 
  | 'bulk_attendance' 
  | 'csv_export';

export interface SchoolFeatures {
  enableDynamicUpi?: boolean;
  upiVpa?: string;
  upiPayeeName?: string;
  enableStaffAttendanceLop?: boolean;
  lopDeductionRate?: number;
  enableAuditLogging?: boolean;
}

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
  currentAcademicYear?: string;
  tokenVersion?: number;
  plan?: SchoolPlan;
  status?: 'active' | 'suspended' | 'discontinued';
  discontinuedAt?: string;
  discontinuationReason?: string;
  udiseCode?: string;
  website?: string;
  features?: SchoolFeatures;
  sankulCluster?: string;
  enrolledStudentsCount?: number;
  totalTeachersCount?: number;
  attendanceRate?: number;
  feeRecoveryRate?: number;
}

export interface StudentAcademicHistory {
  academicYear: string;
  class: string;
  section: string;
  rollNo: string;
  status: string;
  promotedAt: string;
  remarks?: string;
}

export type SocialCategory = 'General' | 'OBC' | 'SC' | 'ST';

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
  pin?: string;
  admissionDate: string;
  bloodGroup: string;
  photoUrl?: string;
  academicYear?: string;
  status?: 'active' | 'promoted' | 'alumni' | 'transferred';
  academicHistory?: StudentAcademicHistory[];
  transportRouteId?: string;
  transportStop?: string;
  // Family & Sibling linkage
  familyId?: string;
  // Legal Guardianship, Custody & Authorized Pickup
  guardianship?: {
    primaryGuardian?: 'Mother' | 'Father' | 'Legal Guardian' | 'Other';
    guardianName?: string;
    authorizedPickupPersons?: {
      name: string;
      relation: string;
      phone: string;
      photoUrl?: string;
    }[];
    custodyAlert?: {
      hasRestriction: boolean;
      remarks?: string;
      alertStaffOnPickup?: boolean;
    };
  };
  // UDISE+ SDMS Compliance Identifiers
  pen?: string; // Permanent Education Number (11 digits, Govt of India)
  apaarId?: string; // Automated Permanent Academic Account Registry (12 digits)
  socialCategory?: SocialCategory;
  cwsn?: boolean; // Children with Special Needs
  bpl?: boolean; // Below Poverty Line
  motherTongue?: string;
  minorityGroup?: string;
  disabilityType?: string;
  udiseStatus?: {
    gp: boolean; // General Profile
    ep: boolean; // Enrollment Profile
    fp: boolean; // Facility Profile
  };
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Leave';

export interface AttendanceRecord {
  id: string;
  schoolId?: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  academicYear?: string;
  class?: string;
}

export interface FeeRecord {
  id: string;
  schoolId?: string;
  studentId: string;
  term: string;
  academicYear: string;
  totalAmount: number;
  paidAmount: number;
  status: 'Paid' | 'Pending' | 'Partial' | 'Under Clearance' | 'Cleared' | 'Bounced' | 'Refunded';
  concession?: number;
  concessionReason?: string;
  paidDate?: string;
  receiptNo?: string;
  paymentMode?: string;
}

export interface FeePaymentTransactionRecord {
  id: string;
  schoolId: string;
  feeId: string;
  studentId: string;
  amount: number;
  paymentMode: string;
  receiptNo: string;
  collectedBy: string;
  academicYear?: string;
  transactionDate: string;
  status?: 'Success' | 'Under Clearance' | 'Cleared' | 'Bounced' | 'Refunded';
  instrumentNo?: string;
  bankName?: string;
  clearingDate?: string;
}

export interface SubjectMarks {
  subject: string;
  code?: string;
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

export interface SelfAssessment {
  strengths: string;
  interests: string;
  myGoals: string;
  learningEnjoyment: string;
}

export interface PeerAssessment {
  peerName: string;
  collaborationGrade: string;
  empathyAndRespect: string;
  teamworkRemarks: string;
}

export interface ParentObservation {
  homeDiscipline: string;
  curiosityAndReading: string;
  parentRemarks: string;
}

export interface TwentyFirstCenturySkill {
  grade: string; // 'O' | 'A+' | 'A' | 'B';
  descriptor: string;
}

export interface TwentyFirstCenturySkills {
  criticalThinking: TwentyFirstCenturySkill;
  problemSolving: TwentyFirstCenturySkill;
  creativity: TwentyFirstCenturySkill;
  communication: TwentyFirstCenturySkill;
  digitalAwareness: TwentyFirstCenturySkill;
}

export interface HolisticEvaluation {
  selfAssessment?: SelfAssessment;
  peerAssessment?: PeerAssessment;
  parentObservation?: ParentObservation;
  twentyFirstCenturySkills?: TwentyFirstCenturySkills;
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
  holisticEvaluation?: HolisticEvaluation;
}

export interface Notice {
  id: string;
  schoolId?: string;
  title: string;
  category: 'Academics' | 'Events' | 'Examinations' | 'Holidays' | 'Vidya Bharati';
  date: string;
  content: string;
  isUrgent?: boolean;
  expiresAt?: string;
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

export type ViewMode = 'public' | 'admin' | 'student' | 'teacher' | 'sankul';

export interface SankulInspection {
  id: string;
  clusterName?: string;
  schoolId: string;
  schoolName: string;
  inspectionDate: string;
  inspectorName: string;
  academicRating: number; // 1 to 5
  infrastructureRating: number; // 1 to 5
  panchmukhiRating: number; // 1 to 5
  observations: string;
  recommendations: string;
}

export interface SankulNotice {
  id: string;
  clusterName?: string;
  title: string;
  date: string;
  category: 'Sports' | 'Academic' | 'Workshop' | 'Meeting' | 'Cultural';
  content: string;
  targetPrant?: string;
  issuedBy: string;
}

export interface SankulCluster {
  id: string;
  name: string;
  prant: string;
  passcode?: string;
  inchargeName?: string;
  inchargeContact?: string;
  assignedSchools?: string[];
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

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
  pin?: string;
  isDefaultPin?: boolean;
  assignedClasses?: string[];
  status: 'Active' | 'OnLeave' | 'Resigned';
}

export interface SalarySlip {
  id?: string;
  schoolId: string;
  staffId: string;
  staffName: string;
  designation: string;
  month: string;
  academicYear?: string;
  basicPay: number;
  daHra?: number;
  grossPay: number;
  pfDeduction?: number;
  samitiDeduction?: number;
  lopDays?: number;
  lopDeduction?: number;
  totalDeductions?: number;
  netSalary: number;
  paymentStatus?: 'Generated' | 'Disbursed' | 'Hold';
  paymentMode?: string;
  disbursedDate?: string;
}

export interface ExamScheduleItem {
  subject: string;
  class: string;
  date: string;
  timing: string;
  maxMarks: number;
  roomNo?: string;
}

export interface Exam {
  id: string;
  schoolId?: string;
  title: string;
  academicYear: string;
  term: string;
  classes: string[];
  startDate: string;
  endDate: string;
  dateSheet: ExamScheduleItem[];
  status: 'Scheduled' | 'Ongoing' | 'Completed';
  isLocked?: boolean;
}

export interface TimetableSlot {
  period: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherName: string;
  teacherId?: string;
  room?: string;
}

export interface DaySchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  slots: TimetableSlot[];
}

export interface Timetable {
  id: string;
  schoolId?: string;
  class: string;
  section: string;
  schedule: DaySchedule[];
}

export interface LeaveRequest {
  id: string;
  schoolId?: string;
  applicantType: 'student' | 'staff';
  applicantId: string;
  applicantName: string;
  classOrDesignation?: string;
  startDate: string;
  endDate: string;
  reason: string;
  appliedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewedBy?: string;
  reviewerRemarks?: string;
}

export interface TransportStop {
  stopName: string;
  pickupTime: string;
  dropTime: string;
  monthlyFare: number;
}

export interface TransportRoute {
  id: string;
  schoolId?: string;
  routeName: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  helperName?: string;
  capacity: number;
  stops: TransportStop[];
  status: 'Active' | 'Maintenance' | 'Inactive';
}

export interface LibraryBook {
  id: string;
  schoolId?: string;
  accessionNo: string;
  title: string;
  author: string;
  publisher?: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
}

export interface BookIssueRecord {
  id: string;
  schoolId?: string;
  bookId: string;
  bookTitle: string;
  accessionNo: string;
  borrowerType: 'student' | 'staff';
  borrowerId: string;
  borrowerName: string;
  borrowerContact?: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string | null;
  fineAmount: number;
  status: 'Issued' | 'Returned' | 'Lost';
}

export interface InventoryItem {
  id: string;
  schoolId?: string;
  itemName: string;
  category: string;
  sizeOrStandard?: string;
  unitPrice: number;
  stockQuantity: number;
  minimumAlertStock: number;
  unit: string;
}

export interface AuditLogEntry {
  id: string;
  schoolId?: string;
  actorType: 'admin' | 'teacher' | 'student' | 'system' | 'developer';
  actorId?: string;
  actorName: string;
  action: string;
  description: string;
  ip?: string;
  createdAt: string;
}

export type QuestionType = 'mcq' | 'vsa' | 'sa' | 'la' | 'sanskriti';
export type ExamPaperType = 'unit-test' | 'traimasik' | 'ardhavarshik' | 'varshik' | 'practice';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface QuestionItem {
  id: string;
  type: QuestionType;
  text: string;
  marks: number;
  subject: string;
  classLevel: string;
  chapter?: string;
  options?: QuestionOption[];
  internalChoiceText?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuestionPaperSection {
  id: string;
  title: string;
  instructions: string;
  questions: QuestionItem[];
}

export interface QuestionPaper {
  id: string;
  schoolId?: string;
  title: string;
  examType: ExamPaperType;
  classLevel: string;
  subject: string;
  month?: string;
  chapters?: string;
  totalMarks: number;
  durationMinutes: number;
  generalInstructions: string[];
  sections: QuestionPaperSection[];
  createdAt: string;
  createdBy: string;
  generationSource?: 'gemini' | 'curriculum-bank' | 'baudhik';
  generationWarning?: string;
}

