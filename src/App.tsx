import React, { useEffect, useState } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Navbar } from './components/public/Navbar';
import { Hero } from './components/public/Hero';
import { NoticeBoard } from './components/public/NoticeBoard';
import { TimetableSection } from './components/common/TimetableSection';
import { DailyPanchang } from './components/public/DailyPanchang';
import { AboutSection } from './components/public/AboutSection';
import { PanchmukhiShiksha } from './components/public/PanchmukhiShiksha';
import { VandanaCorner } from './components/public/VandanaCorner';
import { AdmissionInquiry } from './components/public/AdmissionInquiry';
import { Gallery } from './components/public/Gallery';
import { Footer } from './components/public/Footer';
import { LegalInformation } from './components/public/LegalInformation';
import { OfflineBadge } from './components/common/OfflineBadge';
import { PwaInstallBanner } from './components/common/PwaInstallBanner';
import { AdminAuthModal } from './components/admin/AdminAuthModal';
import { TeacherAuthModal } from './components/teacher/TeacherAuthModal';
import { SchoolManagementModal } from './components/admin/SchoolManagementModal';
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
  const { viewMode, setViewMode } = useSchool();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTeacherAuthModal, setShowTeacherAuthModal] = useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
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
    setSchoolModalMode('list');
    setShowSchoolModal(true);
  };

  return (
    <>
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
          />
          <main className="flex-1">
            <Hero
              onOpenSignUp={() => handleOpenSignUp('free')}
              onOpenLogin={handleOpenLogin}
              onOpenTeacherLogin={() => setShowTeacherAuthModal(true)}
            />
            <DailyPanchang />
            <NoticeBoard />
            <AdmissionInquiry />
            <AboutSection />
            <PanchmukhiShiksha />
            <VandanaCorner />
            <TimetableSection />
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

      {/* School Management Modal */}
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
