import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
import { X, UserPlus, Edit3 } from 'lucide-react';
import type { Gender, SocialCategory, Student } from '../../types';
import { SSM_CLASSES } from '../../types';

interface AddStudentModalProps {
  onClose: () => void;
  studentToEdit?: Student | null;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ onClose, studentToEdit }) => {
  const { addStudent, updateStudent, students } = useSchool();
  const { showSuccess, showWarning } = useToast();

  const isEditing = Boolean(studentToEdit);
  const nextRoll = (students.length + 101).toString();

  const initialName = studentToEdit
    ? studentToEdit.name.replace(/^(भैया\s+|बहिन\s+|Bhaiya\s+|Bahin\s+)/i, '')
    : '';

  const [formData, setFormData] = useState({
    rollNo: studentToEdit?.rollNo || nextRoll,
    name: initialName,
    gender: (studentToEdit?.gender || 'Bhaiya') as Gender,
    class: studentToEdit?.class || 'Class 6',
    section: studentToEdit?.section || 'A',
    fatherName: studentToEdit?.fatherName || '',
    motherName: studentToEdit?.motherName || '',
    contact: studentToEdit?.contact || '',
    address: studentToEdit?.address || '',
    dob: studentToEdit?.dob || '2014-01-01',
    admissionDate: studentToEdit?.admissionDate || new Date().toISOString().split('T')[0],
    bloodGroup: studentToEdit?.bloodGroup || 'B+',
    pen: studentToEdit?.pen || '',
    socialCategory: (studentToEdit?.socialCategory || 'General') as SocialCategory,
    cwsn: studentToEdit?.cwsn || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    } else {
      addStudent({
        ...formData,
        name: fullName
      });
      showSuccess(`नए छात्र '${fullName}' सफलतापूर्वक पंजीकृत किए गए!`);
    }

    onClose();
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
          <button onClick={onClose} className="p-1 hover:bg-orange-800 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                छात्र / छात्रा का नाम *
              </label>
              <input
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
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                अनुक्रमांक (Roll No)
              </label>
              <input
                type="text"
                value={formData.rollNo}
                onChange={e => setFormData({ ...formData, rollNo: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                कक्षा (Class) *
              </label>
              <select
                value={formData.class}
                onChange={e => setFormData({ ...formData, class: e.target.value })}
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
                onChange={e => setFormData({ ...formData, section: e.target.value })}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                संपर्क मोबाइल नंबर *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 00000"
                value={formData.contact}
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

              <div className="flex flex-col justify-end pb-1.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={formData.cwsn}
                    onChange={e => setFormData({ ...formData, cwsn: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-stone-300 focus:ring-blue-500"
                  />
                  <span>दिव्यांग (CWSN) छात्र</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-sm cursor-pointer transition"
            >
              {isEditing ? 'विवरण अद्यतन करें (Update Student)' : 'छात्र पंजीकृत करें (Register Student)'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
