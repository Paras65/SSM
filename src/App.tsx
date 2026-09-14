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
import { AlumniSection } from './components/public/AlumniSection';
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
      if (sessionStorage.getItem('ssm_admin_token')) {
        setViewMode('admin');
      } else {
        setShowAuthModal(true);
      }
    } else if (window.location.pathname === '/teacher') {
      if (sessionStorage.getItem('ssm_teacher_token')) {
        setViewMode('teacher');
      } else {
        setShowTeacherAuthModal(true);
      }
    }
  }, [setViewMode]);

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
        <React.Suspense fallback={<PortalLoadingFallback label="व्यवस्थापक नियंत्रण पटल लोड हो रहा है..." />}>
          <AdminDashboard />
        </React.Suspense>
      ) : viewMode === 'teacher' ? (
        <React.Suspense fallback={<PortalLoadingFallback label="आचार्य पोर्टल लोड हो रहा है..." />}>
          <TeacherPortal />
        </React.Suspense>
      ) : viewMode === 'student' ? (
        <React.Suspense fallback={<PortalLoadingFallback label="छात्र एवं अभिभावक पोर्टल लोड हो रहा है..." />}>
          <StudentPortal />
        </React.Suspense>
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
            <AboutSection />
            <PanchmukhiShiksha />
            <VandanaCorner />
            <AcharyaSection />
            <AlumniSection />
            <Gallery />
          </main>
          <LegalInformation />
          <Footer />
        </div>
      )}
      <PwaInstallBanner />

      {/* Admin Passcode Modal */}
      <AdminAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
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
        onClose={() => setShowTeacherAuthModal(false)}
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
