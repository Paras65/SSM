import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { X, UserPlus } from 'lucide-react';
import type { Gender } from '../../types';

interface AddStudentModalProps {
  onClose: () => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ onClose }) => {
  const { addStudent, students } = useSchool();

  const nextRoll = (students.length + 101).toString();

  const [formData, setFormData] = useState({
    rollNo: nextRoll,
    name: '',
    gender: 'Bhaiya' as Gender,
    class: 'Class 6',
    section: 'A',
    fatherName: '',
    motherName: '',
    contact: '',
    address: '',
    dob: '2014-01-01',
    admissionDate: new Date().toISOString().split('T')[0],
    bloodGroup: 'B+'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.fatherName) {
      alert('कृपया छात्र एवं पिता का नाम अवश्य भरें।');
      return;
    }

    const fullName = formData.name.startsWith('भैया ') || formData.name.startsWith('बहिन ') || formData.name.startsWith('Bhaiya ') || formData.name.startsWith('Bahin ')
      ? formData.name
      : `${formData.gender === 'Bhaiya' ? 'Bhaiya' : 'Bahin'} ${formData.name}`;

    addStudent({
      ...formData,
      name: fullName
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-orange-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-700 to-amber-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-yellow-300" />
            <h3 className="text-base font-bold">
              नवीन छात्र प्रवेश पंजीयन (New Student Admission)
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-orange-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                <option value="Arun (Nursery)">अरुण (Nursery)</option>
                <option value="Uday (LKG)">उदय (LKG)</option>
                <option value="Prabhat (Prep)">प्रभात (Prep)</option>
                <option value="Class 1">Class 1</option>
                <option value="Class 2">Class 2</option>
                <option value="Class 3">Class 3</option>
                <option value="Class 4">Class 4</option>
                <option value="Class 5">Class 5</option>
                <option value="Class 6">Class 6</option>
                <option value="Class 7">Class 7</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
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
              className="px-5 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-sm"
            >
              छात्र पंजीकृत करें (Register Student)
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
