import React, { useState, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
import { X, UserPlus, Edit3, Sparkles, Save, AlertCircle, Camera } from 'lucide-react';
import type { Gender, SocialCategory, Student } from '../../types';
import { SSM_CLASSES } from '../../types';

interface AddStudentModalProps {
  onClose: () => void;
  studentToEdit?: Student | null;
  onOpenScanner?: () => void;
}

const getNextRollForClassSection = (cls: string, sec: string, studentList: Student[]): string => {
  const classStudents = studentList.filter(s => s.class === cls && s.section === sec);
  const numbers = classStudents
    .map(s => parseInt(s.rollNo, 10))
    .filter(n => !isNaN(n) && isFinite(n));
  return numbers.length > 0 ? (Math.max(...numbers) + 1).toString() : '1';
};

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ onClose, studentToEdit, onOpenScanner }) => {
  const { addStudent, updateStudent, students } = useSchool();
  const { showSuccess, showWarning } = useToast();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const isEditing = Boolean(studentToEdit);
  const defaultClass = studentToEdit?.class || 'Class 6';
  const defaultSection = studentToEdit?.section || 'A';
  const defaultRoll = studentToEdit?.rollNo || getNextRollForClassSection(defaultClass, defaultSection, students);

  const initialName = studentToEdit
    ? studentToEdit.name.replace(/^(भैया\s+|बहिन\s+|Bhaiya\s+|Bahin\s+)/i, '')
    : '';

  const [formData, setFormData] = useState({
    rollNo: defaultRoll,
    name: initialName,
    gender: (studentToEdit?.gender || 'Bhaiya') as Gender,
    class: defaultClass,
    section: defaultSection,
    fatherName: studentToEdit?.fatherName || '',
    motherName: studentToEdit?.motherName || '',
    contact: studentToEdit?.contact || '',
    parentEmail: studentToEdit?.parentEmail || '',
    address: studentToEdit?.address || '',
    dob: studentToEdit?.dob || '2014-01-01',
    pin: studentToEdit?.pin || '',
    admissionDate: studentToEdit?.admissionDate || new Date().toISOString().split('T')[0],
    bloodGroup: studentToEdit?.bloodGroup || 'B+',
    pen: studentToEdit?.pen || '',
    apaarId: studentToEdit?.apaarId || '',
    socialCategory: (studentToEdit?.socialCategory || 'General') as SocialCategory,
    familyId: studentToEdit?.familyId || '',
    cwsn: studentToEdit?.cwsn || false,
    bpl: studentToEdit?.bpl || false
  });

  const isRollDuplicate = !isEditing && formData.rollNo.trim() !== '' && students.some(
    s => s.class === formData.class && s.section === formData.section && s.rollNo.trim() === formData.rollNo.trim()
  );

  const handleClassChange = (newClass: string) => {
    const nextRoll = getNextRollForClassSection(newClass, formData.section, students);
    setFormData(prev => ({
      ...prev,
      class: newClass,
      rollNo: nextRoll
    }));
  };

  const handleSectionChange = (newSection: string) => {
    const nextRoll = getNextRollForClassSection(formData.class, newSection, students);
    setFormData(prev => ({
      ...prev,
      section: newSection,
      rollNo: nextRoll
    }));
  };

  const cleanPhone = formData.contact.replace(/\D/g, '').slice(-10);
  const matchedSibling = (!isEditing && cleanPhone.length === 10)
    ? students.find(s => {
        const sPhone = s.contact ? s.contact.replace(/\D/g, '').slice(-10) : '';
        return sPhone === cleanPhone && (s.fatherName || s.familyId);
      })
    : null;

  const handleAutoFillSibling = (sibling: Student) => {
    const familyCode = sibling.familyId || `FAM-${cleanPhone.slice(-6)}`;
    setFormData(prev => ({
      ...prev,
      fatherName: sibling.fatherName || prev.fatherName,
      motherName: sibling.motherName || prev.motherName,
      address: sibling.address || prev.address,
      pin: sibling.pin || prev.pin,
      familyId: familyCode,
      parentEmail: sibling.parentEmail || prev.parentEmail,
      socialCategory: (sibling.socialCategory as SocialCategory) || prev.socialCategory,
    }));
    showSuccess(`सहोदर छात्र '${sibling.name}' का पारिवारिक विवरण एवं Family ID (${familyCode}) स्वतः भर दिया गया!`);
  };

  const handleApaarChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 12);
    const formatted = digits.match(/.{1,4}/g)?.join('-') || digits;
    setFormData(prev => ({ ...prev, apaarId: formatted }));
  };

  const handleSave = (addAnother: boolean = false) => {
    if (!formData.name.trim() || !formData.fatherName.trim()) {
      showWarning('कृपया छात्र एवं पिता का नाम अवश्य भरें।');
      return;
    }

    const trimmedName = formData.name.trim();
    const fullName = trimmedName.startsWith('भैया ') || trimmedName.startsWith('बहिन ') || trimmedName.startsWith('Bhaiya ') || trimmedName.startsWith('Bahin ')
      ? trimmedName
      : `${formData.gender === 'Bhaiya' ? 'Bhaiya' : 'Bahin'} ${trimmedName}`;

    if (isEditing && studentToEdit) {
      updateStudent({
        ...studentToEdit,
        ...formData,
        name: fullName
      });
      showSuccess(`'${fullName}' का विवरण सफलतापूर्वक अद्यतन (Updated) किया गया!`);
      onClose();
    } else {
      addStudent({
        ...formData,
        name: fullName
      });

      if (addAnother) {
        showSuccess(`नए छात्र '${fullName}' पंजीकृत! अब अगले छात्र का विवरण भरें।`);
        const currentRollNum = parseInt(formData.rollNo, 10);
        const nextRollNum = !isNaN(currentRollNum) ? (currentRollNum + 1).toString() : '1';

        setFormData(prev => ({
          ...prev,
          rollNo: nextRollNum,
          name: '',
          fatherName: '',
          motherName: '',
          contact: '',
          parentEmail: '',
          dob: '2014-01-01',
          pen: '',
          apaarId: '',
          familyId: '',
          cwsn: false,
          bpl: false,
        }));

        setTimeout(() => {
          nameInputRef.current?.focus();
        }, 50);
      } else {
        showSuccess(`नए छात्र '${fullName}' सफलतापूर्वक पंजीकृत किए गए!`);
        onClose();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-xl w-full max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto border border-orange-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-700 to-amber-600 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {isEditing ? <Edit3 className="w-5 h-5 text-yellow-300" /> : <UserPlus className="w-5 h-5 text-yellow-300" />}
            <h3 className="text-sm sm:text-base font-bold leading-tight">
              {isEditing ? 'छात्र विवरण संपादन (Edit Student Details)' : 'नवीन छात्र प्रवेश पंजीयन (New Student Admission)'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && onOpenScanner && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenScanner();
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 border border-amber-300/30 rounded-lg text-xs font-bold cursor-pointer transition shrink-0"
                title="हार्ड कॉपी रजिस्टर या फॉर्म की फोटो खींचकर सीधे AI से स्वतः भरें"
              >
                <Camera className="w-3.5 h-3.5 text-yellow-300" />
                <span className="hidden sm:inline">रजिस्टर डायरेक्ट स्कैन</span>
              </button>
            )}
            <button onClick={onClose} className="p-1 hover:bg-orange-800 rounded-lg transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                छात्र / छात्रा का नाम *
              </label>
              <input
                ref={nameInputRef}
                type="text"
                required
                placeholder="उदा. केशव शास्त्री"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                लिंग / वर्ग (Gender) *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'Bhaiya' })}
                  className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                    formData.gender === 'Bhaiya'
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-stone-50 text-stone-700 border-stone-300'
                  }`}
                >
                  भैया (Boy)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'Bahin' })}
                  className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                    formData.gender === 'Bahin'
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-stone-50 text-stone-700 border-stone-300'
                  }`}
                >
                  बहिन (Girl)
                </button>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700">
                  अनुक्रमांक (Roll No)
                </label>
                {!isEditing && (
                  <span className="text-[10px] text-orange-600 font-medium bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                    स्वतः गणना
                  </span>
                )}
              </div>
              <input
                type="text"
                value={formData.rollNo}
                onChange={e => setFormData({ ...formData, rollNo: e.target.value })}
                className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-orange-500 ${
                  isRollDuplicate ? 'border-amber-400 bg-amber-50/50' : 'border-stone-300'
                }`}
              />
              {isRollDuplicate && (
                <p className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>रोल नं. {formData.rollNo} इस वर्ग में पहले से आवंटित है।</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                कक्षा (Class) *
              </label>
              <select
                value={formData.class}
                onChange={e => handleClassChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500 bg-white"
              >
                {SSM_CLASSES.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                वर्ग (Section)
              </label>
              <select
                value={formData.section}
                onChange={e => handleSectionChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                जन्मतिथि (Date of Birth) *
              </label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={e => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                प्रवेश तिथि (Admission Date) *
              </label>
              <input
                type="date"
                required
                value={formData.admissionDate}
                onChange={e => setFormData({ ...formData, admissionDate: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                पिता का नाम *
              </label>
              <input
                type="text"
                required
                placeholder="उदा. श्री दिनेश शास्त्री"
                value={formData.fatherName}
                onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                माता का नाम
              </label>
              <input
                type="text"
                placeholder="उदा. श्रीमती कमला शास्त्री"
                value={formData.motherName}
                onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                संपर्क मोबाइल नंबर *
              </label>
              <input
                type="tel"
                required
                placeholder="10-अंकीय मोबाइल नंबर"
                value={formData.contact}
                onChange={e => setFormData({ ...formData, contact: e.target.value.replace(/[^\d+ ]/g, '').slice(0, 14) })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                अभिभावक ईमेल (रसीद हेतु, ऐच्छिक)
              </label>
              <input
                type="email"
                placeholder="parent@example.com"
                value={formData.parentEmail}
                onChange={e => setFormData({ ...formData, parentEmail: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                सुरक्षा पिन (4-अंक, वैकल्पिक)
              </label>
              <input
                type="password"
                maxLength={6}
                placeholder="उदा. 1234"
                value={formData.pin}
                onChange={e => setFormData({ ...formData, pin: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                रक्त समूह (Blood Group)
              </label>
              <select
                value={formData.bloodGroup}
                onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          {/* Sibling detection alert banner */}
          {matchedSibling && (
            <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-950 shadow-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                <div className="leading-snug">
                  <span className="font-bold text-amber-900">✨ सहोदर परिवार मिला: </span>
                  <span className="font-semibold">{matchedSibling.fatherName}</span>
                  <span className="text-amber-800"> (सहोदर: {matchedSibling.name}, {matchedSibling.class})</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleAutoFillSibling(matchedSibling)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold rounded-lg text-xs shrink-0 cursor-pointer shadow-xs transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>स्वतः भरें (Auto-Fill)</span>
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              स्थायी निवास का पता
            </label>
            <input
              type="text"
              placeholder="मोहल्ला, नगर..."
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* UDISE+ SDMS Section */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-1.5">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <span>🇮🇳 UDISE+ SDMS सरकारी पहचान (वैकल्पिक)</span>
              </span>
              <span className="text-[10px] text-blue-600 font-semibold">भारत सरकार पोर्टल अनुरूप</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  PEN (11 अंक)
                </label>
                <input
                  type="text"
                  maxLength={11}
                  placeholder="उदा. 21098765431"
                  value={formData.pen}
                  onChange={e => setFormData({ ...formData, pen: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-stone-300 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  APAAR ID (12 अंक)
                </label>
                <input
                  type="text"
                  maxLength={14}
                  placeholder="उदा. 9876-5432-1098"
                  value={formData.apaarId}
                  onChange={e => handleApaarChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-stone-300 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  सामाजिक श्रेणी
                </label>
                <select
                  value={formData.socialCategory}
                  onChange={e => setFormData({ ...formData, socialCategory: e.target.value as SocialCategory })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="General">General (सामान्य)</option>
                  <option value="OBC">OBC (अन्य पिछड़ा वर्ग)</option>
                  <option value="SC">SC (अनुसूचित जाति)</option>
                  <option value="ST">ST (अनुसूचित जनजाति)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  सहोदर परिवार कोड (Family ID)
                </label>
                <input
                  type="text"
                  placeholder="उदा. FAM-1001"
                  value={formData.familyId}
                  onChange={e => setFormData({ ...formData, familyId: e.target.value.trim().toUpperCase() })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-stone-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  title="सहोदर 25%/50% स्वचालित शुल्क छूट लिंकिंग हेतु"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                <input
                  type="checkbox"
                  checked={formData.cwsn}
                  onChange={e => setFormData({ ...formData, cwsn: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-stone-300 focus:ring-blue-500"
                />
                <span>दिव्यांग (CWSN)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                <input
                  type="checkbox"
                  checked={formData.bpl}
                  onChange={e => setFormData({ ...formData, bpl: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-stone-300 focus:ring-blue-500"
                />
                <span>गरीबी रेखा (BPL / EWS)</span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer transition"
            >
              रद्द करें (Cancel)
            </button>
            {!isEditing && (
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg shadow-2xs cursor-pointer transition active:scale-98"
                title="वर्तमान छात्र सुरक्षित करें और उसी कक्षा के अगले छात्र का फॉर्म खोलें"
              >
                <UserPlus className="w-4 h-4 text-amber-600" />
                <span>सहेजें एवं अगला छात्र जोड़ें</span>
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-lg shadow-sm cursor-pointer transition active:scale-98"
            >
              {isEditing ? <Edit3 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isEditing ? 'विवरण अद्यतन करें (Update Student)' : 'छात्र पंजीकृत करें (Register Student)'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
