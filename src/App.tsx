import React, { useEffect, useState } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Navbar } from './components/public/Navbar';
import { Hero } from './components/public/Hero';
import { NoticeBoard } from './components/public/NoticeBoard';
import { DailyPanchang } from './components/public/DailyPanchang';
import { AboutSection } from './components/public/AboutSection';
import { PanchmukhiShiksha } from './components/public/PanchmukhiShiksha';
import { VandanaCorner } from './components/public/VandanaCorner';
import { AcharyaSection } from './components/public/AcharyaSection';
import { AdmissionInquiry } from './components/public/AdmissionInquiry';
import { Gallery } from './components/public/Gallery';
import { ContactSection } from './components/public/ContactSection';
import { TCVerificationModal } from './components/public/TCVerificationModal';
import { Footer } from './components/public/Footer';
import { LegalInformation } from './components/public/LegalInformation';
import { OfflineBadge } from './components/common/OfflineBadge';
import { DemoBanner } from './components/common/DemoBanner';
import { PwaInstallBanner } from './components/common/PwaInstallBanner';
import { AdminAuthModal } from './components/admin/AdminAuthModal';
import { ERPModulesSection } from './components/public/ERPModulesSection';
import { TeacherAuthModal } from './components/teacher/TeacherAuthModal';
import { SchoolManagementModal } from './components/admin/SchoolManagementModal';
import { SchoolLocatorModal } from './components/public/SchoolLocatorModal';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/common/ToastContainer';

const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const TeacherPortal = React.lazy(() => import('./components/teacher/TeacherPortal').then(m => ({ default: m.TeacherPortal })));
const StudentPortal = React.lazy(() => import('./components/student/StudentPortal').then(m => ({ default: m.StudentPortal })));

const PortalLoadingFallback: React.FC<{ label: string }> = ({ label }) => (
  <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
    <div className="w-10 h-10 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin mb-3" />
    <p className="text-sm font-bold text-orange-950">{label}</p>
    <p className="text-xs text-stone-500 mt-1">सरस्वती शिशु मंदिर ईआरपी पोर्टल</p>
  </div>
);

interface PEBState { hasError: boolean; error: Error | null; }
class PortalErrorBoundary extends React.Component<{ children: React.ReactNode }, PEBState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): PEBState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (import.meta.env.DEV) console.error('[PortalErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <span className="text-5xl">⚠️</span>
          <div>
            <h2 className="text-lg font-black text-stone-800 mb-1">पोर्टल में अप्रत्याशित त्रुटि</h2>
            <p className="text-sm text-stone-500 max-w-sm">
              पोर्टल लोड करते समय एक त्रुटि हुई। कृपया पुनः प्रयास करें या मुख्य पृष्ठ पर जाएं।
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-3 text-left text-xs bg-red-50 border border-red-200 rounded-lg p-3 max-w-lg overflow-auto text-red-700">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition cursor-pointer"
          >
            🏠 मुख्य पृष्ठ पर वापस जाएं
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const SchoolApp: React.FC = () => {
  const { viewMode, setViewMode, startDemoMode } = useSchool();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTeacherAuthModal, setShowTeacherAuthModal] = useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showSchoolLocatorModal, setShowSchoolLocatorModal] = useState(false);
  const [showTcVerificationModal, setShowTcVerificationModal] = useState(false);
  const [schoolModalMode, setSchoolModalMode] = useState<'list' | 'add'>('list');
  const [schoolModalPlan, setSchoolModalPlan] = useState<'free' | 'pro'>('free');

  useEffect(() => {
    if (window.location.pathname === '/admin') {
      if (!sessionStorage.getItem('ssm_admin_token')) {
        setShowAuthModal(true);
      }
    } else if (window.location.pathname === '/teacher') {
      if (!sessionStorage.getItem('ssm_teacher_token')) {
        setShowTeacherAuthModal(true);
      }
    }
  }, []);

  const isAnyPublicModalOpen = showAuthModal || showTeacherAuthModal || showSchoolModal || showSchoolLocatorModal || showTcVerificationModal;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAnyPublicModalOpen) {
        setShowAuthModal(false);
        setShowTeacherAuthModal(false);
        setShowSchoolModal(false);
        setShowSchoolLocatorModal(false);
        setShowTcVerificationModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnyPublicModalOpen]);

  useEffect(() => {
    const handlePopState = () => {
      if (isAnyPublicModalOpen) {
        setShowAuthModal(false);
        setShowTeacherAuthModal(false);
        setShowSchoolModal(false);
        setShowSchoolLocatorModal(false);
        setShowTcVerificationModal(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAnyPublicModalOpen]);

  const handleOpenSignUp = (plan: 'free' | 'pro' = 'free') => {
    setSchoolModalPlan(plan);
    setSchoolModalMode('add');
    setShowSchoolModal(true);
  };

  const handleOpenLogin = () => {
    const isAuth = Boolean(sessionStorage.getItem('ssm_admin_token'));
    if (isAuth) {
      setViewMode('admin');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleOpenBranchList = () => {
    setShowSchoolLocatorModal(true);
  };

  return (
    <>
      <DemoBanner />
      <OfflineBadge />
      {viewMode === 'admin' ? (
        <PortalErrorBoundary>
          <React.Suspense fallback={<PortalLoadingFallback label="व्यवस्थापक नियंत्रण पटल लोड हो रहा है..." />}>
            <AdminDashboard />
          </React.Suspense>
        </PortalErrorBoundary>
      ) : viewMode === 'teacher' ? (
        <PortalErrorBoundary>
          <React.Suspense fallback={<PortalLoadingFallback label="आचार्य पोर्टल लोड हो रहा है..." />}>
            <TeacherPortal />
          </React.Suspense>
        </PortalErrorBoundary>
      ) : viewMode === 'student' ? (
        <PortalErrorBoundary>
          <React.Suspense fallback={<PortalLoadingFallback label="छात्र एवं अभिभावक पोर्टल लोड हो रहा है..." />}>
            <StudentPortal />
          </React.Suspense>
        </PortalErrorBoundary>
      ) : (
        <div className="min-h-screen bg-stone-50 flex flex-col w-full max-w-full overflow-x-hidden">
          <Navbar
            onOpenSignUp={handleOpenSignUp}
            onOpenLogin={handleOpenLogin}
            onOpenBranchList={handleOpenBranchList}
            onOpenTeacherLogin={() => setShowTeacherAuthModal(true)}
            onOpenVerifyTc={() => setShowTcVerificationModal(true)}
            onStartDemo={startDemoMode}
          />
          <main className="flex-1">
            <Hero
              onOpenSignUp={() => handleOpenSignUp('free')}
              onOpenLogin={handleOpenLogin}
              onOpenTeacherLogin={() => setShowTeacherAuthModal(true)}
              onOpenBranchList={handleOpenBranchList}
              onOpenVerifyTc={() => setShowTcVerificationModal(true)}
              onStartDemo={startDemoMode}
            />
            <ERPModulesSection
              onOpenSignUp={() => handleOpenSignUp('free')}
              onOpenLogin={handleOpenLogin}
            />
            <DailyPanchang />
            <NoticeBoard />
            <AdmissionInquiry />
            <AboutSection onOpenSignUp={(plan = 'pro') => handleOpenSignUp(plan)} />
            <PanchmukhiShiksha />
            <VandanaCorner />
            <AcharyaSection />
            <Gallery />
            <ContactSection
              onOpenSignUp={(plan = 'pro') => handleOpenSignUp(plan)}
              onOpenBranchList={handleOpenBranchList}
            />
          </main>
          <LegalInformation />
          <Footer />
        </div>
      )}
      <PwaInstallBanner />

      {/* Admin Passcode Modal */}
      <AdminAuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          if (typeof window !== 'undefined' && window.location.pathname === '/admin' && viewMode !== 'admin') {
            window.history.replaceState({}, '', '/');
          }
        }}
        onSuccess={() => {
          setShowAuthModal(false);
          setViewMode('admin');
        }}
        onOpenSignUp={(plan = 'free') => {
          setShowAuthModal(false);
          handleOpenSignUp(plan);
        }}
      />

      {/* Teacher Auth Modal */}
      <TeacherAuthModal
        isOpen={showTeacherAuthModal}
        onClose={() => {
          setShowTeacherAuthModal(false);
          if (typeof window !== 'undefined' && window.location.pathname === '/teacher' && viewMode !== 'teacher') {
            window.history.replaceState({}, '', '/');
          }
        }}
        onSuccess={() => {
          setShowTeacherAuthModal(false);
          setViewMode('teacher');
        }}
      />

      {/* TC Verification Modal */}
      <TCVerificationModal
        isOpen={showTcVerificationModal}
        onClose={() => setShowTcVerificationModal(false)}
      />

      {/* Public Vidya Bharati School Locator Modal */}
      <SchoolLocatorModal
        isOpen={showSchoolLocatorModal}
        onClose={() => setShowSchoolLocatorModal(false)}
      />

      {/* School Management Modal (Used for Admin & Registration) */}
      <SchoolManagementModal
        isOpen={showSchoolModal}
        onClose={() => setShowSchoolModal(false)}
        initialMode={schoolModalMode}
        initialPlan={schoolModalPlan}
      />
    </>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <SchoolProvider>
          <ToastContainer />
          <SchoolApp />
        </SchoolProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}
