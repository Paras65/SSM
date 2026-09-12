import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AdminAuthModal } from '../admin/AdminAuthModal';
import { SchoolManagementModal } from '../admin/SchoolManagementModal';
import { subscribePwaInstall, promptPwaInstall } from '../../services/pwa';
import { Sparkles, Phone, Mail, Clock, UserCheck, Menu, X, Smartphone, Globe, LogIn, Plus, BookOpen } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface NavbarProps {
  onOpenSignUp?: (plan?: 'free' | 'pro') => void;
  onOpenLogin?: () => void;
  onOpenBranchList?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSignUp,
  onOpenLogin,
  onOpenBranchList
}) => {
  const { viewMode, setViewMode, dbStatus, currentSchool, publicSchool } = useSchool();
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isAdminAuthenticated = Boolean(sessionStorage.getItem('ssm_admin_token'));
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [schoolModalMode, setSchoolModalMode] = useState<'list' | 'add'>('list');
  const [schoolModalPlan, setSchoolModalPlan] = useState<'free' | 'pro'>('free');
  const [canInstallPwa, setCanInstallPwa] = useState(false);

  useEffect(() => {
    return subscribePwaInstall(avail => setCanInstallPwa(avail));
  }, []);

  const handleOpenAdmin = () => {
    if (viewMode === 'admin') {
      setViewMode('public');
      return;
    }
    if (onOpenLogin) {
      onOpenLogin();
      return;
    }
    const isAuth = Boolean(sessionStorage.getItem('ssm_admin_token'));
    if (isAuth) {
      setViewMode('admin');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleOpenSignUp = (plan: 'free' | 'pro' = 'free') => {
    if (onOpenSignUp) {
      onOpenSignUp(plan);
    } else {
      setSchoolModalPlan(plan);
      setSchoolModalMode('add');
      setShowSchoolModal(true);
    }
  };

  const handleOpenBranchList = () => {
    if (onOpenBranchList) {
      onOpenBranchList();
    } else {
      setSchoolModalMode('list');
      setShowSchoolModal(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur shadow-md border-b border-orange-200">
      {/* Top Auspicious & Contact Bar */}
      <div className="bg-gradient-to-r from-orange-700 via-amber-600 to-orange-700 text-white text-xs px-4 py-1.5 flex flex-wrap justify-between items-center">
        <div className="flex items-center space-x-2 font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>{publicSchool.tagline}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/25 text-[11px] font-semibold">
            <span className={`w-2 h-2 rounded-full ${
              dbStatus === 'connected' ? 'bg-green-400 animate-pulse' : dbStatus === 'connecting' ? 'bg-yellow-400 animate-ping' : 'bg-stone-400'
            }`} />
            <span>{dbStatus === 'connected' ? 'MongoDB Atlas: Connected' : dbStatus === 'connecting' ? 'Connecting DB...' : 'Offline Cache'}</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-orange-200" /> {publicSchool.timings}</span>
            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-orange-200" /> {publicSchool.phone}</span>
            <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-orange-200" /> {publicSchool.email}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          
          {/* Logo and School Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setViewMode('public')}>
            <div className="w-13 h-13 rounded-full bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 p-0.5 shadow-md flex items-center justify-center text-white shrink-0">
              <div className="w-full h-full rounded-full bg-orange-700 flex flex-col items-center justify-center text-center p-1 border-2 border-yellow-300">
                <span className="text-xl">🪷</span>
                <span className="text-[8px] font-bold tracking-tighter uppercase leading-none">SSM</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-orange-950 tracking-tight leading-tight line-clamp-1">
                  {publicSchool.hindiName}
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-orange-800 rounded-full border border-amber-300 whitespace-nowrap">
                  {publicSchool.prant}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 font-medium hidden sm:block truncate max-w-md">
                {publicSchool.name}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-3 xl:space-x-4 text-sm font-medium text-stone-700">
            <a href="#plans" className="text-orange-700 font-bold hover:text-orange-800 transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>योजनाएं व सुविधाएं</span>
            </a>
            <a href="#about" className="hover:text-orange-600 transition-colors">परिचय</a>
            <a href="#panchmukhi" className="hover:text-orange-600 transition-colors">पंचमुखी</a>
            <a href="#vandana" className="hover:text-orange-600 transition-colors">वंदना</a>
            <a href="#timetable" className="hover:text-orange-600 transition-colors">समय-सारणी</a>
            <a href="#notices" className="hover:text-orange-600 transition-colors">सूचनाएं</a>
            <a href="#admissions" className="hover:text-orange-600 transition-colors text-orange-700 font-semibold">प्रवेश</a>
          </nav>

          {/* School Selector + Portals (Desktop & Tablets) */}
          <div className="hidden md:flex items-center space-x-2">
            
            {/* Direct Sign Up Button */}
            <button
              onClick={() => handleOpenSignUp('free')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
              title="नवीन शाखा पंजीकरण (Sign Up)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>शाखा पंजीकरण</span>
            </button>

            {/* Direct Login Button */}
            <button
              onClick={handleOpenAdmin}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-amber-200 border border-stone-800 shadow-xs transition-all cursor-pointer shrink-0"
              title={isAdminAuthenticated ? 'प्रशासक डैशबोर्ड खोलें' : 'शाखा प्रशासक लॉगिन (Login)'}
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAdminAuthenticated ? 'Admin Dashboard' : 'लॉगिन'}</span>
            </button>

            {/* Active Branch Chip with quick switch trigger */}
            <button
              onClick={handleOpenBranchList}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-orange-200 rounded-xl text-xs font-bold text-stone-800 hover:text-orange-950 transition cursor-pointer shrink-0"
              title="वर्तमान सक्रिय शाखा • क्लिक करके अन्य शाखाएं देखें"
            >
              <span className="text-sm">🏫</span>
              <span className="max-w-[70px] lg:max-w-[100px] truncate">सभी शाखाएं</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                FREE
              </span>
            </button>

            {/* Student Portal */}
            <button
              onClick={() => setViewMode(viewMode === 'student' ? 'public' : 'student')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                viewMode === 'student'
                  ? 'bg-amber-100 border-orange-500 text-orange-900 font-bold'
                  : 'bg-white hover:bg-amber-50 border-stone-300 text-stone-700'
              }`}
              title="Open Student & Parent Portal"
            >
              <UserCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>{t('navPortal', 'छात्र पोर्टल')}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-orange-950 border border-orange-300 transition-all shadow-xs"
              title="भाषा बदलें / Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-orange-700" />
              <span>{language === 'hi' ? 'EN' : 'हिन्दी'}</span>
            </button>

            {canInstallPwa && (
              <button
                onClick={() => promptPwaInstall()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-yellow-300 hover:bg-yellow-400 text-orange-950 border border-orange-400 shadow-xs transition-all"
                title="Install Progressive Web App"
              >
                <Smartphone className="w-3.5 h-3.5 text-orange-800" />
                <span>ऐप</span>
              </button>
            )}
          </div>

          {/* Mobile & Small Tablet controls (< md shows controls, < lg shows hamburger) */}
          <div className="flex items-center md:hidden space-x-1.5">
            <button
              onClick={toggleLanguage}
              className="p-1.5 bg-amber-50 text-orange-950 border border-orange-300 rounded-md text-xs font-bold"
              title="भाषा बदलें"
            >
              🌐 {language === 'hi' ? 'EN' : 'हि'}
            </button>
            <button
              onClick={handleOpenBranchList}
              className="p-1.5 bg-amber-100 text-orange-950 border border-orange-300 rounded-md text-xs font-bold"
              title="Switch School Branch"
            >
              🏫 सभी शाखाएं
            </button>
            <button
              onClick={handleOpenAdmin}
              className="p-1.5 bg-stone-900 text-amber-200 border border-stone-800 rounded-md text-xs font-semibold"
              title="शाखा लॉगिन"
            >
              लॉगिन
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-orange-50 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Medium tablet only hamburger (< lg and >= md) */}
          <div className="hidden md:flex lg:hidden items-center ml-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-orange-50 rounded-lg"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-orange-100 bg-amber-50/90 px-4 pt-2 pb-4 space-y-2 text-sm font-medium">
          <a
            href="#plans"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-amber-100/90 hover:bg-amber-100 text-orange-950 font-bold border border-orange-200"
          >
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>ईआरपी विशेषताएं व योजनाएं</span>
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md hover:bg-orange-100 text-stone-800"
          >
            परिचय (About Us)
          </a>
          <a
            href="#panchmukhi"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md hover:bg-orange-100 text-stone-800"
          >
            पंचमुखी शिक्षा (Five-Fold Education)
          </a>
          <a
            href="#vandana"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md hover:bg-orange-100 text-stone-800"
          >
            वंदना व दैनिक प्रार्थना (Vandana)
          </a>
          <a
            href="#songs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md hover:bg-orange-100 text-stone-800"
          >
            गीत एवं घोष वादक (Songs & Band)
          </a>
          <a
            href="#timetable"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md hover:bg-orange-100 text-stone-800"
          >
            दैनिक समय-सारणी (Class Timetable)
          </a>
          <a
            href="#notices"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md hover:bg-orange-100 text-stone-800"
          >
            सूचना पट्ट (Notices)
          </a>
          <a
            href="#admissions"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md bg-orange-600 text-white font-semibold"
          >
            प्रवेश हेतु आवेदन (Admissions 2026)
          </a>
          <div className="pt-2 border-t border-orange-200 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleOpenSignUp('free');
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg text-xs font-bold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              शाखा पंजीकरण (Sign Up Free)
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleOpenAdmin();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-900 text-amber-200 rounded-lg text-xs font-bold shadow-xs"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              शाखा लॉगिन (Login)
            </button>
            <button
              onClick={() => {
                setViewMode('student');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 bg-amber-200 text-orange-950 rounded-md text-xs font-semibold"
            >
              <BookOpen className="w-4 h-4" />
              छात्र एवं अभिभावक पोर्टल (Student Portal)
            </button>
          </div>
        </div>
      )}
    </header>

    {/* Admin Passcode Modal (only rendered if external handler not provided) */}
    {!onOpenSignUp && (
      <>
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
    )}
  </>
);
};

