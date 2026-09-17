import type { 
  School, 
  Student, 
  AttendanceRecord, 
  FeeRecord, 
  ReportCard, 
  Notice, 
  AttendanceStatus, 
  Homework, 
  Staff,
  Exam,
  Timetable,
  LeaveRequest,
  TransportRoute,
  LibraryBook,
  BookIssueRecord,
  InventoryItem,
  AuditLogEntry
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

/**
 * Returns Bearer token header if admin, teacher or student is authenticated
 */
function getAuthHeaders(): Record<string, string> {
  const token = sessionStorage.getItem('ssm_admin_token') || 
                sessionStorage.getItem('ssm_teacher_token') || 
                sessionStorage.getItem('ssm_student_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/**
 * Resilient fetch wrapper:
 * 1. Automatically injects Bearer auth headers if available
 * 2. Catches network failures / offline states with a clean bilingual error
 */
async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string> || {})
  };

  try {
    return await fetch(url, { ...options, headers });
  } catch (err: any) {
    if (import.meta.env.DEV) {
      console.warn(`[API Offline/Network Error] ${options.method || 'GET'} ${url}:`, err.message);
    }
    throw new Error('सर्वर अथवा नेटवर्क से संपर्क नहीं हो सका। कृपया कनेक्शन जांचें। (Network/Server connection failed)');
  }
}

/**
 * Safely parse JSON responses and reject with server error message if !res.ok
 */
async function handleJsonResponse<T>(res: Response, defaultError = 'अनपेक्षित त्रुटि हुई'): Promise<T> {
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = data?.error || data?.message || defaultError;
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  // Status check
  async getStatus(): Promise<{ status: string; database: string; databaseHost?: string }> {
    const res = await apiFetch('/status');
    return handleJsonResponse(res, 'Failed to fetch status');
  },

  // ================= AUTHENTICATION =================
  async loginAdmin(schoolId: string, passcode: string): Promise<{ success: boolean; token: string; school?: Partial<School> }> {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schoolId, passcode })
    });
    const data = await handleJsonResponse<any>(res, 'प्रमाणीकरण विफल रहा');
    if (data.token) {
      sessionStorage.removeItem('ssm_student_token');
      sessionStorage.removeItem('ssm_student_id');
      sessionStorage.removeItem('ssm_teacher_token');
      sessionStorage.removeItem('ssm_teacher_id');
      sessionStorage.removeItem('ssm_teacher_name');
      sessionStorage.removeItem('ssm_teacher_tab');
      sessionStorage.setItem('ssm_admin_token', data.token);
      sessionStorage.setItem('ssm_admin_authenticated', 'true');
      sessionStorage.setItem('ssm_admin_role', data.role || 'admin');
    }
    return data;
  },

  async loginStudent(schoolId: string, rollNo: string, contact: string, studentClass?: string): Promise<{ success: boolean; token: string; student: Student }> {
    const res = await apiFetch('/auth/student-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schoolId, rollNo, contact, ...(studentClass ? { studentClass } : {}) })
    });
    const data = await handleJsonResponse<any>(res, 'छात्र प्रमाणीकरण विफल रहा');
    sessionStorage.removeItem('ssm_admin_token');
    sessionStorage.removeItem('ssm_admin_authenticated');
    sessionStorage.removeItem('ssm_admin_role');
    sessionStorage.removeItem('ssm_teacher_token');
    sessionStorage.removeItem('ssm_teacher_id');
    sessionStorage.removeItem('ssm_teacher_name');
    sessionStorage.setItem('ssm_student_token', data.token);
    sessionStorage.setItem('ssm_student_id', data.student.id);
    return data;
  },

  async loginTeacher(schoolId: string, phone: string, pin: string): Promise<{ success: boolean; token: string; teacher: Partial<Staff> }> {
    const res = await apiFetch('/auth/teacher-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schoolId, phone, pin })
    });
    const data = await handleJsonResponse<any>(res, 'आचार्य प्रमाणीकरण विफल रहा');
    sessionStorage.removeItem('ssm_admin_token');
    sessionStorage.removeItem('ssm_student_token');
    sessionStorage.setItem('ssm_teacher_token', data.token);
    sessionStorage.setItem('ssm_teacher_id', data.teacher.id);
    sessionStorage.setItem('ssm_teacher_name', data.teacher.name || '');
    return data;
  },

  logoutTeacher(): void {
    sessionStorage.removeItem('ssm_teacher_token');
    sessionStorage.removeItem('ssm_teacher_id');
    sessionStorage.removeItem('ssm_teacher_name');
    sessionStorage.removeItem('ssm_teacher_tab');
  },

  logoutAdmin(): void {
    sessionStorage.removeItem('ssm_admin_token');
    sessionStorage.removeItem('ssm_admin_authenticated');
    sessionStorage.removeItem('ssm_admin_role');
    sessionStorage.removeItem('ssm_student_token');
    sessionStorage.removeItem('ssm_student_id');
    sessionStorage.removeItem('ssm_teacher_token');
    sessionStorage.removeItem('ssm_teacher_id');
    sessionStorage.removeItem('ssm_teacher_name');
    sessionStorage.removeItem('ssm_teacher_tab');
  },

  // ================= SCHOOLS =================
  async getSchools(): Promise<School[]> {
    const res = await apiFetch('/schools');
    return handleJsonResponse<School[]>(res, 'Failed to fetch schools');
  },

  async getSchool(id: string): Promise<School> {
    const res = await apiFetch(`/schools/${id}`);
    return handleJsonResponse<School>(res, 'Failed to fetch school details');
  },

  async createSchool(school: Omit<School, 'id'> & { id?: string }): Promise<School> {
    const res = await apiFetch('/schools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(school)
    });
    return handleJsonResponse<School>(res, 'Failed to create school');
  },

  async updateSchool(id: string, updates: Partial<School>): Promise<School> {
    const res = await apiFetch(`/schools/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleJsonResponse<School>(res, 'Failed to update school');
  },

  async exportSchoolArchive(id: string): Promise<any> {
    const res = await apiFetch(`/schools/${id}/archive`);
    return handleJsonResponse<any>(res, 'Failed to export school archive');
  },

  async discontinueSchool(id: string, reason?: string): Promise<{ success: boolean; message: string; school: School }> {
    const res = await apiFetch(`/schools/${id}/discontinue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, confirmText: 'DISCONTINUE' })
    });
    return handleJsonResponse<any>(res, 'शाखा विसर्जन विफल रहा');
  },

  async reactivateSchool(id: string): Promise<{ success: boolean; message: string; school: School }> {
    const res = await apiFetch(`/schools/${id}/reactivate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleJsonResponse<any>(res, 'शाखा पुनः सक्रियण विफल रहा');
  },

  // ================= STUDENTS =================
  async getStudents(schoolId?: string): Promise<Student[]> {
    const url = schoolId ? `/students?schoolId=${encodeURIComponent(schoolId)}` : '/students';
    const res = await apiFetch(url);
    return handleJsonResponse<Student[]>(res, 'Failed to fetch students');
  },

  async createStudent(student: Omit<Student, 'id'>): Promise<Student> {
    const res = await apiFetch('/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
    return handleJsonResponse<Student>(res, 'Failed to create student');
  },

  async bulkCreateStudents(students: Partial<Student>[], schoolId?: string): Promise<{ count: number; students: Student[] }> {
    const res = await apiFetch('/students/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students, schoolId })
    });
    return handleJsonResponse<{ count: number; students: Student[] }>(res, 'Failed to bulk import students');
  },

  async updateStudent(id: string, student: Partial<Student>): Promise<Student> {
    const res = await apiFetch(`/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
    return handleJsonResponse<Student>(res, 'Failed to update student');
  },

  async deleteStudent(id: string): Promise<{ success: boolean; id: string }> {
    const res = await apiFetch(`/students/${id}`, {
      method: 'DELETE'
    });
    return handleJsonResponse<{ success: boolean; id: string }>(res, 'Failed to delete student');
  },

  async anonymizeStudent(id: string): Promise<{ success: boolean; message: string; student: Student }> {
    const res = await apiFetch(`/students/${id}/anonymize`, {
      method: 'POST'
    });
    return handleJsonResponse<{ success: boolean; message: string; student: Student }>(res, 'Failed to anonymize student data');
  },

  async verifyStudentTc(query: string, schoolId?: string): Promise<Student> {
    const params = new URLSearchParams({ q: query, query });
    if (schoolId) params.append('schoolId', schoolId);
    const res = await apiFetch(`/students/verify-tc?${params.toString()}`);
    return handleJsonResponse<Student>(res, 'प्रमाणित छात्र अभिलेख नहीं मिला');
  },

  async getStudentMe(): Promise<{ student: Student; fees: FeeRecord[]; attendance: AttendanceRecord[]; reportCards: ReportCard[] }> {
    const res = await apiFetch('/students/me');
    return handleJsonResponse<{ student: Student; fees: FeeRecord[]; attendance: AttendanceRecord[]; reportCards: ReportCard[] }>(res, 'छात्र डेटा प्राप्त करने में विफल');
  },

  // ================= ATTENDANCE =================
  async getAttendance(date?: string, schoolId?: string, options?: { startDate?: string; endDate?: string; class?: string }): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (schoolId) params.append('schoolId', schoolId);
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.class) params.append('class', options.class);
    const queryString = params.toString();
    const url = queryString ? `/attendance?${queryString}` : '/attendance';
    const res = await apiFetch(url);
    return handleJsonResponse<AttendanceRecord[]>(res, 'Failed to fetch attendance');
  },

  async setAttendance(studentId: string, date: string, status: AttendanceStatus, schoolId?: string): Promise<AttendanceRecord> {
    const res = await apiFetch('/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, date, status, schoolId })
    });
    return handleJsonResponse<AttendanceRecord>(res, 'Failed to save attendance');
  },

  async setBulkAttendance(updates: { studentId: string; date: string; status: AttendanceStatus; schoolId?: string }[], schoolId?: string): Promise<AttendanceRecord[]> {
    const res = await apiFetch('/attendance/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates, schoolId })
    });
    return handleJsonResponse<AttendanceRecord[]>(res, 'Failed to save bulk attendance');
  },

  async deleteAttendance(id: string): Promise<{ success: boolean; id: string }> {
    const res = await apiFetch(`/attendance/${id}`, {
      method: 'DELETE'
    });
    return handleJsonResponse<{ success: boolean; id: string }>(res, 'Failed to delete attendance record');
  },

  // ================= FEES =================
  async getFees(schoolId?: string): Promise<FeeRecord[]> {
    const url = schoolId ? `/fees?schoolId=${encodeURIComponent(schoolId)}` : '/fees';
    const res = await apiFetch(url);
    return handleJsonResponse<FeeRecord[]>(res, 'Failed to fetch fees');
  },

  async payFee(feeId: string, paymentMode: string, paidAmount?: number): Promise<FeeRecord> {
    const res = await apiFetch(`/fees/${feeId}/pay`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMode, paidAmount })
    });
    return handleJsonResponse<FeeRecord>(res, 'Failed to process fee payment');
  },

  async createFee(fee: Omit<FeeRecord, 'id'>): Promise<FeeRecord> {
    const res = await apiFetch('/fees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fee)
    });
    return handleJsonResponse<FeeRecord>(res, 'Failed to create fee record');
  },

  async updateFee(id: string, updates: Partial<FeeRecord>): Promise<FeeRecord> {
    const res = await apiFetch(`/fees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleJsonResponse<FeeRecord>(res, 'Failed to update fee record');
  },

  async deleteFee(id: string): Promise<{ success: boolean; id: string }> {
    const res = await apiFetch(`/fees/${id}`, {
      method: 'DELETE'
    });
    return handleJsonResponse<{ success: boolean; id: string }>(res, 'Failed to delete fee record');
  },

  async rolloverArrears(payload: { schoolId?: string; fromAcademicYear: string; toAcademicYear: string }): Promise<{
    success: boolean;
    message: string;
    rolledOverCount: number;
    totalArrearsAmount: number;
    arrears: FeeRecord[];
  }> {
    const res = await apiFetch('/fees/rollover-arrears', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleJsonResponse(res, 'Failed to rollover arrears');
  },

  // ================= REPORT CARDS =================
  async getReports(schoolId?: string, term?: string, academicYear?: string): Promise<ReportCard[]> {
    const params = new URLSearchParams();
    if (schoolId) params.append('schoolId', schoolId);
    if (term) params.append('examTerm', term);
    if (academicYear) params.append('academicYear', academicYear);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await apiFetch(`/reports${qs}`);
    return handleJsonResponse<ReportCard[]>(res, 'Failed to fetch report cards');
  },

  async saveReport(report: ReportCard): Promise<ReportCard> {
    const res = await apiFetch('/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });
    return handleJsonResponse<ReportCard>(res, 'Failed to save report card');
  },

  async deleteReport(id: string): Promise<{ success: boolean; id: string }> {
    const res = await apiFetch(`/reports/${id}`, {
      method: 'DELETE'
    });
    return handleJsonResponse<{ success: boolean; id: string }>(res, 'Failed to delete report card');
  },

  // ================= NOTICES =================
  async getNotices(schoolId?: string): Promise<Notice[]> {
    const url = schoolId ? `/notices?schoolId=${encodeURIComponent(schoolId)}` : '/notices';
    const res = await apiFetch(url);
    return handleJsonResponse<Notice[]>(res, 'Failed to fetch notices');
  },

  async createNotice(notice: Omit<Notice, 'id'>): Promise<Notice> {
    const res = await apiFetch('/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notice)
    });
    return handleJsonResponse<Notice>(res, 'Failed to create notice');
  },

  async updateNotice(id: string, updates: Partial<Notice>): Promise<Notice> {
    const res = await apiFetch(`/notices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleJsonResponse<Notice>(res, 'Failed to update notice');
  },

  async deleteNotice(id: string): Promise<{ success: boolean; id: string }> {
    const res = await apiFetch(`/notices/${id}`, {
      method: 'DELETE'
    });
    return handleJsonResponse<{ success: boolean; id: string }>(res, 'Failed to delete notice');
  },

  // ================= ADMISSIONS =================
  async getAdmissions(schoolId?: string): Promise<any[]> {
    const url = schoolId ? `/admissions?schoolId=${encodeURIComponent(schoolId)}` : '/admissions';
    const res = await apiFetch(url);
    return handleJsonResponse<any[]>(res, 'Failed to fetch admissions');
  },

  async approveAdmission(id: string, options?: { section?: string; bloodGroup?: string; rollNo?: string }): Promise<{ success: boolean; admission: any; student: any }> {
    const res = await apiFetch(`/admissions/${id}/approve`, {
      method: 'PUT',
      headers: options ? { 'Content-Type': 'application/json' } : undefined,
      body: options ? JSON.stringify(options) : undefined
    });
    return handleJsonResponse<{ success: boolean; admission: any; student: any }>(res, 'Failed to approve admission');
  },

  async rejectAdmission(id: string, reason?: string): Promise<{ success: boolean; admission: any }> {
    const res = await apiFetch(`/admissions/${id}/reject`, {
      method: 'PUT',
      headers: reason ? { 'Content-Type': 'application/json' } : undefined,
      body: reason ? JSON.stringify({ reason }) : undefined
    });
    return handleJsonResponse<{ success: boolean; admission: any }>(res, 'Failed to reject admission');
  },

  async deleteAdmission(id: string): Promise<{ success: boolean; id: string }> {
    const res = await apiFetch(`/admissions/${id}`, {
      method: 'DELETE'
    });
    return handleJsonResponse<{ success: boolean; id: string }>(res, 'Failed to delete admission');
  },

  async updateAdmission(id: string, updates: any): Promise<any> {
    const res = await apiFetch(`/admissions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleJsonResponse<any>(res, 'Failed to update admission');
  },

  // Public admission submission (no auth needed)
  async submitAdmission(data: {
    schoolId?: string;
    guardianConsent: boolean;
    consentPolicyVersion?: string;
    studentName: string;
    gender: string;
    applyingClass: string;
    fatherName: string;
    motherName: string;
    phone: string;
    address: string;
  }): Promise<{ id: string; regNo: string; studentName: string }> {
    const res = await apiFetch('/admissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleJsonResponse<{ id: string; regNo: string; studentName: string }>(res, 'Failed to submit admission inquiry');
  },

  // ================= HOMEWORK =================
  async getHomework(schoolId?: string, className?: string): Promise<Homework[]> {
    let url = '/homework';
    const params = new URLSearchParams();
    if (schoolId) params.append('schoolId', schoolId);
    if (className) params.append('class', className);
    if (params.toString()) url += `?${params.toString()}`;
    const res = await apiFetch(url);
    return handleJsonResponse<Homework[]>(res, 'Failed to fetch homework');
  },

  async createHomework(hw: Omit<Homework, 'id'> & { id?: string }): Promise<Homework> {
    const res = await apiFetch('/homework', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hw)
    });
    return handleJsonResponse<Homework>(res, 'Failed to create homework');
  },

  async updateHomework(id: string, updates: Partial<Homework>): Promise<Homework> {
    const res = await apiFetch(`/homework/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleJsonResponse<Homework>(res, 'Failed to update homework');
  },

  async deleteHomework(id: string): Promise<{ success: boolean; id: string }> {
    const res = await apiFetch(`/homework/${id}`, {
      method: 'DELETE'
    });
    return handleJsonResponse<{ success: boolean; id: string }>(res, 'Failed to delete homework');
  },

  // ================= STAFF & PAYROLL =================
  async getStaff(schoolId?: string): Promise<Staff[]> {
    const url = schoolId ? `/staff?schoolId=${encodeURIComponent(schoolId)}` : '/staff';
    const res = await apiFetch(url);
    return handleJsonResponse<Staff[]>(res, 'Failed to fetch staff');
  },

  async getPublicStaff(schoolId?: string): Promise<Staff[]> {
    const url = schoolId ? `/staff/public?schoolId=${encodeURIComponent(schoolId)}` : '/staff/public';
    const res = await apiFetch(url);
    return handleJsonResponse<Staff[]>(res, 'Failed to fetch staff');
  },

  async getTeacherMe(): Promise<Staff> {
    const res = await apiFetch('/staff/me');
    return handleJsonResponse<Staff>(res, 'Failed to fetch teacher profile');
  },

  async createStaff(staff: Omit<Staff, 'id'> & { id?: string }): Promise<Staff> {
    const res = await apiFetch('/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staff)
    });
    return handleJsonResponse<Staff>(res, 'Failed to create staff member');
  },

  async updateStaff(id: string, updates: Partial<Staff>): Promise<Staff> {
    const res = await apiFetch(`/staff/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleJsonResponse<Staff>(res, 'Failed to update staff member');
  },

  async deleteStaff(id: string): Promise<{ success: boolean; id: string }> {
    const res = await apiFetch(`/staff/${id}`, {
      method: 'DELETE'
    });
    return handleJsonResponse<{ success: boolean; id: string }>(res, 'Failed to delete staff member');
  },

  // ================= SALARY SLIPS =================
  async getSalarySlips(schoolId?: string, staffId?: string, month?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (schoolId) params.append('schoolId', schoolId);
    if (staffId) params.append('staffId', staffId);
    if (month) params.append('month', month);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await apiFetch(`/salary-slips${qs}`);
    return handleJsonResponse<any[]>(res, 'Failed to fetch salary slips');
  },

  async createSalarySlip(slip: any): Promise<any> {
    const res = await apiFetch('/salary-slips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slip)
    });
    return handleJsonResponse<any>(res, 'Failed to save salary slip');
  },

  async deleteSalarySlip(id: string): Promise<{ success: boolean; id: string }> {
    const res = await apiFetch(`/salary-slips/${id}`, {
      method: 'DELETE'
    });
    return handleJsonResponse<{ success: boolean; id: string }>(res, 'Failed to delete salary slip');
  },

  // ================= EXAMS & MARKS =================
  async getExams(schoolId?: string, term?: string, academicYear?: string): Promise<Exam[]> {
    const params = new URLSearchParams();
    if (schoolId) params.append('schoolId', schoolId);
    if (term) params.append('term', term);
    if (academicYear) params.append('academicYear', academicYear);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await apiFetch(`/exams${qs}`);
    return handleJsonResponse<Exam[]>(res, 'Failed to fetch exams');
  },

  async createExam(exam: Partial<Exam>): Promise<Exam> {
    const res = await apiFetch('/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exam)
    });
    return handleJsonResponse<Exam>(res, 'Failed to create exam');
  },

  async updateExam(id: string, exam: Partial<Exam>): Promise<Exam> {
    const res = await apiFetch(`/exams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exam)
    });
    return handleJsonResponse<Exam>(res, 'Failed to update exam');
  },

  async deleteExam(id: string): Promise<{ success: boolean; id: string }> {
    const res = await apiFetch(`/exams/${id}`, {
      method: 'DELETE'
    });
    return handleJsonResponse<{ success: boolean; id: string }>(res, 'Failed to delete exam');
  },

  async submitBulkMarks(payload: {
    schoolId?: string;
    examTerm: string;
    academicYear?: string;
    subject: string;
    marksList: Array<{ studentId: string; marksObtained: number; maxMarks?: number }>;
  }): Promise<{ success: boolean; count: number }> {
    const res = await apiFetch('/exams/marks-bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleJsonResponse<{ success: boolean; count: number }>(res, 'Failed to submit marks');
  },

  // ================= TIMETABLE =================
  async getTimetable(schoolId: string, className?: string, section?: string): Promise<Timetable[]> {
    const params = new URLSearchParams({ schoolId });
    if (className) params.append('class', className);
    if (section) params.append('section', section);
    const res = await apiFetch(`/timetable?${params.toString()}`);
    return handleJsonResponse<Timetable[]>(res, 'Failed to fetch timetable');
  },

  async saveTimetable(payload: {
    schoolId: string;
    class: string;
    section?: string;
    schedule: any[];
  }): Promise<Timetable> {
    const res = await apiFetch('/timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleJsonResponse<Timetable>(res, 'Failed to save timetable');
  },

  // ================= LEAVES =================
  async getLeaves(schoolId?: string, applicantType?: string, applicantId?: string): Promise<LeaveRequest[]> {
    const params = new URLSearchParams();
    if (schoolId) params.append('schoolId', schoolId);
    if (applicantType) params.append('applicantType', applicantType);
    if (applicantId) params.append('applicantId', applicantId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await apiFetch(`/leaves${qs}`);
    return handleJsonResponse<LeaveRequest[]>(res, 'Failed to fetch leaves');
  },

  async createLeave(leave: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const res = await apiFetch('/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leave)
    });
    return handleJsonResponse<LeaveRequest>(res, 'Failed to submit leave request');
  },

  async updateLeaveStatus(id: string, status: 'Approved' | 'Rejected', reviewerRemarks?: string, reviewedBy?: string): Promise<LeaveRequest> {
    const res = await apiFetch(`/leaves/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewerRemarks, reviewedBy })
    });
    return handleJsonResponse<LeaveRequest>(res, 'Failed to update leave status');
  },

  // ================= TRANSPORT =================
  async getTransportRoutes(schoolId?: string): Promise<TransportRoute[]> {
    const url = schoolId ? `/transport/routes?schoolId=${encodeURIComponent(schoolId)}` : '/transport/routes';
    const res = await apiFetch(url);
    return handleJsonResponse<TransportRoute[]>(res, 'Failed to fetch transport routes');
  },

  async createTransportRoute(route: Partial<TransportRoute>): Promise<TransportRoute> {
    const res = await apiFetch('/transport/routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(route)
    });
    return handleJsonResponse<TransportRoute>(res, 'Failed to create route');
  },

  async updateTransportRoute(id: string, route: Partial<TransportRoute>): Promise<TransportRoute> {
    const res = await apiFetch(`/transport/routes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(route)
    });
    return handleJsonResponse<TransportRoute>(res, 'Failed to update route');
  },

  async deleteTransportRoute(id: string): Promise<{ success: boolean; id: string }> {
    const res = await apiFetch(`/transport/routes/${id}`, {
      method: 'DELETE'
    });
    return handleJsonResponse<{ success: boolean; id: string }>(res, 'Failed to delete route');
  },

  // ================= LIBRARY =================
  async getBooks(schoolId?: string, category?: string, search?: string): Promise<LibraryBook[]> {
    const params = new URLSearchParams();
    if (schoolId) params.append('schoolId', schoolId);
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await apiFetch(`/library/books${qs}`);
    return handleJsonResponse<LibraryBook[]>(res, 'Failed to fetch books');
  },

  async createBook(book: Partial<LibraryBook>): Promise<LibraryBook> {
    const res = await apiFetch('/library/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    });
    return handleJsonResponse<LibraryBook>(res, 'Failed to create book');
  },

  async updateBook(id: string, book: Partial<LibraryBook>): Promise<LibraryBook> {
    const res = await apiFetch(`/library/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    });
    return handleJsonResponse<LibraryBook>(res, 'Failed to update book');
  },

  async deleteBook(id: string): Promise<{ success: boolean; id: string }> {
    const res = await apiFetch(`/library/books/${id}`, {
      method: 'DELETE'
    });
    return handleJsonResponse<{ success: boolean; id: string }>(res, 'Failed to delete book');
  },

  async getBookIssues(schoolId?: string): Promise<BookIssueRecord[]> {
    const url = schoolId ? `/library/issues?schoolId=${encodeURIComponent(schoolId)}` : '/library/issues';
    const res = await apiFetch(url);
    return handleJsonResponse<BookIssueRecord[]>(res, 'Failed to fetch book issues');
  },

  async issueBook(issue: Partial<BookIssueRecord>): Promise<BookIssueRecord> {
    const res = await apiFetch('/library/issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issue)
    });
    return handleJsonResponse<BookIssueRecord>(res, 'Failed to issue book');
  },

  async returnBook(issueId: string, fineAmount: number = 0): Promise<BookIssueRecord> {
    const res = await apiFetch('/library/return', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueId, fineAmount })
    });
    return handleJsonResponse<BookIssueRecord>(res, 'Failed to return book');
  },

  // ================= INVENTORY =================
  async getInventory(schoolId?: string, category?: string): Promise<InventoryItem[]> {
    const params = new URLSearchParams();
    if (schoolId) params.append('schoolId', schoolId);
    if (category) params.append('category', category);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await apiFetch(`/inventory${qs}`);
    return handleJsonResponse<InventoryItem[]>(res, 'Failed to fetch inventory');
  },

  async createInventoryItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await apiFetch('/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return handleJsonResponse<InventoryItem>(res, 'Failed to create inventory item');
  },

  async updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await apiFetch(`/inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return handleJsonResponse<InventoryItem>(res, 'Failed to update inventory item');
  },

  async deleteInventoryItem(id: string): Promise<{ success: boolean; id: string }> {
    const res = await apiFetch(`/inventory/${id}`, {
      method: 'DELETE'
    });
    return handleJsonResponse<{ success: boolean; id: string }>(res, 'Failed to delete inventory item');
  },

  async adjustInventoryStock(id: string, delta: number): Promise<InventoryItem> {
    const res = await apiFetch(`/inventory/${id}/stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta })
    });
    return handleJsonResponse<InventoryItem>(res, 'Failed to adjust stock');
  },

  // ================= AUDIT LOGS =================
  async getAuditLogs(
    schoolId?: string,
    action?: string,
    actorType?: string,
    search?: string,
    startDate?: string,
    endDate?: string
  ): Promise<AuditLogEntry[]> {
    const params = new URLSearchParams();
    if (schoolId) params.append('schoolId', schoolId);
    if (action) params.append('action', action);
    if (actorType) params.append('actorType', actorType);
    if (search) params.append('search', search);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await apiFetch(`/audit-logs${qs}`);
    return handleJsonResponse<AuditLogEntry[]>(res, 'Failed to fetch audit logs');
  },

  // ================= ACADEMIC SESSION MANAGEMENT =================
  async promoteStudents(payload: {
    schoolId?: string;
    fromAcademicYear?: string;
    toAcademicYear: string;
    promotions: Array<{
      studentId: string;
      nextClass?: string;
      nextSection?: string;
      nextRollNo?: string | number;
      action?: 'promote' | 'alumni' | 'detain';
      remarks?: string;
    }>;
  }): Promise<{ success: boolean; message: string; count: number; students: Student[] }> {
    const res = await apiFetch('/students/promote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleJsonResponse<any>(res, 'छात्र प्रोन्नति विफल रही');
  },

  async rolloverFeeArrears(payload: {
    schoolId?: string;
    fromAcademicYear: string;
    toAcademicYear: string;
  }): Promise<{ success: boolean; message: string; rolledOverCount: number; totalArrearsAmount: number; arrears: FeeRecord[] }> {
    const res = await apiFetch('/fees/rollover-arrears', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleJsonResponse<any>(res, 'शुल्क रोलओवर विफल रहा');
  },

  async toggleExamLock(examId: string, isLocked: boolean): Promise<{ success: boolean; isLocked: boolean; exam: Exam }> {
    const res = await apiFetch(`/exams/${examId}/lock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isLocked })
    });
    return handleJsonResponse<any>(res, 'परीक्षा लॉक स्थिति बदलने में विफल');
  }
};
