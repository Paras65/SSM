import React, { useEffect, useState } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Navbar } from './components/public/Navbar';
import { Hero } from './components/public/Hero';
import { FeaturesAndPricing } from './components/public/FeaturesAndPricing';
import { DailyPanchang } from './components/public/DailyPanchang';
import { AboutSection } from './components/public/AboutSection';
import { PanchmukhiShiksha } from './components/public/PanchmukhiShiksha';
import { VandanaCorner } from './components/public/VandanaCorner';
import { SongPlayer } from './components/public/SongPlayer';
import { AdmissionInquiry } from './components/public/AdmissionInquiry';
import { Gallery } from './components/public/Gallery';
import { Footer } from './components/public/Footer';
import { LegalInformation } from './components/public/LegalInformation';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentPortal } from './components/student/StudentPortal';
import { OfflineBadge } from './components/common/OfflineBadge';
import { PwaInstallBanner } from './components/common/PwaInstallBanner';
import { AdminAuthModal } from './components/admin/AdminAuthModal';
import { SchoolManagementModal } from './components/admin/SchoolManagementModal';
import { LanguageProvider } from './context/LanguageContext';

const SchoolApp: React.FC = () => {
  const { viewMode, setViewMode } = useSchool();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [schoolModalMode, setSchoolModalMode] = useState<'list' | 'add'>('list');
  const [schoolModalPlan, setSchoolModalPlan] = useState<'free' | 'pro'>('free');

  useEffect(() => {
    if (window.location.pathname !== '/admin') return;

    if (sessionStorage.getItem('ssm_admin_token')) {
      setViewMode('admin');
    } else {
      setShowAuthModal(true);
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
        <AdminDashboard />
      ) : viewMode === 'student' ? (
        <StudentPortal />
      ) : (
        <div className="min-h-screen bg-stone-50 flex flex-col">
          <Navbar
            onOpenSignUp={handleOpenSignUp}
            onOpenLogin={handleOpenLogin}
            onOpenBranchList={handleOpenBranchList}
          />
          <main className="flex-1">
            <Hero
              onOpenSignUp={() => handleOpenSignUp('free')}
              onOpenLogin={handleOpenLogin}
            />
            <FeaturesAndPricing
              onOpenSignUp={handleOpenSignUp}
              onOpenLogin={handleOpenLogin}
            />
            <DailyPanchang />
            <AboutSection />
            <PanchmukhiShiksha />
            <VandanaCorner />
            <SongPlayer />
            <AdmissionInquiry />
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
        onOpenSignUp={() => {
          setShowAuthModal(false);
          handleOpenSignUp('free');
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
      <SchoolProvider>
        <SchoolApp />
      </SchoolProvider>
    </LanguageProvider>
  );
}
