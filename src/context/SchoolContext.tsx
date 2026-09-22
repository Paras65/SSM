import React, { createContext, useContext, useState, useEffect } from 'react';
import type { School, Student, AttendanceRecord, FeeRecord, ReportCard, Notice, ViewMode, AttendanceStatus, SchoolPlan, ProFeatureKey } from '../types';
import { INITIAL_STUDENTS, INITIAL_FEES, INITIAL_REPORT_CARDS, INITIAL_NOTICES, SCHOOL_INFO } from '../data/mockData';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const EMPTY_SCHOOL: School = {
  id: '',
  name: 'School not configured',
  hindiName: 'विद्यालय आवंटित नहीं है',
  tagline: '',
  affiliate: '',
  affiliationNo: '',
  established: '',
  address: '',
  city: '',
  state: '',
  prant: '',
  phone: '',
  email: '',
  timings: '',
  principalName: '',
  adminPasscode: '',
  plan: 'free',
  udiseCode: '',
  website: ''
};

const PUBLIC_BRAND_SCHOOL: School = {
  id: 'ssm-national',
  name: SCHOOL_INFO.name,
  hindiName: SCHOOL_INFO.hindiName,
  tagline: SCHOOL_INFO.tagline,
  affiliate: SCHOOL_INFO.affiliate,
  affiliationNo: '',
  established: SCHOOL_INFO.established,
  address: SCHOOL_INFO.address,
  city: '',
  state: '',
  prant: '',
  phone: SCHOOL_INFO.phone,
  email: SCHOOL_INFO.email,
  timings: SCHOOL_INFO.timings,
  principalName: SCHOOL_INFO.principalName,
  adminPasscode: '',
  plan: 'free',
  udiseCode: '',
  website: SCHOOL_INFO.website
};

export const DEMO_SANDBOX_SCHOOL: School = {
  id: 'ssm-demo',
  name: 'Saraswati Shishu Mandir Senior Secondary School (Demo Sandbox)',
  hindiName: 'सरस्वती शिशु मंदिर वरिष्ठ माध्यमिक विद्यालय (लाइव डेमो)',
  tagline: 'सा विद्या या विमुक्तये • लाइव सैंडबॉक्स परीक्षण',
  affiliate: 'सम्बद्ध: विद्या भारती अखिल भारतीय शिक्षा संस्थान',
  affiliationNo: 'VB-DEMO-2026',
  established: '1952',
  address: 'विद्या भारती परिसर, आदर्श नगर, नई दिल्ली - 110001',
  city: 'आदर्श नगर (डेमो)',
  state: 'नई दिल्ली',
  prant: 'दिल्ली प्रांत',
  phone: '011-23456789',
  email: 'demo@vidyabharti.net',
  timings: 'प्रातः 7:30 बजे से दोपहर 1:30 बजे तक',
  principalName: 'आचार्य देवव्रत शास्त्री',
  adminPasscode: '1952',
  plan: 'pro',
  udiseCode: '07010100101',
  website: 'https://www.init65.co.in',
  features: {
    enableDynamicUpi: false,
    upiVpa: 'ssmdemo@sbi',
    upiPayeeName: 'सरस्वती शिशु मंदिर लाइव डेमो',
    enableStaffAttendanceLop: false,
    lopDeductionRate: 1
  }
};

interface SchoolContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;

  // Demo Sandbox Mode
  isDemoMode: boolean;
  startDemoMode: () => void;
  exitDemoMode: () => void;

  // Multi-School Management
  schools: School[];
  currentSchool: School;
  publicSchool: School;
  setCurrentSchoolId: (id: string) => void;
  registerSchool: (school: Omit<School, 'id'> & { id?: string }) => Promise<School>;
  updateSchoolInfo: (id: string, updates: Partial<School>) => Promise<School>;
  upgradeCurrentSchoolPlan: (plan: SchoolPlan) => Promise<void>;
  isFeatureAllowed: (feature: ProFeatureKey) => boolean;

  // Database status
  dbStatus: 'connected' | 'connecting' | 'offline';
  dbHost: string;
  refreshFromDb: (schoolIdToFetch?: string) => Promise<void>;

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
  markFeePaid: (feeId: string, paymentMode: string, customPaidAmount?: number) => Promise<void>;
  addFeeRecord: (record: Omit<FeeRecord, 'id'>) => Promise<void>;
  updateFeeRecord: (feeId: string, updates: Partial<FeeRecord>) => Promise<void>;
  deleteFeeRecord: (feeId: string) => Promise<void>;

  // Report Cards
  reportCards: ReportCard[];
  addOrUpdateReportCard: (card: ReportCard) => Promise<void>;
  deleteReportCard: (reportId: string) => Promise<void>;
  getReportCardForStudent: (studentId: string) => ReportCard | undefined;

  // Notices
  notices: Notice[];
  addNotice: (notice: Omit<Notice, 'id'>) => Promise<void>;
  updateNotice: (id: string, updates: Partial<Notice>) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    try {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname.replace(/^\//, '');
        if (path === 'admin' && sessionStorage.getItem('ssm_admin_token')) return 'admin';
        if (path === 'teacher' && sessionStorage.getItem('ssm_teacher_token')) return 'teacher';
        if (path === 'student') return 'student';
        if (path === 'sankul' && sessionStorage.getItem('ssm_sankul_token')) return 'sankul';
      }
    } catch {}
    return 'public';
  });

  const setViewMode = React.useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    try {
      if (typeof window !== 'undefined') {
        const path = mode === 'public' ? '/' : `/${mode}`;
        if (window.location.pathname !== path) {
          window.history.pushState({ viewMode: mode }, '', path);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const stateMode = event.state?.viewMode as ViewMode | undefined;
      const targetMode = stateMode || (window.location.pathname.replace(/^\//, '') as ViewMode);

      if (targetMode === 'admin') {
        setViewModeState(sessionStorage.getItem('ssm_admin_token') ? 'admin' : 'public');
      } else if (targetMode === 'teacher') {
        setViewModeState(sessionStorage.getItem('ssm_teacher_token') ? 'teacher' : 'public');
      } else if (targetMode === 'student') {
        setViewModeState('student');
      } else if (targetMode === 'sankul') {
        setViewModeState(sessionStorage.getItem('ssm_sankul_token') ? 'sankul' : 'public');
      } else {
        setViewModeState('public');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const { showError } = useToast();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Multi-School state
  const readStorage = (key: string): string | null => {
    try {
      if (typeof window === 'undefined') return null;
      if (/^ssm_(students|attendance|fees|report_cards|notices)(_|$)/.test(key)) return null;
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    try {
      Object.keys(localStorage)
        .filter(key => /^ssm_(students|attendance|fees|report_cards|notices)(_|$)/.test(key))
        .forEach(key => localStorage.removeItem(key));
    } catch {
      // Storage may be unavailable or restricted by the browser.
    }
  }, []);

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && window.sessionStorage.getItem('ssm_is_demo') === 'true';
    } catch {
      return false;
    }
  });

  const [schools, setSchools] = useState<School[]>([]);
  const [currentSchoolId, setCurrentSchoolIdState] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const branchParam = params.get('branch') || params.get('school');
        if (branchParam) {
          window.localStorage.setItem('ssm_current_school_id', branchParam);
          return branchParam;
        }
      }
    } catch {}
    return readStorage('ssm_current_school_id') || '';
  });

  const currentSchool = isDemoMode
    ? DEMO_SANDBOX_SCHOOL
    : (schools.find(s => s.id === currentSchoolId) || schools[0] || EMPTY_SCHOOL);
  const publicSchool = PUBLIC_BRAND_SCHOOL;

  // DB connection status
  const [dbStatus, setDbStatus] = useState<'connected' | 'connecting' | 'offline'>('connecting');
  const [dbHost, setDbHost] = useState<string>('MongoDB Atlas');

  // Live Database-Driven Collections (empty by default; populated via MongoDB API)
  const [students, setStudents] = useState<Student[]>([]);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);

  const [reportCards, setReportCards] = useState<ReportCard[]>([]);

  const [notices, setNotices] = useState<Notice[]>([]);

  // Switch active school
  const setCurrentSchoolId = (id: string) => {
    setCurrentSchoolIdState(id);
    localStorage.setItem('ssm_current_school_id', id);
    // Reset session authentication so admin re-authenticates with that school's passcode if needed
    if (sessionStorage.getItem('ssm_admin_role') !== 'developer') {
      api.logoutAdmin();
      api.logoutTeacher();
    }
  };

  // Fetch all collections from MongoDB for the active school
  const refreshFromDb = async (schoolIdToFetch = currentSchoolId) => {
    try {
      setDbStatus('connecting');
      const statusRes = await api.getStatus().catch(() => null);
      if (statusRes && statusRes.database === 'connected') {
        setDbStatus('connected');
        if (statusRes.databaseHost) {
          setDbHost(statusRes.databaseHost.split('-')[0] || 'MongoDB Atlas');
        }

        // Fetch schools list first (publicly accessible)
        const dbSchools = await api.getSchools().catch(() => []);
        if (dbSchools.length > 0) {
          const dummySchoolIds = ['ssm-demo', 'ssm-gorakhpur', 'ssm-delhi', 'ssm-varanasi'];
          const uniqueSchools = dbSchools.filter((s: School, idx: number, arr: School[]) =>
            !dummySchoolIds.includes(s.id) &&
            (s as any).status !== 'demo' &&
            !(s as any).isDemo &&
            idx === arr.findIndex(x => x.id === s.id || ((x.hindiName === s.hindiName || x.name === s.name) && x.city === s.city))
          );
          setSchools(uniqueSchools);
          if (typeof window !== 'undefined') {
            try {
              const params = new URLSearchParams(window.location.search);
              const branchParam = params.get('branch') || params.get('school');
              if (branchParam && uniqueSchools.some((s: School) => s.id === branchParam)) {
                setCurrentSchoolIdState(branchParam);
                localStorage.setItem('ssm_current_school_id', branchParam);
                schoolIdToFetch = branchParam;
              } else if (uniqueSchools.length > 0 && (!currentSchoolId || dummySchoolIds.includes(currentSchoolId) || !uniqueSchools.some((s: School) => s.id === currentSchoolId))) {
                const defaultRealId = uniqueSchools[0].id;
                setCurrentSchoolIdState(defaultRealId);
                localStorage.setItem('ssm_current_school_id', defaultRealId);
                schoolIdToFetch = defaultRealId;
              }
            } catch {}
          }
        } else {
          setSchools([]);
        }

        // Always fetch public notices for the active school so parents see live notices
        api.getNotices(schoolIdToFetch).then(dbNotices => {
          if (Array.isArray(dbNotices)) {
            setNotices(dbNotices);
          }
        }).catch(() => {});

        // Only fetch protected collections if user is actively authenticated for this school or has developer privileges
        const adminRole = sessionStorage.getItem('ssm_admin_role');
        const adminToken = sessionStorage.getItem('ssm_admin_token');
        const isAdminAuth = sessionStorage.getItem('ssm_admin_authenticated') === 'true' && Boolean(adminToken);
        const adminSchoolId = sessionStorage.getItem('ssm_admin_school_id');

        const teacherToken = sessionStorage.getItem('ssm_teacher_token');
        const teacherSchoolId = sessionStorage.getItem('ssm_teacher_school_id');
        const isTeacherAuth = Boolean(teacherToken);

        const isAuthorizedForSchool = (
          (isAdminAuth && (adminRole === 'developer' || !adminSchoolId || adminSchoolId === schoolIdToFetch)) ||
          (isTeacherAuth && (!teacherSchoolId || teacherSchoolId === schoolIdToFetch))
        );

        // API Optimization (Rule 10): Only fetch protected collections if user is actively in admin or teacher view
        const shouldFetchProtected = (viewMode === 'admin' || viewMode === 'teacher') && isAuthorizedForSchool;

        if (shouldFetchProtected) {
          // Fetch records filtered by active school safely using allSettled
          const [studentsRes, attRes, feesRes, repRes] = await Promise.allSettled([
            api.getStudents(schoolIdToFetch),
            api.getAttendance(undefined, schoolIdToFetch),
            api.getFees(schoolIdToFetch),
            api.getReports(schoolIdToFetch)
          ]);

          if (studentsRes.status === 'fulfilled' && Array.isArray(studentsRes.value)) {
            setStudents(studentsRes.value);
            setSelectedStudentId(prev => {
              if (prev && studentsRes.value.some(s => s.id === prev)) return prev;
              return studentsRes.value.length > 0 ? studentsRes.value[0].id : null;
            });
          }
          if (attRes.status === 'fulfilled' && Array.isArray(attRes.value)) {
            setAttendanceRecords(attRes.value);
          }
          if (feesRes.status === 'fulfilled' && Array.isArray(feesRes.value)) {
            setFeeRecords(feesRes.value);
          }
          if (repRes.status === 'fulfilled' && Array.isArray(repRes.value)) {
            setReportCards(repRes.value);
          }
        } else {
          setStudents([]);
          setAttendanceRecords([]);
          setFeeRecords([]);
          setReportCards([]);
        }
      } else {
        setDbStatus('offline');
        setSchools([]);
        setStudents([]);
        setAttendanceRecords([]);
        setFeeRecords([]);
        setReportCards([]);
        setNotices([]);
      }
    } catch (err) {
      console.warn('MongoDB API not reachable, using offline cache:', err);
      setDbStatus('offline');
      setSchools([]);
      setStudents([]);
      setAttendanceRecords([]);
      setFeeRecords([]);
      setReportCards([]);
      setNotices([]);
    }
  };

  // Trigger re-fetch whenever the active school or viewMode changes
  useEffect(() => {
    refreshFromDb(currentSchoolId);
  }, [currentSchoolId, viewMode]);

  // Centralized collision-proof client ID generator
  const generateClientId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

  // Register new school
  const registerSchool = async (schoolData: Omit<School, 'id'> & { id?: string }): Promise<School> => {
    try {
      const created = await api.createSchool(schoolData);
      setSchools(prev => [...prev, created]);
      setCurrentSchoolId(created.id);
      return created;
    } catch (err) {
      console.error('Error creating school in MongoDB:', err);
      throw err;
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
    if (isDemoMode) return true;
    return currentSchool?.plan === 'pro';
  };

  const startDemoMode = () => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('ssm_is_demo', 'true');
        window.sessionStorage.setItem('ssm_admin_token', 'demo_session_token_1952');
        window.sessionStorage.setItem('ssm_admin_role', 'principal');
      }
    } catch {
      // storage unavailable
    }
    setIsDemoMode(true);
    setSchools([DEMO_SANDBOX_SCHOOL]);
    setCurrentSchoolIdState('ssm-demo');
    localStorage.setItem('ssm_current_school_id', 'ssm-demo');
    setStudents(INITIAL_STUDENTS);
    setFeeRecords(INITIAL_FEES);
    setReportCards(INITIAL_REPORT_CARDS);
    setNotices(INITIAL_NOTICES);
    setSelectedStudentId(INITIAL_STUDENTS[0]?.id || null);
    setViewMode('admin');
  };

  const exitDemoMode = () => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('ssm_is_demo');
        window.sessionStorage.removeItem('ssm_admin_token');
        window.sessionStorage.removeItem('ssm_admin_role');
      }
    } catch {
      // storage unavailable
    }
    setIsDemoMode(false);
    setViewMode('public');
    const resetSchoolId = (currentSchoolId === 'ssm-demo' || !currentSchoolId)
      ? (schools.find(s => s.id !== 'ssm-demo')?.id || '')
      : currentSchoolId;
    setCurrentSchoolIdState(resetSchoolId);
    try {
      localStorage.setItem('ssm_current_school_id', resetSchoolId);
    } catch {}
    refreshFromDb(resetSchoolId);
  };

  // Student actions (MongoDB + Optimistic)
  const addStudent = async (studentData: Omit<Student, 'id'>) => {
    const tempId = generateClientId('ssm');
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
      // Rollback: remove optimistically added student on failure
      setStudents(prev => prev.filter(s => s.id !== tempId));
      console.error('Error saving student to MongoDB:', err);
      throw err; // Re-throw so callers (e.g. bulk scanner) can detect per-row failures
    }
  };

  const updateStudent = async (updatedStudent: Student) => {
    const prevSnapshot = students.find(o => o.id === updatedStudent.id);
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    if (updatedStudent.class && prevSnapshot && prevSnapshot.class !== updatedStudent.class) {
      setAttendanceRecords(prev => prev.map(a => a.studentId === updatedStudent.id ? { ...a, class: updatedStudent.class } : a));
    }
    try {
      await api.updateStudent(updatedStudent.id, {
        ...updatedStudent,
        schoolId: currentSchool.id
      });
    } catch (err) {
      // Rollback: restore previous student data on failure
      if (prevSnapshot) {
        setStudents(prev => prev.map(s => s.id === updatedStudent.id ? prevSnapshot : s));
      }
      showError('छात्र डेटा अपडेट करने में त्रुटि! परिवर्तन वापस ले लिए गए हैं।');
      console.error('Error updating student in MongoDB:', err);
    }
  };

  const deleteStudent = async (id: string) => {
    const snapshot = students.find(s => s.id === id);
    setStudents(prev => prev.filter(s => s.id !== id));
    setFeeRecords(prev => prev.filter(f => f.studentId !== id));
    setAttendanceRecords(prev => prev.filter(a => a.studentId !== id));
    setReportCards(prev => prev.filter(r => r.studentId !== id));
    try {
      await api.deleteStudent(id);
    } catch (err) {
      // Rollback: re-insert deleted student on failure
      if (snapshot) setStudents(prev => [snapshot, ...prev]);
      showError('छात्र रिकॉर्ड हटाने में त्रुटि! रिकॉर्ड पुनर्स्थापित कर दिया गया है।');
      console.error('Error deleting student from MongoDB:', err);
    }
  };

  const bulkAddStudents = async (studentsList: Partial<Student>[]): Promise<number> => {
    if (!studentsList.length) return 0;
    const targetSchoolId = currentSchool.id;
    const timestamp = Date.now().toString(36);
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const preparedList: Student[] = studentsList.map((s, idx) => ({
      id: s.id || `ssm-${timestamp}-${randomSuffix}-${idx + 1}`,
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
      // Rollback: remove optimistically added bulk students on failure
      setStudents(prev => prev.filter(s => !preparedList.some(p => p.id === s.id)));
      console.error('Error in bulk saving students to MongoDB:', err);
      throw err;
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
  const markFeePaid = async (feeId: string, paymentMode: string, customPaidAmount?: number) => {
    const prevFee = feeRecords.find(f => f.id === feeId);
    const schoolSuffix = (currentSchool.id || 'SSM').slice(-4).toUpperCase();
    setFeeRecords(prev => prev.map(fee => {
      if (fee.id === feeId) {
        const targetAmount = typeof customPaidAmount === 'number' && customPaidAmount > 0
          ? Math.min(fee.totalAmount, customPaidAmount)
          : fee.totalAmount;
        const newStatus = targetAmount >= fee.totalAmount ? 'Paid' : 'Partial';
        return {
          ...fee,
          paidAmount: targetAmount,
          status: newStatus,
          paidDate: new Date().toISOString().split('T')[0],
          receiptNo: fee.receiptNo || `SSM-REC-${new Date().getFullYear()}-${schoolSuffix}-${Date.now().toString().slice(-6)}`,
          paymentMode
        };
      }
      return fee;
    }));

    try {
      await api.payFee(feeId, paymentMode, customPaidAmount);
    } catch (err) {
      if (prevFee) {
        setFeeRecords(prev => prev.map(f => f.id === feeId ? prevFee : f));
      }
      showError('शुल्क भुगतान दर्ज करने में त्रुटि!');
      console.error('Error saving fee payment to MongoDB:', err);
    }
  };

  const addFeeRecord = async (record: Omit<FeeRecord, 'id'>) => {
    const tempId = generateClientId('fee');
    const newRecord: FeeRecord = { ...record, id: tempId, schoolId: currentSchool.id };
    setFeeRecords(prev => [newRecord, ...prev]);

    try {
      const created = await api.createFee(newRecord);
      setFeeRecords(prev => prev.map(f => f.id === tempId ? created : f));
    } catch (err) {
      // Rollback: remove optimistically added fee record on failure
      setFeeRecords(prev => prev.filter(f => f.id !== tempId));
      showError('शुल्क रिकॉर्ड जोड़ने में त्रुटि!');
      console.error('Error creating fee record in MongoDB:', err);
    }
  };

  const updateFeeRecord = async (feeId: string, updates: Partial<FeeRecord>) => {
    const prevFee = feeRecords.find(f => f.id === feeId);
    setFeeRecords(prev => prev.map(f => f.id === feeId ? { ...f, ...updates } : f));

    try {
      await api.updateFee(feeId, updates);
    } catch (err) {
      if (prevFee) setFeeRecords(prev => prev.map(f => f.id === feeId ? prevFee : f));
      showError('शुल्क रिकॉर्ड संशोधित करने में त्रुटि!');
      console.error('Error updating fee record in MongoDB:', err);
    }
  };

  const deleteFeeRecord = async (feeId: string) => {
    const snapshot = feeRecords.find(f => f.id === feeId);
    setFeeRecords(prev => prev.filter(f => f.id !== feeId));

    try {
      await api.deleteFee(feeId);
    } catch (err) {
      if (snapshot) setFeeRecords(prev => [snapshot, ...prev]);
      showError('शुल्क रिकॉर्ड हटाने में त्रुटि! रिकॉर्ड पुनर्स्थापित कर दिया गया है।');
      console.error('Error deleting fee record from MongoDB:', err);
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

  const deleteReportCard = async (reportId: string) => {
    const snapshot = reportCards.find(r => r.id === reportId);
    setReportCards(prev => prev.filter(r => r.id !== reportId));
    try {
      await api.deleteReport(reportId);
    } catch (err) {
      if (snapshot) setReportCards(prev => [snapshot, ...prev]);
      showError('प्रगति पत्र हटाने में त्रुटि! रिकॉर्ड पुनर्स्थापित कर दिया गया है।');
      console.error('Error deleting report card from MongoDB:', err);
    }
  };

  const getReportCardForStudent = (studentId: string): ReportCard | undefined => {
    return reportCards.find(c => c.studentId === studentId);
  };

  // Notices actions (MongoDB + Optimistic)
  const addNotice = async (notice: Omit<Notice, 'id'>) => {
    const tempId = generateClientId('not');
    const newNotice: Notice = { ...notice, id: tempId, schoolId: currentSchool.id };
    setNotices(prev => [newNotice, ...prev]);

    try {
      const created = await api.createNotice(newNotice);
      setNotices(prev => prev.map(n => n.id === tempId ? created : n));
    } catch (err) {
      // Rollback: remove optimistically added notice on failure
      setNotices(prev => prev.filter(n => n.id !== tempId));
      showError('सूचना जोड़ने में त्रुटि!');
      console.error('Error saving notice to MongoDB:', err);
    }
  };

  const deleteNotice = async (id: string) => {
    const snapshot = notices.find(n => n.id === id);
    setNotices(prev => prev.filter(n => n.id !== id));
    try {
      await api.deleteNotice(id);
    } catch (err) {
      if (snapshot) setNotices(prev => [snapshot, ...prev]);
      showError('सूचना हटाने में त्रुटि! सूचना पुनर्स्थापित कर दी गई है।');
      console.error('Error deleting notice from MongoDB:', err);
    }
  };

  const updateNotice = async (id: string, updates: Partial<Notice>) => {
    const snapshot = notices.find(n => n.id === id);
    setNotices(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    try {
      await api.updateNotice(id, updates);
    } catch (err) {
      if (snapshot) setNotices(prev => prev.map(n => n.id === id ? snapshot : n));
      showError('सूचना अपडेट करने में त्रुटि! परिवर्तन पूर्ववत कर दिए गए हैं।');
      console.error('Error updating notice in MongoDB:', err);
    }
  };

  return (
    <SchoolContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedStudentId,
        setSelectedStudentId,
        isDemoMode,
        startDemoMode,
        exitDemoMode,
        schools,
        currentSchool,
        publicSchool,
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
        updateFeeRecord,
        deleteFeeRecord,
        reportCards,
        addOrUpdateReportCard,
        deleteReportCard,
        getReportCardForStudent,
        notices,
        addNotice,
        updateNotice,
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
