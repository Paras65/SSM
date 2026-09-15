import React, { useState, useEffect, useCallback } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { LeaveRequest } from '../../types';
import { X, CheckCircle, XCircle, Clock, Calendar, Filter } from 'lucide-react';

interface LeaveManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaveManagementModal: React.FC<LeaveManagementModalProps> = ({ isOpen, onClose }) => {
  const { currentSchool } = useSchool();
  const { showError } = useToast();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'student' | 'staff'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [loading, setLoading] = useState(false);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getLeaves(currentSchool.id);
      setLeaves(data);
    } catch (err) {
      showError('अवकाश डेटा लोड करने में त्रुटि। कृपया पुनः प्रयास करें।');
      console.error('Failed to fetch leaves:', err);
    } finally {
      setLoading(false);
    }
  }, [currentSchool.id]);

  useEffect(() => {
    if (isOpen) {
      fetchLeaves();
    }
  }, [isOpen, fetchLeaves]);

  if (!isOpen) return null;

  const handleStatusUpdate = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    const remark = prompt(`टिप्पणी दर्ज करें (वैकल्पिक):`, newStatus === 'Approved' ? 'स्वीकृत' : 'अस्वीकृत');
    try {
      const updated = await api.updateLeaveStatus(id, newStatus, remark || '', currentSchool.principalName || 'प्रधानाचार्य');
      setLeaves(prev => prev.map(l => l.id === id ? updated : l));
    } catch (err: any) {
      alert(err.message || 'स्थिति अपडेट करने में त्रुटि।');
    }
  };

  const filteredLeaves = leaves.filter(l => {
    if (filterType !== 'all' && l.applicantType !== filterType) return false;
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 relative my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center text-xl">
              <Calendar className="w-5 h-5 text-orange-700" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                अवकाश प्रबंधन व समीक्षा (Leave Application & Approval)
              </h3>
              <p className="text-xs text-stone-500">
                {currentSchool.hindiName} • छात्र एवं आचार्य अवकाश समीक्षा
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <span className="font-bold text-stone-600">वर्ग:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-stone-300 bg-stone-50 font-bold"
            >
              <option value="all">सभी आवेदक (All)</option>
              <option value="student">केवल छात्र (Students)</option>
              <option value="staff">केवल आचार्य/स्टाफ (Staff)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-600">स्थिति:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-stone-300 bg-stone-50 font-bold"
            >
              <option value="all">सभी स्थितियां</option>
              <option value="Pending">प्रतीक्षारत (Pending)</option>
              <option value="Approved">स्वीकृत (Approved)</option>
              <option value="Rejected">अस्वीकृत (Rejected)</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs">
          {loading ? (
            <p className="text-center text-stone-400 py-8">लोड हो रहा है...</p>
          ) : filteredLeaves.length === 0 ? (
            <div className="text-center text-stone-400 py-12">
              <Clock className="w-10 h-10 mx-auto text-stone-300 mb-2" />
              <p className="font-bold">इस श्रेणी में कोई अवकाश आवेदन नहीं है।</p>
            </div>
          ) : (
            filteredLeaves.map(leave => (
              <div key={leave.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-white transition space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{leave.applicantName}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-700">
                      {leave.applicantType === 'student' ? 'छात्र' : 'आचार्य'} • {leave.classOrDesignation}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {leave.status === 'Approved' ? 'स्वीकृत' : leave.status === 'Rejected' ? 'अस्वीकृत' : 'प्रतीक्षारत'}
                    </span>
                  </div>

                  <span className="text-[11px] text-stone-500 font-mono">
                    आवेदन दिनांक: {leave.appliedDate}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-100 text-stone-700 space-y-1">
                  <div className="font-bold text-stone-900">
                    अवधि: {leave.startDate} से {leave.endDate}
                  </div>
                  <p className="italic text-stone-600">"{leave.reason}"</p>
                </div>

                {leave.reviewerRemarks && (
                  <p className="text-[11px] text-orange-900 font-semibold">
                    समीक्षा टिप्पणी: {leave.reviewerRemarks} ({leave.reviewedBy})
                  </p>
                )}

                {leave.status === 'Pending' && (
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleStatusUpdate(leave.id, 'Rejected')}
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-xl flex items-center gap-1 transition"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>अस्वीकार करें</span>
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(leave.id, 'Approved')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1 shadow-xs transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>स्वीकार करें (Approve)</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

