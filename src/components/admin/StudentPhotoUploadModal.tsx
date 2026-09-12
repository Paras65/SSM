import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Image, Check, Trash2 } from 'lucide-react';
import type { Student } from '../../types';

interface StudentPhotoUploadModalProps {
  student: Student;
  onSave: (photoUrl: string) => Promise<void>;
  onClose: () => void;
}

export const StudentPhotoUploadModal: React.FC<StudentPhotoUploadModalProps> = ({
  student,
  onSave,
  onClose
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(student.photoUrl || '');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (e.g. 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('कृपया 2MB से कम आकार की फोटो चुनें।');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(previewUrl);
      onClose();
    } catch (err: any) {
      alert('फोटो सुरक्षित करने में त्रुटि: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-saffron-800 text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-300" />
            <h3 className="text-base font-bold">छात्र पासपोर्ट फोटो अपलोड</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="बंद करें"
            className="p-1 rounded-lg hover:bg-white/10 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-center">
          <div>
            <h4 className="font-bold text-stone-900 text-base">{student.name}</h4>
            <p className="text-xs text-stone-500">
              अनुक्रमांक: {student.rollNo} • कक्षा: {student.class} ({student.section})
            </p>
          </div>

          {/* Photo Preview Frame */}
          <div className="flex flex-col items-center">
            <div className="w-36 h-44 rounded-xl border-2 border-dashed border-saffron-400 bg-amber-50/50 flex flex-col items-center justify-center overflow-hidden relative shadow-inner group">
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-white text-stone-800 rounded-full hover:bg-amber-100 shadow"
                      title="फोटो बदलें"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewUrl('')}
                      className="p-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow"
                      title="फोटो हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer p-4 flex flex-col items-center text-stone-400 hover:text-saffron-700 transition"
                >
                  <Image className="w-10 h-10 mb-2 text-saffron-400" />
                  <span className="text-xs font-semibold">फोटो चुनें / खींचें</span>
                  <span className="text-[10px] text-stone-400 mt-0.5">पासपोर्ट साइज (3:4)</span>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-saffron-50 hover:bg-saffron-100 text-saffron-800 border border-saffron-300 rounded-lg text-xs font-bold transition"
            >
              <Upload className="w-3.5 h-3.5" />
              डिवाइस से फोटो अपलोड करें
            </button>
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-left text-xs text-amber-900 leading-relaxed">
            📌 <strong>सूचना:</strong> पासपोर्ट फोटो स्वतः छात्र के <strong>पहचान पत्र (ID Card)</strong> एवं <strong>स्थानांतरण प्रमाण पत्र (TC)</strong> में जुड़ जाएगी।
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 transition"
          >
            रद्द करें
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-saffron-700 hover:bg-saffron-800 disabled:opacity-50 rounded-lg shadow transition"
          >
            <Check className="w-4 h-4" />
            {saving ? 'सुरक्षित हो रहा है...' : 'फोटो सुरक्षित करें (Save)'}
          </button>
        </div>

      </div>
    </div>
  );
};

