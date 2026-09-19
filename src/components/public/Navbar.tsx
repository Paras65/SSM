import React, { useState, useEffect, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AdminAuthModal } from '../admin/AdminAuthModal';
import { SchoolManagementModal } from '../admin/SchoolManagementModal';
import { SchoolLocatorModal } from './SchoolLocatorModal';
import { subscribePwaInstall, promptPwaInstall } from '../../services/pwa';
import { Sparkles, Phone, Mail, Clock, UserCheck, Menu, X, Smartphone, Globe, LogIn, BookOpen, ChevronDown, Building2 } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../context/LanguageContext';

interface NavbarProps {
  onOpenSignUp?: (plan?: 'free' | 'pro') => void;
  onOpenLogin?: () => void;
  onOpenBranchList?: () => void;
  onOpenTeacherLogin?: () => void;
  onOpenSankulLogin?: () => void;
  onOpenVerifyTc?: () => void;
  onStartDemo?: () => void;
  onOpenHelpGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSignUp,
  onOpenLogin,
  onOpenBranchList,
  onOpenTeacherLogin,
  onOpenSankulLogin,
  onOpenVerifyTc,
  onStartDemo,
  onOpenHelpGuide
}) => {
  const { viewMode, setViewMode, dbStatus, currentSchool, publicSchool, isDemoMode } = useSchool();
  const { language, toggleLanguage, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isAdminAuthenticated = Boolean(sessionStorage.getItem('ssm_admin_token'));
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [schoolModalMode, setSchoolModalMode] = useState<'list' | 'add'>('list');
  const [schoolModalPlan, setSchoolModalPlan] = useState<'free' | 'pro'>('free');
  const [canInstallPwa, setCanInstallPwa] = useState(false);

  // Dropdown states
  const [portalsDropdownOpen, setPortalsDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [moreLinksOpen, setMoreLinksOpen] = useState(false);
  const [showLocatorModal, setShowLocatorModal] = useState(false);

  // Dropdown refs for click-outside detection
  const portalsRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const moreLinksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribePwaInstall(avail => setCanInstallPwa(avail));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (portalsRef.current && !portalsRef.current.contains(target)) {
        setPortalsDropdownOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(target)) {
        setLanguageDropdownOpen(false);
      }
      if (moreLinksRef.current && !moreLinksRef.current.contains(target)) {
        setMoreLinksOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      setShowLocatorModal(true);
    }
  };

  return (
    <>
      <header
        className={`sticky ${isDemoMode ? 'top-[37px] sm:top-[41px]' : 'top-0'} z-40 bg-white/95 backdrop-blur-md shadow-md border-b border-orange-200 w-full transition-all duration-200`}
      >
        {/* Top Auspicious & Contact Bar */}
        <div className="bg-gradient-to-r from-orange-700 via-amber-600 to-orange-700 text-white text-xs px-3 sm:px-4 py-1.5 flex flex-wrap justify-between items-center gap-1.5">
          <div className="flex items-center space-x-2 font-medium tracking-wide min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
            <span className="truncate max-w-[200px] xs:max-w-[280px] sm:max-w-none">{publicSchool.tagline}</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/25 text-[10px] sm:text-[11px] font-semibold">
              <span
                className={`w-2 h-2 rounded-full ${
                  dbStatus === 'connected'
                    ? 'bg-green-400 animate-pulse'
                    : dbStatus === 'connecting'
                    ? 'bg-yellow-400 animate-ping'
                    : 'bg-stone-400'
                }`}
              />
              <span>
                {dbStatus === 'connected'
                  ? 'MongoDB Atlas'
                  : dbStatus === 'connecting'
                  ? 'Connecting DB...'
                  : 'Offline Cache'}
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-orange-200" /> {publicSchool.timings}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-orange-200" /> {publicSchool.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-orange-200" /> {publicSchool.email}
              </span>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2.5 sm:gap-4">
            {/* Logo and School Title */}
            <div
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer min-w-0 shrink-0"
              onClick={() => setViewMode('public')}
              title="मुख्य पृष्ठ पर जाएं"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 p-0.5 shadow-md flex items-center justify-center text-white shrink-0">
                <div className="w-full h-full rounded-full bg-orange-700 flex flex-col items-center justify-center text-center p-1 border-2 border-yellow-300">
                  <span className="text-base sm:text-lg">🪷</span>
                  <span className="text-[6px] sm:text-[7px] font-bold tracking-tighter uppercase leading-none">SSM</span>
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-xs sm:text-base md:text-lg font-bold text-orange-950 tracking-tight leading-tight truncate max-w-[150px] xs:max-w-[210px] sm:max-w-[280px] md:max-w-none">
                    {publicSchool.hindiName}
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-orange-800 rounded-full border border-amber-300 whitespace-nowrap">
                    {publicSchool.prant}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 font-medium hidden sm:block truncate max-w-sm md:max-w-md">
                  {publicSchool.name}
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links (Visible on XL+ screens with "Other Sections" dropdown) */}
            <nav className="hidden 2xl:flex items-center space-x-2 text-xs font-semibold text-stone-700 shrink-0">
              <a
                href="#modules"
                className="hover:text-orange-600 transition-colors font-bold text-orange-700 px-2 py-1 rounded-lg hover:bg-orange-50"
              >
                ईआरपी विशेषताएं
              </a>
              <a
                href="#admissions"
                className="hover:text-orange-600 transition-colors text-orange-700 font-bold px-2 py-1 rounded-lg bg-orange-100/60 hover:bg-orange-100"
              >
                प्रवेश 2026-27
              </a>
              <a
                href="#panchang"
                className="hover:text-orange-600 transition-colors px-2 py-1 rounded-lg hover:bg-orange-50"
              >
                पंचांग
              </a>

              {/* "Other Sections" Dropdown */}
              <div className="relative" ref={moreLinksRef}>
                <button
                  type="button"
                  onClick={() => {
                    setMoreLinksOpen(!moreLinksOpen);
                    setPortalsDropdownOpen(false);
                    setLanguageDropdownOpen(false);
                  }}
                  className="flex items-center gap-1 text-stone-600 hover:text-orange-700 px-2 py-1 rounded-lg hover:bg-orange-50 transition cursor-pointer"
                >
                  <span>अन्य अनुभाग</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      moreLinksOpen ? 'rotate-180 text-orange-600' : ''
                    }`}
                  />
                </button>
                {moreLinksOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-orange-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <a
                      href="#about"
                      onClick={() => setMoreLinksOpen(false)}
                      className="block px-3.5 py-1.5 text-xs text-stone-700 hover:bg-orange-50 hover:text-orange-800 font-medium"
                    >
                      परिचय (About Us)
                    </a>
                    <a
                      href="#panchmukhi"
                      onClick={() => setMoreLinksOpen(false)}
                      className="block px-3.5 py-1.5 text-xs text-stone-700 hover:bg-orange-50 hover:text-orange-800 font-medium"
                    >
                      पंचमुखी शिक्षा
                    </a>
                    <a
                      href="#vandana"
                      onClick={() => setMoreLinksOpen(false)}
                      className="block px-3.5 py-1.5 text-xs text-stone-700 hover:bg-orange-50 hover:text-orange-800 font-medium"
                    >
                      दैनिक वंदना व प्रार्थना
                    </a>
                    <a
                      href="#acharyas"
                      onClick={() => setMoreLinksOpen(false)}
                      className="block px-3.5 py-1.5 text-xs text-stone-700 hover:bg-orange-50 hover:text-orange-800 font-medium"
                    >
                      आचार्य एवं दीदी जी
                    </a>
                    <a
                      href="#gallery"
                      onClick={() => setMoreLinksOpen(false)}
                      className="block px-3.5 py-1.5 text-xs text-stone-700 hover:bg-orange-50 hover:text-orange-800 font-medium"
                    >
                      चित्रदीर्घा (Gallery)
                    </a>
                    <a
                      href="#contact"
                      onClick={() => setMoreLinksOpen(false)}
                      className="block px-3.5 py-1.5 text-xs text-orange-800 hover:bg-orange-50 font-bold"
                    >
                      संपर्क व सहायता (Contact & Support)
                    </a>
                    {onOpenHelpGuide && (
                      <button
                        type="button"
                        onClick={() => {
                          setMoreLinksOpen(false);
                          onOpenHelpGuide();
                        }}
                        className="w-full text-left block px-3.5 py-1.5 text-xs text-amber-950 bg-amber-50 hover:bg-amber-100 font-bold border-t border-orange-100 cursor-pointer transition"
                      >
                        📖 उपयोगकर्ता मार्गदर्शिका (37 अध्याय)
                      </button>
                    )}
                  </div>
                )}
              </div>
            </nav>

            {/* Desktop & Tablet Actions Container */}
            <div className="hidden md:flex flex-wrap items-center justify-end gap-2 shrink-0 min-w-0">
              {/* Unified Portals Dropdown */}
              <div className="relative" ref={portalsRef}>
                <button
                  type="button"
                  onClick={() => {
                    setPortalsDropdownOpen(!portalsDropdownOpen);
                    setLanguageDropdownOpen(false);
                    setMoreLinksOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-700 to-amber-700 hover:from-orange-800 hover:to-amber-800 text-white shadow-xs transition-all cursor-pointer"
                  title="पोर्टल लॉगिन (छात्र, आचार्य, संकुल, कार्यालय)"
                >
                  <UserCheck className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{isAdminAuthenticated ? 'Admin Dashboard' : 'पोर्टल लॉगिन'}</span>
                  <ChevronDown
                    className={`w-3 h-3 text-amber-200 transition-transform duration-200 ${
                      portalsDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {portalsDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-orange-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 border-b border-orange-100 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      पोर्टल चयन करें (Select Portal)
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPortalsDropdownOpen(false);
                        setViewMode('student');
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-stone-800 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-900 leading-tight">
                          {t('navPortal', 'छात्र एवं अभिभावक पोर्टल')}
                        </p>
                        <p className="text-[10px] text-stone-500">Student & Parent Access</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPortalsDropdownOpen(false);
                        if (sessionStorage.getItem('ssm_teacher_token')) {
                          setViewMode('teacher');
                        } else if (onOpenTeacherLogin) {
                          onOpenTeacherLogin();
                        }
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-orange-50 text-stone-800 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-900 leading-tight">आचार्य पटल (शिक्षक)</p>
                        <p className="text-[10px] text-stone-500">Teacher & Attendance Login</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPortalsDropdownOpen(false);
                        if (sessionStorage.getItem('ssm_sankul_token')) {
                          setViewMode('sankul');
                        } else if (onOpenSankulLogin) {
                          onOpenSankulLogin();
                        }
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-indigo-50 text-stone-800 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-900 leading-tight">संकुल पटल (संकुल प्रभारी)</p>
                        <p className="text-[10px] text-stone-500">Cluster Prabhari & Multi-School Oversight</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPortalsDropdownOpen(false);
                        handleOpenAdmin();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-amber-50 text-stone-800 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-stone-900 text-amber-300 flex items-center justify-center shrink-0">
                        <LogIn className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-900 leading-tight">कार्यालय प्रशासन (ERP Admin)</p>
                        <p className="text-[10px] text-stone-500">
                          {isAdminAuthenticated ? 'Admin Dashboard' : 'Passcode Required'}
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Active School Chip with School Locator trigger */}
              <button
                onClick={handleOpenBranchList}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-orange-300 rounded-xl text-xs font-bold text-stone-900 hover:text-orange-950 transition cursor-pointer shrink-0 shadow-2xs"
                title="नजदीकी सरस्वती शिशु मंदिर खोजें (School Locator)"
              >
                <span className="text-sm">🔍</span>
                <span className="max-w-[100px] lg:max-w-[120px] truncate">
                  {publicSchool.id === 'ssm-national' ? 'विद्यालय खोजें' : publicSchool.city}
                </span>
                <ChevronDown className="w-2.5 h-2.5 text-orange-700 shrink-0" />
              </button>

              {/* 1-Click Sandbox Demo Trigger */}
              {onStartDemo && (
                <button
                  type="button"
                  onClick={onStartDemo}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-stone-950 border border-amber-300 shadow-xs transition cursor-pointer shrink-0"
                  title="बिना पासवर्ड लाइव डेमो चलाएं"
                >
                  <span>🎮 डेमो</span>
                </button>
              )}

              {/* Language Switcher Dropdown */}
              <div className="relative" ref={languageRef}>
                <button
                  type="button"
                  onClick={() => {
                    setLanguageDropdownOpen(!languageDropdownOpen);
                    setPortalsDropdownOpen(false);
                    setMoreLinksOpen(false);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-orange-950 border border-orange-300 transition-all shadow-xs cursor-pointer"
                  title="भाषा / Select Language"
                >
                  <Globe className="w-3.5 h-3.5 text-orange-700" />
                  <span>{SUPPORTED_LANGUAGES.find(l => l.code === language)?.nativeName || 'हिन्दी'}</span>
                  <ChevronDown
                    className={`w-3 h-3 text-orange-700 transition-transform duration-200 ${
                      languageDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {languageDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-orange-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1 border-b border-orange-100 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      भाषा चयन (Select Language)
                    </div>
                    {SUPPORTED_LANGUAGES.map(langItem => (
                      <button
                        key={langItem.code}
                        type="button"
                        onClick={() => {
                          setLanguage(langItem.code);
                          setLanguageDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-orange-50 cursor-pointer ${
                          language === langItem.code ? 'text-orange-700 bg-orange-50/80 font-bold' : 'text-stone-800'
                        }`}
                      >
                        <span>{langItem.nativeName}</span>
                        <span className="text-[10px] text-stone-400">{langItem.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {canInstallPwa && (
                <button
                  onClick={() => promptPwaInstall()}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-yellow-300 hover:bg-yellow-400 text-orange-950 border border-orange-400 shadow-xs transition-all cursor-pointer"
                  title="Install Progressive Web App"
                >
                  <Smartphone className="w-3.5 h-3.5 text-orange-800" />
                  <span>ऐप</span>
                </button>
              )}

              {/* Tablet Menu Toggle (for screens between md and xl where full nav links are hidden) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="2xl:hidden p-2 text-stone-700 hover:text-stone-950 hover:bg-orange-50 rounded-xl border border-orange-200 transition cursor-pointer"
                title="नेविगेशन मेनू"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile & Small Screen Controls (< md) */}
            <div className="flex items-center md:hidden space-x-1.5 shrink-0">
              <button
                onClick={toggleLanguage}
                className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-orange-950 border border-orange-300 rounded-xl text-xs font-bold transition"
                title="भाषा बदलें"
              >
                🌐 {language.toUpperCase()}
              </button>
              <button
                onClick={handleOpenBranchList}
                className="p-1.5 bg-amber-100 hover:bg-amber-200 text-orange-950 border border-orange-300 rounded-xl text-xs font-bold transition"
                title="नजदीकी सरस्वती शिशु मंदिर खोजें (School Locator)"
              >
                🔍
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-orange-50 border border-stone-200 rounded-xl transition"
                title="नेविगेशन मेनू"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="2xl:hidden border-t border-orange-200 bg-amber-50/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 text-sm font-medium shadow-lg max-h-[85vh] overflow-y-auto animate-in fade-in duration-150">
            {/* Quick Portals Access Cards in Mobile */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-orange-900/70 px-1">
                पोर्टल एवं पटल (Portals)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    setViewMode('student');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-start gap-2.5 px-3 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-emerald-200 shrink-0" />
                  <span>छात्र एवं अभिभावक पोर्टल</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (sessionStorage.getItem('ssm_teacher_token')) {
                      setViewMode('teacher');
                    } else if (onOpenTeacherLogin) {
                      onOpenTeacherLogin();
                    }
                  }}
                  className="w-full flex items-center justify-start gap-2.5 px-3 py-2.5 bg-orange-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-orange-200 shrink-0" />
                  <span>आचार्य पटल (शिक्षक)</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (sessionStorage.getItem('ssm_sankul_token')) {
                      setViewMode('sankul');
                    } else if (onOpenSankulLogin) {
                      onOpenSankulLogin();
                    }
                  }}
                  className="w-full flex items-center justify-start gap-2.5 px-3 py-2.5 bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-indigo-200 shrink-0" />
                  <span>संकुल पटल (संकुल प्रभारी)</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleOpenAdmin();
                  }}
                  className="w-full flex items-center justify-start gap-2.5 px-3 py-2.5 bg-stone-900 text-amber-200 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>कार्यालय प्रशासन (Admin)</span>
                </button>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleOpenBranchList();
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-white hover:bg-amber-100 text-orange-950 font-bold text-xs flex items-center justify-between border border-orange-200 shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>🏫</span>
                  <span>नजदीकी सरस्वती शिशु मंदिर खोजें (School Locator)</span>
                </div>
                <span className="text-orange-700 text-xs">खोजें →</span>
              </button>

              {onOpenVerifyTc && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenVerifyTc();
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-amber-100/80 hover:bg-amber-100 text-orange-950 font-bold text-xs flex items-center justify-between border border-amber-300/80 shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>🔍</span>
                    <span>टीसी सत्यापन (Verify Transfer Certificate)</span>
                  </div>
                  <span className="text-orange-700 text-xs">सत्यापित करें →</span>
                </button>
              )}

              {onStartDemo && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onStartDemo();
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 font-black text-xs flex items-center justify-between shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>🎮</span>
                    <span>1-क्लिक लाइव डेमो (Sandbox Test)</span>
                  </div>
                  <span>शुरू करें →</span>
                </button>
              )}
            </div>

            {/* Nav Sections Links */}
            <div className="space-y-1 pt-1 border-t border-orange-200">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-orange-900/70 px-1 pt-1">
                वेबसाइट अनुभाग (Website Sections)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                <a
                  href="#modules"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg bg-orange-100 text-orange-950 font-bold border border-orange-200"
                >
                  💻 ईआरपी विशेषताएं व मॉड्यूल
                </a>
                {onOpenHelpGuide && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenHelpGuide();
                    }}
                    className="w-full text-left block px-3 py-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-orange-950 font-bold border border-amber-300 cursor-pointer"
                  >
                    📖 उपयोगकर्ता मार्गदर्शिका (37 अध्याय)
                  </button>
                )}
                <a
                  href="#admissions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg bg-orange-600 text-white font-bold"
                >
                  📝 प्रवेश हेतु आवेदन (2026-27)
                </a>
                <a
                  href="#panchang"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-orange-100 text-stone-800"
                >
                  🗓️ दैनिक पंचांग (Daily Panchang)
                </a>
                <a
                  href="#about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-orange-100 text-stone-800"
                >
                  परिचय (About Us)
                </a>
                <a
                  href="#panchmukhi"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-orange-100 text-stone-800"
                >
                  पंचमुखी शिक्षा (5-Fold Education)
                </a>
                <a
                  href="#vandana"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-orange-100 text-stone-800"
                >
                  वंदना व दैनिक प्रार्थना (Vandana)
                </a>
                <a
                  href="#acharyas"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-orange-100 text-stone-800"
                >
                  आचार्य एवं दीदी जी (Faculty)
                </a>
                <a
                  href="#gallery"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-orange-100 text-stone-800"
                >
                  चित्रदीर्घा (School Gallery)
                </a>
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-orange-100 text-orange-900 font-bold"
                >
                  📞 संपर्क व सहायता (Contact & ERP Helpdesk)
                </a>
              </div>
            </div>

            {/* Mobile Regional Language Selector Grid */}
            <div className="pt-2 border-t border-orange-200">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-orange-900/70 px-1 mb-1.5">
                भाषा चुनें (Regional Languages)
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {SUPPORTED_LANGUAGES.map(langItem => (
                  <button
                    key={langItem.code}
                    type="button"
                    onClick={() => {
                      setLanguage(langItem.code);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-2 py-1.5 rounded-xl text-xs font-bold text-center border transition ${
                      language === langItem.code
                        ? 'bg-orange-600 text-white border-orange-700 shadow-2xs'
                        : 'bg-white hover:bg-orange-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {langItem.nativeName}
                  </button>
                ))}
              </div>
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
            onOpenSignUp={(plan = 'free') => {
              setShowAuthModal(false);
              handleOpenSignUp(plan);
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

      {/* Public Vidya Bharati School Locator Modal */}
      <SchoolLocatorModal isOpen={showLocatorModal} onClose={() => setShowLocatorModal(false)} />
    </>
  );
};
