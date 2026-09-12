import React, { createContext, useContext, useState, useEffect } from 'react';
import type { School, Student, AttendanceRecord, FeeRecord, ReportCard, Notice, ViewMode, AttendanceStatus, SchoolPlan, ProFeatureKey } from '../types';
import { INITIAL_STUDENTS, INITIAL_FEES, INITIAL_REPORT_CARDS, INITIAL_NOTICES } from '../data/mockData';
import { api } from '../services/api';

const DEFAULT_FALLBACK_SCHOOL: School = {
  id: 'ssm-gorakhpur',
  name: 'Saraswati Shishu Mandir Senior Secondary School, Gorakhpur',
  hindiName: 'सरस्वती शिशु मंदिर वरिष्ठ माध्यमिक विद्यालय, गोरखपुर',
  tagline: 'सा विद्या या विमुक्तये (That is knowledge which liberates)',
  affiliate: 'सम्बद्ध: विद्या भारती अखिल भारतीय शिक्षा संस्थान एवं CBSE',
  affiliationNo: 'VB-UP-1952-001',
  established: '1952',
  address: 'विद्या भारती मार्ग, सिविल लाइंस, गोरखपुर, उत्तर प्रदेश - 273001',
  city: 'गोरखपुर',
  state: 'उत्तर प्रदेश',
  prant: 'गोरक्ष प्रांत',
  phone: '+91 551 2345678',
  email: 'gorakhpur@ssm.edu.in',
  timings: 'प्रातः 7:30 बजे से दोपहर 1:30 बजे तक (सोम-शनि)',
  principalName: 'आचार्य राम नारायण शुक्ला',
  adminPasscode: '1952',
  plan: 'pro'
};

interface SchoolContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;

  // Multi-School Management
  schools: School[];
  currentSchool: School;
  setCurrentSchoolId: (id: string) => void;
  registerSchool: (school: Omit<School, 'id'> & { id?: string }) => Promise<School>;
  updateSchoolInfo: (id: string, updates: Partial<School>) => Promise<School>;
  upgradeCurrentSchoolPlan: (plan: SchoolPlan) => Promise<void>;
  isFeatureAllowed: (feature: ProFeatureKey) => boolean;

  // Database status
  dbStatus: 'connected' | 'connecting' | 'offline';
  dbHost: string;
  refreshFromDb: () => Promise<void>;

  // Students
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  bulkAddStudents: (students: Partial<Student>[]) => Promise<number>;

  // Attendance
  attendanceRecords: AttendanceRecord[];
  setStudentAttendance: (studentId: string, date: string, status: AttendanceStatus) => Promise<void>;
  bulkSetAttendance: (classGroup: string, date: string, status: AttendanceStatus) => Promise<void>;
  getAttendanceForDate: (date: string) => Record<string, AttendanceStatus>;

  // Fees
  feeRecords: FeeRecord[];
  markFeePaid: (feeId: string, paymentMode: string) => Promise<void>;
  addFeeRecord: (record: Omit<FeeRecord, 'id'>) => Promise<void>;

  // Report Cards
  reportCards: ReportCard[];
  addOrUpdateReportCard: (card: ReportCard) => Promise<void>;
  getReportCardForStudent: (studentId: string) => ReportCard | undefined;

  // Notices
  notices: Notice[];
  addNotice: (notice: Omit<Notice, 'id'>) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('public');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>('ssm-001');

  // Multi-School state
  const [schools, setSchools] = useState<School[]>([DEFAULT_FALLBACK_SCHOOL]);
  const [currentSchoolId, setCurrentSchoolIdState] = useState<string>(() => {
    return localStorage.getItem('ssm_current_school_id') || 'ssm-gorakhpur';
  });

  const currentSchool = schools.find(s => s.id === currentSchoolId) || schools[0] || DEFAULT_FALLBACK_SCHOOL;

  // DB connection status
  const [dbStatus, setDbStatus] = useState<'connected' | 'connecting' | 'offline'>('connecting');
  const [dbHost, setDbHost] = useState<string>('MongoDB Atlas');

  // States initialized with local fallback or empty
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`ssm_students_${currentSchoolId}`);
    if (saved) return JSON.parse(saved);
    const legacy = localStorage.getItem('ssm_students');
    return legacy ? JSON.parse(legacy) : INITIAL_STUDENTS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`ssm_attendance_${currentSchoolId}`);
    if (saved) return JSON.parse(saved);
    const legacy = localStorage.getItem('ssm_attendance');
    if (legacy) return JSON.parse(legacy);
    const today = new Date().toISOString().split('T')[0];
    return INITIAL_STUDENTS.map((s, idx) => ({
      id: `att-${idx}`,
      studentId: s.id,
      date: today,
      status: (idx === 3 ? 'Absent' : idx === 6 ? 'Leave' : 'Present') as AttendanceStatus
    }));
  });

  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>(() => {
    const saved = localStorage.getItem(`ssm_fees_${currentSchoolId}`);
    if (saved) return JSON.parse(saved);
    const legacy = localStorage.getItem('ssm_fees');
    return legacy ? JSON.parse(legacy) : INITIAL_FEES;
  });

  const [reportCards, setReportCards] = useState<ReportCard[]>(() => {
    const saved = localStorage.getItem(`ssm_report_cards_${currentSchoolId}`);
    if (saved) return JSON.parse(saved);
    const legacy = localStorage.getItem('ssm_report_cards');
    return legacy ? JSON.parse(legacy) : INITIAL_REPORT_CARDS;
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem(`ssm_notices_${currentSchoolId}`);
    if (saved) return JSON.parse(saved);
    const legacy = localStorage.getItem('ssm_notices');
    return legacy ? JSON.parse(legacy) : INITIAL_NOTICES;
  });

  // Switch active school
  const setCurrentSchoolId = (id: string) => {
    setCurrentSchoolIdState(id);
    localStorage.setItem('ssm_current_school_id', id);
    // Reset session authentication so admin re-authenticates with that school's passcode if needed
    sessionStorage.removeItem('ssm_admin_authenticated');
  };

  // Fetch all collections from MongoDB for the active school
  const refreshFromDb = async (schoolIdToFetch = currentSchoolId) => {
    try {
      setDbStatus('connecting');
      const statusRes = await api.getStatus();
      if (statusRes.database === 'connected') {
        setDbStatus('connected');
        if (statusRes.databaseHost) {
          setDbHost(statusRes.databaseHost.split('-')[0] || 'MongoDB Atlas');
        }

        // Fetch schools list first
        const dbSchools = await api.getSchools().catch(() => []);
        if (dbSchools.length > 0) {
          setSchools(dbSchools);
        }

        // Fetch records filtered by active school
        const [dbStudents, dbAttendance, dbFees, dbReports, dbNotices] = await Promise.all([
          api.getStudents(schoolIdToFetch),
          api.getAttendance(undefined, schoolIdToFetch),
          api.getFees(schoolIdToFetch),
          api.getReports(schoolIdToFetch),
          api.getNotices(schoolIdToFetch)
        ]);

        setStudents(dbStudents);
        setAttendanceRecords(dbAttendance);
        setFeeRecords(dbFees);
        setReportCards(dbReports);
        setNotices(dbNotices);

        if (dbStudents.length > 0) {
          setSelectedStudentId(prev => (prev && dbStudents.some(s => s.id === prev) ? prev : dbStudents[0].id));
        } else {
          setSelectedStudentId(null);
        }
      } else {
        setDbStatus('offline');
      }
    } catch (err) {
      console.warn('MongoDB API not reachable, using offline cache:', err);
      setDbStatus('offline');
    }
  };

  // Trigger re-fetch whenever the active school changes
  useEffect(() => {
    refreshFromDb(currentSchoolId);
  }, [currentSchoolId]);

  // Save active school records to localStorage as backup
  useEffect(() => {
    localStorage.setItem(`ssm_students_${currentSchoolId}`, JSON.stringify(students));
  }, [students, currentSchoolId]);

  useEffect(() => {
    localStorage.setItem(`ssm_attendance_${currentSchoolId}`, JSON.stringify(attendanceRecords));
  }, [attendanceRecords, currentSchoolId]);

  useEffect(() => {
    localStorage.setItem(`ssm_fees_${currentSchoolId}`, JSON.stringify(feeRecords));
  }, [feeRecords, currentSchoolId]);

  useEffect(() => {
    localStorage.setItem(`ssm_report_cards_${currentSchoolId}`, JSON.stringify(reportCards));
  }, [reportCards, currentSchoolId]);

  useEffect(() => {
    localStorage.setItem(`ssm_notices_${currentSchoolId}`, JSON.stringify(notices));
  }, [notices, currentSchoolId]);

  // Register new school
  const registerSchool = async (schoolData: Omit<School, 'id'> & { id?: string }): Promise<School> => {
    try {
      const created = await api.createSchool(schoolData);
      setSchools(prev => [...prev, created]);
      setCurrentSchoolId(created.id);
      return created;
    } catch (err) {
      console.error('Error creating school in MongoDB:', err);
      const fallbackId = schoolData.id || `ssm-branch-${Date.now().toString().slice(-4)}`;
      const newSchool: School = { ...schoolData, id: fallbackId };
      setSchools(prev => [...prev, newSchool]);
      setCurrentSchoolId(newSchool.id);
      return newSchool;
    }
  };

  const updateSchoolInfo = async (id: string, updates: Partial<School>): Promise<School> => {
    try {
      const updated = await api.updateSchool(id, updates);
      setSchools(prev => prev.map(s => s.id === id ? updated : s));
      return updated;
    } catch (err) {
      console.error('Error updating school in MongoDB:', err);
      setSchools(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      return { ...currentSchool, ...updates };
    }
  };

  const upgradeCurrentSchoolPlan = async (plan: SchoolPlan) => {
    if (!currentSchool) return;
    await updateSchoolInfo(currentSchool.id, { plan });
  };

  const isFeatureAllowed = (_feature: ProFeatureKey): boolean => {
    const plan = currentSchool?.plan || (currentSchool?.id === 'ssm-gorakhpur' ? 'pro' : 'free');
    return plan === 'pro';
  };

  // Student actions (MongoDB + Optimistic)
  const addStudent = async (studentData: Omit<Student, 'id'>) => {
    const tempId = `ssm-${Date.now().toString().slice(-4)}`;
    const newStudent: Student = {
      ...studentData,
      id: tempId,
      schoolId: currentSchool.id
    };
    setStudents(prev => [newStudent, ...prev]);

    try {
      const created = await api.createStudent(newStudent);
      setStudents(prev => prev.map(s => s.id === tempId ? created : s));
    } catch (err) {
      console.error('Error saving student to MongoDB:', err);
    }
  };

  const updateStudent = async (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    try {
      await api.updateStudent(updatedStudent.id, {
        ...updatedStudent,
        schoolId: currentSchool.id
      });
    } catch (err) {
      console.error('Error updating student in MongoDB:', err);
    }
  };

  const deleteStudent = async (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    try {
      await api.deleteStudent(id);
    } catch (err) {
      console.error('Error deleting student from MongoDB:', err);
    }
  };

  const bulkAddStudents = async (studentsList: Partial<Student>[]): Promise<number> => {
    if (!studentsList.length) return 0;
    const targetSchoolId = currentSchool.id;
    const timestamp = Date.now().toString().slice(-4);
    const preparedList: Student[] = studentsList.map((s, idx) => ({
      id: s.id || `ssm-${timestamp}-${idx + 1}`,
      schoolId: targetSchoolId,
      rollNo: s.rollNo ? s.rollNo.toString() : (101 + idx).toString(),
      name: s.name || `छात्र ${idx + 1}`,
      gender: s.gender === 'Bahin' ? 'Bahin' : 'Bhaiya',
      class: s.class || 'Class 6',
      section: s.section || 'A',
      fatherName: s.fatherName || 'श्री अभिभावक',
      motherName: s.motherName || 'श्रीमती माता जी',
      contact: s.contact || '+91 98765 43210',
      address: s.address || 'स्थानिक पता',
      dob: s.dob || '2014-01-01',
      admissionDate: s.admissionDate || new Date().toISOString().split('T')[0],
      bloodGroup: s.bloodGroup || 'B+'
    }));

    setStudents(prev => [...preparedList, ...prev]);

    try {
      const res = await api.bulkCreateStudents(preparedList, targetSchoolId);
      if (res && res.count) {
        refreshFromDb(targetSchoolId);
        return res.count;
      }
    } catch (err) {
      console.error('Error in bulk saving students to MongoDB:', err);
    }
    return preparedList.length;
  };

  // Attendance actions (MongoDB + Optimistic)
  const setStudentAttendance = async (studentId: string, date: string, status: AttendanceStatus) => {
    setAttendanceRecords(prev => {
      const filtered = prev.filter(a => !(a.studentId === studentId && a.date === date));
      return [...filtered, { id: `att-${date}-${studentId}`, studentId, date, status, schoolId: currentSchool.id }];
    });

    try {
      await api.setAttendance(studentId, date, status, currentSchool.id);
    } catch (err) {
      console.error('Error saving attendance to MongoDB:', err);
    }
  };

  const bulkSetAttendance = async (classGroup: string, date: string, status: AttendanceStatus) => {
    const targetStudents = classGroup === 'ALL'
      ? students
      : students.filter(s => s.class.includes(classGroup));

    const updates = targetStudents.map(s => ({
      studentId: s.id,
      date,
      status,
      schoolId: currentSchool.id
    }));

    setAttendanceRecords(prev => {
      const targetIds = new Set(targetStudents.map(s => s.id));
      const filtered = prev.filter(a => !(targetIds.has(a.studentId) && a.date === date));
      const newEntries = targetStudents.map(s => ({
        id: `att-${date}-${s.id}`,
        studentId: s.id,
        date,
        status,
        schoolId: currentSchool.id
      }));
      return [...filtered, ...newEntries];
    });

    try {
      await api.setBulkAttendance(updates, currentSchool.id);
    } catch (err) {
      console.error('Error saving bulk attendance to MongoDB:', err);
    }
  };

  const getAttendanceForDate = (date: string): Record<string, AttendanceStatus> => {
    const result: Record<string, AttendanceStatus> = {};
    attendanceRecords.filter(a => a.date === date).forEach(a => {
      result[a.studentId] = a.status;
    });
    return result;
  };

  // Fee actions (MongoDB + Optimistic)
  const markFeePaid = async (feeId: string, paymentMode: string) => {
    setFeeRecords(prev => prev.map(fee => {
      if (fee.id === feeId) {
        return {
          ...fee,
          paidAmount: fee.totalAmount,
          status: 'Paid',
          paidDate: new Date().toISOString().split('T')[0],
          receiptNo: `SSM-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          paymentMode
        };
      }
      return fee;
    }));

    try {
      await api.payFee(feeId, paymentMode);
    } catch (err) {
      console.error('Error saving fee payment to MongoDB:', err);
    }
  };

  const addFeeRecord = async (record: Omit<FeeRecord, 'id'>) => {
    const tempId = `fee-${Date.now().toString().slice(-4)}`;
    const newRecord: FeeRecord = { ...record, id: tempId, schoolId: currentSchool.id };
    setFeeRecords(prev => [newRecord, ...prev]);

    try {
      const created = await api.createFee(newRecord);
      setFeeRecords(prev => prev.map(f => f.id === tempId ? created : f));
    } catch (err) {
      console.error('Error creating fee record in MongoDB:', err);
    }
  };

  // Report cards actions (MongoDB + Optimistic)
  const addOrUpdateReportCard = async (card: ReportCard) => {
    const cardWithSchool = { ...card, schoolId: currentSchool.id };
    setReportCards(prev => {
      const filtered = prev.filter(c => c.id !== card.id && c.studentId !== card.studentId);
      return [cardWithSchool, ...filtered];
    });

    try {
      await api.saveReport(cardWithSchool);
    } catch (err) {
      console.error('Error saving report card to MongoDB:', err);
    }
  };

  const getReportCardForStudent = (studentId: string): ReportCard | undefined => {
    return reportCards.find(c => c.studentId === studentId);
  };

  // Notices actions (MongoDB + Optimistic)
  const addNotice = async (notice: Omit<Notice, 'id'>) => {
    const tempId = `not-${Date.now().toString().slice(-4)}`;
    const newNotice: Notice = { ...notice, id: tempId, schoolId: currentSchool.id };
    setNotices(prev => [newNotice, ...prev]);

    try {
      const created = await api.createNotice(newNotice);
      setNotices(prev => prev.map(n => n.id === tempId ? created : n));
    } catch (err) {
      console.error('Error saving notice to MongoDB:', err);
    }
  };

  const deleteNotice = async (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
    try {
      await api.deleteNotice(id);
    } catch (err) {
      console.error('Error deleting notice from MongoDB:', err);
    }
  };

  return (
    <SchoolContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedStudentId,
        setSelectedStudentId,
        schools,
        currentSchool,
        setCurrentSchoolId,
        registerSchool,
        updateSchoolInfo,
        upgradeCurrentSchoolPlan,
        isFeatureAllowed,
        dbStatus,
        dbHost,
        refreshFromDb,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        bulkAddStudents,
        attendanceRecords,
        setStudentAttendance,
        bulkSetAttendance,
        getAttendanceForDate,
        feeRecords,
        markFeePaid,
        addFeeRecord,
        reportCards,
        addOrUpdateReportCard,
        getReportCardForStudent,
        notices,
        addNotice,
        deleteNotice
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
