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

export const api = {
  // Status check
  async getStatus(): Promise<{ status: string; database: string; databaseHost?: string }> {
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok) throw new Error('Failed to fetch status');
    return res.json();
  },

  // ================= AUTHENTICATION =================
  async loginAdmin(schoolId: string, passcode: string): Promise<{ success: boolean; token: string; school?: Partial<School> }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schoolId, passcode })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'प्रमाणीकरण विफल रहा');
    }
    if (data.token) {
      sessionStorage.removeItem('ssm_student_token');
      sessionStorage.removeItem('ssm_student_id');
      sessionStorage.setItem('ssm_admin_token', data.token);
      sessionStorage.setItem('ssm_admin_authenticated', 'true');
      sessionStorage.setItem('ssm_admin_role', data.role || 'admin');
    }
    return data;
  },

  async loginStudent(schoolId: string, rollNo: string, contact: string): Promise<{ success: boolean; token: string; student: Student }> {
    const res = await fetch(`${API_BASE}/auth/student-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schoolId, rollNo, contact })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'छात्र प्रमाणीकरण विफल रहा');
    sessionStorage.removeItem('ssm_admin_token');
    sessionStorage.removeItem('ssm_admin_authenticated');
    sessionStorage.removeItem('ssm_admin_role');
    sessionStorage.setItem('ssm_student_token', data.token);
    sessionStorage.setItem('ssm_student_id', data.student.id);
    return data;
  },

  async loginTeacher(schoolId: string, phone: string, pin: string): Promise<{ success: boolean; token: string; teacher: Partial<Staff> }> {
    const res = await fetch(`${API_BASE}/auth/teacher-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schoolId, phone, pin })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'आचार्य प्रमाणीकरण विफल रहा');
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
  },

  // ================= SCHOOLS =================
  async getSchools(): Promise<School[]> {
    const res = await fetch(`${API_BASE}/schools`);
    if (!res.ok) throw new Error('Failed to fetch schools');
    return res.json();
  },

  async getSchool(id: string): Promise<School> {
    const res = await fetch(`${API_BASE}/schools/${id}`);
    if (!res.ok) throw new Error('Failed to fetch school details');
    return res.json();
  },

  async createSchool(school: Omit<School, 'id'> & { id?: string }): Promise<School> {
    const res = await fetch(`${API_BASE}/schools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(school)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create school');
    }
    return res.json();
  },

  async updateSchool(id: string, updates: Partial<School>): Promise<School> {
    const res = await fetch(`${API_BASE}/schools/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update school');
    }
    return res.json();
  },

  // ================= STUDENTS =================
  async getStudents(schoolId?: string): Promise<Student[]> {
    const url = schoolId ? `${API_BASE}/students?schoolId=${encodeURIComponent(schoolId)}` : `${API_BASE}/students`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  async createStudent(student: Omit<Student, 'id'>): Promise<Student> {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(student)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create student');
    }
    return res.json();
  },

  async bulkCreateStudents(students: Partial<Student>[], schoolId?: string): Promise<{ count: number; students: Student[] }> {
    const res = await fetch(`${API_BASE}/students/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ students, schoolId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to bulk import students');
    }
    return res.json();
  },

  async updateStudent(id: string, student: Partial<Student>): Promise<Student> {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(student)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update student');
    }
    return res.json();
  },

  async deleteStudent(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete student');
    }
    return res.json();
  },

  // ================= ATTENDANCE =================
  async getAttendance(date?: string, schoolId?: string): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (schoolId) params.append('schoolId', schoolId);
    const queryString = params.toString();
    const url = queryString ? `${API_BASE}/attendance?${queryString}` : `${API_BASE}/attendance`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return res.json();
  },

  async setAttendance(studentId: string, date: string, status: AttendanceStatus, schoolId?: string): Promise<AttendanceRecord> {
    const res = await fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ studentId, date, status, schoolId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save attendance');
    }
    return res.json();
  },

  async setBulkAttendance(updates: { studentId: string; date: string; status: AttendanceStatus; schoolId?: string }[], schoolId?: string): Promise<AttendanceRecord[]> {
    const res = await fetch(`${API_BASE}/attendance/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ updates, schoolId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save bulk attendance');
    }
    return res.json();
  },

  // ================= FEES =================
  async getFees(schoolId?: string): Promise<FeeRecord[]> {
    const url = schoolId ? `${API_BASE}/fees?schoolId=${encodeURIComponent(schoolId)}` : `${API_BASE}/fees`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch fees');
    return res.json();
  },

  async payFee(feeId: string, paymentMode: string): Promise<FeeRecord> {
    const res = await fetch(`${API_BASE}/fees/${feeId}/pay`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ paymentMode })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to process fee payment');
    }
    return res.json();
  },

  async createFee(fee: Omit<FeeRecord, 'id'>): Promise<FeeRecord> {
    const res = await fetch(`${API_BASE}/fees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(fee)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create fee record');
    }
    return res.json();
  },

  // ================= REPORT CARDS =================
  async getReports(schoolId?: string): Promise<ReportCard[]> {
    const url = schoolId ? `${API_BASE}/reports?schoolId=${encodeURIComponent(schoolId)}` : `${API_BASE}/reports`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch report cards');
    return res.json();
  },

  async saveReport(report: ReportCard): Promise<ReportCard> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(report)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save report card');
    }
    return res.json();
  },

  // ================= NOTICES =================
  async getNotices(schoolId?: string): Promise<Notice[]> {
    const url = schoolId ? `${API_BASE}/notices?schoolId=${encodeURIComponent(schoolId)}` : `${API_BASE}/notices`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch notices');
    return res.json();
  },

  async createNotice(notice: Omit<Notice, 'id'>): Promise<Notice> {
    const res = await fetch(`${API_BASE}/notices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(notice)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create notice');
    }
    return res.json();
  },

  async deleteNotice(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/notices/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete notice');
    }
    return res.json();
  },

  // ================= ADMISSIONS =================
  async getAdmissions(schoolId?: string): Promise<any[]> {
    const url = schoolId ? `${API_BASE}/admissions?schoolId=${encodeURIComponent(schoolId)}` : `${API_BASE}/admissions`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch admissions');
    return res.json();
  },

  async approveAdmission(id: string): Promise<{ success: boolean; admission: any; student: any }> {
    const res = await fetch(`${API_BASE}/admissions/${id}/approve`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders()
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to approve admission');
    }
    return res.json();
  },

  async deleteAdmission(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/admissions/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete admission');
    }
    return res.json();
  },

  // Public admission submission (no auth needed)
  async submitAdmission(data: {
    schoolId?: string;
    guardianConsent: boolean;
    studentName: string;
    gender: string;
    applyingClass: string;
    fatherName: string;
    motherName: string;
    phone: string;
    address: string;
  }): Promise<{ id: string; regNo: string; studentName: string }> {
    const res = await fetch(`${API_BASE}/admissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit admission inquiry');
    }
    return res.json();
  },

  // ================= HOMEWORK =================
  async getHomework(schoolId?: string, className?: string): Promise<Homework[]> {
    let url = `${API_BASE}/homework`;
    const params = new URLSearchParams();
    if (schoolId) params.append('schoolId', schoolId);
    if (className) params.append('class', className);
    if (params.toString()) url += `?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch homework');
    return res.json();
  },

  async createHomework(hw: Omit<Homework, 'id'> & { id?: string }): Promise<Homework> {
    const res = await fetch(`${API_BASE}/homework`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(hw)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create homework');
    }
    return res.json();
  },

  async deleteHomework(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/homework/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete homework');
    }
    return res.json();
  },

  // ================= STAFF & PAYROLL =================
  async getStaff(schoolId?: string): Promise<Staff[]> {
    const url = schoolId ? `${API_BASE}/staff?schoolId=${encodeURIComponent(schoolId)}` : `${API_BASE}/staff`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch staff');
    return res.json();
  },

  async createStaff(staff: Omit<Staff, 'id'> & { id?: string }): Promise<Staff> {
    const res = await fetch(`${API_BASE}/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(staff)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create staff member');
    }
    return res.json();
  },

  async updateStaff(id: string, updates: Partial<Staff>): Promise<Staff> {
    const res = await fetch(`${API_BASE}/staff/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update staff member');
    }
    return res.json();
  },

  async deleteStaff(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/staff/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete staff member');
    }
    return res.json();
  },

  // ================= EXAMS & MARKS =================
  async getExams(schoolId?: string, term?: string, academicYear?: string): Promise<Exam[]> {
    const params = new URLSearchParams();
    if (schoolId) params.append('schoolId', schoolId);
    if (term) params.append('term', term);
    if (academicYear) params.append('academicYear', academicYear);
    const res = await fetch(`${API_BASE}/exams?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch exams');
    return res.json();
  },

  async createExam(exam: Partial<Exam>): Promise<Exam> {
    const res = await fetch(`${API_BASE}/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(exam)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create exam');
    }
    return res.json();
  },

  async updateExam(id: string, exam: Partial<Exam>): Promise<Exam> {
    const res = await fetch(`${API_BASE}/exams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(exam)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update exam');
    }
    return res.json();
  },

  async deleteExam(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/exams/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to delete exam');
    return res.json();
  },

  async submitBulkMarks(payload: {
    schoolId?: string;
    examTerm: string;
    academicYear?: string;
    subject: string;
    marksList: Array<{ studentId: string; marksObtained: number; maxMarks?: number }>;
  }): Promise<{ success: boolean; count: number }> {
    const res = await fetch(`${API_BASE}/exams/marks-bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit marks');
    }
    return res.json();
  },

  // ================= TIMETABLE =================
  async getTimetable(schoolId: string, className?: string, section?: string): Promise<Timetable[]> {
    const params = new URLSearchParams({ schoolId });
    if (className) params.append('class', className);
    if (section) params.append('section', section);
    const res = await fetch(`${API_BASE}/timetable?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch timetable');
    return res.json();
  },

  async saveTimetable(payload: {
    schoolId: string;
    class: string;
    section?: string;
    schedule: any[];
  }): Promise<Timetable> {
    const res = await fetch(`${API_BASE}/timetable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save timetable');
    }
    return res.json();
  },

  // ================= LEAVES =================
  async getLeaves(schoolId?: string, applicantType?: string, applicantId?: string): Promise<LeaveRequest[]> {
    const params = new URLSearchParams();
    if (schoolId) params.append('schoolId', schoolId);
    if (applicantType) params.append('applicantType', applicantType);
    if (applicantId) params.append('applicantId', applicantId);
    const res = await fetch(`${API_BASE}/leaves?${params.toString()}`, {
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to fetch leaves');
    return res.json();
  },

  async createLeave(leave: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const res = await fetch(`${API_BASE}/leaves`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(leave)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit leave request');
    }
    return res.json();
  },

  async updateLeaveStatus(id: string, status: 'Approved' | 'Rejected', reviewerRemarks?: string, reviewedBy?: string): Promise<LeaveRequest> {
    const res = await fetch(`${API_BASE}/leaves/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status, reviewerRemarks, reviewedBy })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update leave status');
    }
    return res.json();
  },

  // ================= TRANSPORT =================
  async getTransportRoutes(schoolId?: string): Promise<TransportRoute[]> {
    const url = schoolId ? `${API_BASE}/transport/routes?schoolId=${encodeURIComponent(schoolId)}` : `${API_BASE}/transport/routes`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch transport routes');
    return res.json();
  },

  async createTransportRoute(route: Partial<TransportRoute>): Promise<TransportRoute> {
    const res = await fetch(`${API_BASE}/transport/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(route)
    });
    if (!res.ok) throw new Error('Failed to create route');
    return res.json();
  },

  async updateTransportRoute(id: string, route: Partial<TransportRoute>): Promise<TransportRoute> {
    const res = await fetch(`${API_BASE}/transport/routes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(route)
    });
    if (!res.ok) throw new Error('Failed to update route');
    return res.json();
  },

  async deleteTransportRoute(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/transport/routes/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to delete route');
    return res.json();
  },

  // ================= LIBRARY =================
  async getBooks(schoolId?: string, category?: string, search?: string): Promise<LibraryBook[]> {
    const params = new URLSearchParams();
    if (schoolId) params.append('schoolId', schoolId);
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/library/books?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch books');
    return res.json();
  },

  async createBook(book: Partial<LibraryBook>): Promise<LibraryBook> {
    const res = await fetch(`${API_BASE}/library/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(book)
    });
    if (!res.ok) throw new Error('Failed to create book');
    return res.json();
  },

  async updateBook(id: string, book: Partial<LibraryBook>): Promise<LibraryBook> {
    const res = await fetch(`${API_BASE}/library/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(book)
    });
    if (!res.ok) throw new Error('Failed to update book');
    return res.json();
  },

  async deleteBook(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/library/books/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to delete book');
    return res.json();
  },

  async getBookIssues(schoolId?: string): Promise<BookIssueRecord[]> {
    const url = schoolId ? `${API_BASE}/library/issues?schoolId=${encodeURIComponent(schoolId)}` : `${API_BASE}/library/issues`;
    const res = await fetch(url, { headers: { ...getAuthHeaders() } });
    if (!res.ok) throw new Error('Failed to fetch book issues');
    return res.json();
  },

  async issueBook(issue: Partial<BookIssueRecord>): Promise<BookIssueRecord> {
    const res = await fetch(`${API_BASE}/library/issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(issue)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to issue book');
    }
    return res.json();
  },

  async returnBook(issueId: string, fineAmount: number = 0): Promise<BookIssueRecord> {
    const res = await fetch(`${API_BASE}/library/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ issueId, fineAmount })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to return book');
    }
    return res.json();
  },

  // ================= INVENTORY =================
  async getInventory(schoolId?: string, category?: string): Promise<InventoryItem[]> {
    const params = new URLSearchParams();
    if (schoolId) params.append('schoolId', schoolId);
    if (category) params.append('category', category);
    const res = await fetch(`${API_BASE}/inventory?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
  },

  async createInventoryItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await fetch(`${API_BASE}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Failed to create inventory item');
    return res.json();
  },

  async updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await fetch(`${API_BASE}/inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Failed to update inventory item');
    return res.json();
  },

  async deleteInventoryItem(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/inventory/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to delete inventory item');
    return res.json();
  },

  async adjustInventoryStock(id: string, delta: number): Promise<InventoryItem> {
    const res = await fetch(`${API_BASE}/inventory/${id}/stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ delta })
    });
    if (!res.ok) throw new Error('Failed to adjust stock');
    return res.json();
  },

  // ================= AUDIT LOGS =================
  async getAuditLogs(schoolId?: string, action?: string, actorType?: string): Promise<AuditLogEntry[]> {
    const params = new URLSearchParams();
    if (schoolId) params.append('schoolId', schoolId);
    if (action) params.append('action', action);
    if (actorType) params.append('actorType', actorType);
    const res = await fetch(`${API_BASE}/audit-logs?${params.toString()}`, {
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  }
};
