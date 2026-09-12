import type { School, Student, AttendanceRecord, FeeRecord, ReportCard, Notice, AttendanceStatus, Homework, Staff } from '../types';

const API_BASE = '/api';

/**
 * Returns Bearer token header if admin is authenticated
 */
function getAuthHeaders(): Record<string, string> {
  const token = sessionStorage.getItem('ssm_admin_token');
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
      sessionStorage.setItem('ssm_admin_token', data.token);
      sessionStorage.setItem('ssm_admin_authenticated', 'true');
    }
    return data;
  },

  logoutAdmin(): void {
    sessionStorage.removeItem('ssm_admin_token');
    sessionStorage.removeItem('ssm_admin_authenticated');
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
  }
};
