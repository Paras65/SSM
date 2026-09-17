import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { TransportRoute, TransportStop } from '../../types';
import {
  X,
  Bus,
  Plus,
  Trash2,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Users,
  Search
} from 'lucide-react';

interface TransportManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransportManagementModal: React.FC<TransportManagementModalProps> = ({ isOpen, onClose }) => {
  const { currentSchool, students, updateStudent } = useSchool();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<'routes' | 'students'>('routes');
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [showAddRoute, setShowAddRoute] = useState(false);

  // New Route form state
  const [routeName, setRouteName] = useState('रूट 1 - नगर केंद्र से विद्यालय');
  const [vehicleNumber, setVehicleNumber] = useState('UP 53 AB 1234');
  const [driverName, setDriverName] = useState('श्री रामसेवक जी');
  const [driverPhone, setDriverPhone] = useState('9876543210');
  const [helperName, setHelperName] = useState('श्री श्यामलाल जी');
  const [capacity, setCapacity] = useState(40);
  const [stops, setStops] = useState<TransportStop[]>([
    { stopName: 'शास्त्री चौक', pickupTime: '07:20 AM', dropTime: '02:30 PM', monthlyFare: 800 },
    { stopName: 'गांधी नगर', pickupTime: '07:35 AM', dropTime: '02:15 PM', monthlyFare: 700 },
    { stopName: 'रेलवे स्टेशन मोड़', pickupTime: '07:50 AM', dropTime: '02:00 PM', monthlyFare: 600 }
  ]);

  // Edit Route state
  const [editingRoute, setEditingRoute] = useState<TransportRoute | null>(null);
  const [editRouteName, setEditRouteName] = useState('');
  const [editVehicleNumber, setEditVehicleNumber] = useState('');
  const [editDriverName, setEditDriverName] = useState('');
  const [editDriverPhone, setEditDriverPhone] = useState('');
  const [editHelperName, setEditHelperName] = useState('');
  const [editCapacity, setEditCapacity] = useState(40);
  const [editStops, setEditStops] = useState<TransportStop[]>([]);
  const [editStatus, setEditStatus] = useState<'Active' | 'Maintenance' | 'Inactive'>('Active');

  // Delete Route state
  const [routeToDelete, setRouteToDelete] = useState<TransportRoute | null>(null);

  // Student assignment tab filters
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('all');

  const fetchRoutes = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const data = await api.getTransportRoutes(currentSchool.id);
      setRoutes(data);
    } catch (err) {
      setFetchError(true);
      showError('परिवहन डेटा लोड करने में त्रुटि। कृपया पुनः प्रयास करें।');
      console.error('Failed to fetch routes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRoutes();
    }
  }, [isOpen, currentSchool.id]);

  if (!isOpen) return null;

  const handleAddStop = () => {
    setStops(prev => [
      ...prev,
      { stopName: '', pickupTime: '07:30 AM', dropTime: '02:30 PM', monthlyFare: 700 }
    ]);
  };

  const handleRemoveStop = (index: number) => {
    setStops(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newRoute = await api.createTransportRoute({
        schoolId: currentSchool.id,
        routeName,
        vehicleNumber,
        driverName,
        driverPhone,
        helperName,
        capacity,
        stops,
        status: 'Active'
      });
      setRoutes(prev => [newRoute, ...prev]);
      setShowAddRoute(false);
      showSuccess(`बस मार्ग "${newRoute.routeName}" सफलतापूर्वक पंजीकृत हुआ!`);
    } catch (err: any) {
      showError(err.message || 'रूट जोड़ने में त्रुटि आई।');
    }
  };

  const handleStartEditRoute = (route: TransportRoute) => {
    setEditingRoute(route);
    setEditRouteName(route.routeName);
    setEditVehicleNumber(route.vehicleNumber);
    setEditDriverName(route.driverName);
    setEditDriverPhone(route.driverPhone);
    setEditHelperName(route.helperName || '');
    setEditCapacity(route.capacity);
    setEditStops(route.stops ? [...route.stops] : []);
    setEditStatus(route.status || 'Active');
  };

  const handleSaveEditRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoute) return;
    try {
      const updated = await api.updateTransportRoute(editingRoute.id, {
        routeName: editRouteName,
        vehicleNumber: editVehicleNumber,
        driverName: editDriverName,
        driverPhone: editDriverPhone,
        helperName: editHelperName,
        capacity: editCapacity,
        stops: editStops,
        status: editStatus
      });
      setRoutes(prev => prev.map(r => r.id === editingRoute.id ? updated : r));
      setEditingRoute(null);
      showSuccess(`बस मार्ग "${updated.routeName}" सफलतापूर्वक अद्यतन हुआ!`);
    } catch (err: any) {
      showError(err.message || 'रूट अद्यतन करने में त्रुटि আই।');
    }
  };

  const handleConfirmDeleteRoute = async () => {
    if (!routeToDelete) return;
    try {
      await api.deleteTransportRoute(routeToDelete.id);
      setRoutes(prev => prev.filter(r => r.id !== routeToDelete.id));
      showSuccess(`बस मार्ग "${routeToDelete.routeName}" हटा दिया गया!`);
      setRouteToDelete(null);
    } catch (err: any) {
      showError(err.message || 'रूट हटाने में त्रुटि आई।');
    }
  };

  const handleAssignStudentRoute = async (student: typeof students[0], routeId: string, stopName: string) => {
    try {
      await updateStudent({
        ...student,
        transportRouteId: routeId || '',
        transportStop: stopName || ''
      });
      showSuccess('विद्यार्थी का परिवहन आवंटन अद्यतन हुआ!');
    } catch (err: any) {
      showError('परिवहन आवंटन में त्रुटि: ' + err.message);
    }
  };

  // Assigned student counts
  const getAssignedCount = (routeId: string) => {
    return students.filter(s => s.transportRouteId === routeId).length;
  };

  const totalAssignedStudents = students.filter(s => !!s.transportRouteId).length;

  const filteredStudents = students.filter(s => {
    if (studentClassFilter !== 'all' && s.class !== studentClassFilter) return false;
    if (studentSearch) {
      const q = studentSearch.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        (s.contact && s.contact.includes(q))
      );
    }
    return true;
  });

  const availableClasses = Array.from(new Set(students.map(s => s.class))).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 relative my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center text-xl">
              <Bus className="w-5 h-5 text-orange-700" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                विद्यालय वाहन एवं परिवहन प्रबंधन (Transport & Bus Routes)
              </h3>
              <p className="text-xs text-stone-500">
                {currentSchool.hindiName} • बस मार्ग, स्टॉप, चालक व छात्र आवंटन
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center justify-between pt-3 pb-2 border-b border-stone-100 shrink-0 text-xs font-bold">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('routes')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'routes' ? 'bg-orange-700 text-white shadow-xs' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Bus className="w-4 h-4" />
              <span>सक्रिय बस रूट्स ({routes.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'students' ? 'bg-orange-700 text-white shadow-xs' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>विद्यार्थी वाहन आवंटन ({totalAssignedStudents} पंजीकृत)</span>
            </button>
          </div>

          {activeTab === 'routes' && (
            <button
              onClick={() => setShowAddRoute(!showAddRoute)}
              className="px-4 py-2 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>नया रूट जोड़ें</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {activeTab === 'routes' && (
            <div className="space-y-4">
              {showAddRoute && (
                <form onSubmit={handleCreateRoute} className="bg-amber-50/70 p-5 rounded-2xl border border-orange-200 space-y-4">
                  <h4 className="font-bold text-orange-950 text-sm">नवीन बस रूट पंजीकरण</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">रूट का नाम *</label>
                      <input
                        required
                        value={routeName}
                        onChange={(e) => setRouteName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">वाहन क्रमांक (Vehicle No) *</label>
                      <input
                        required
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">सीट क्षमता (Capacity)</label>
                      <input
                        type="number"
                        min={1}
                        value={capacity}
                        onChange={(e) => setCapacity(Number(e.target.value) || 40)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">चालक (Driver Name) *</label>
                      <input
                        required
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">चालक संपर्क (Phone) *</label>
                      <input
                        required
                        value={driverPhone}
                        onChange={(e) => setDriverPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">सह-चालक / कंडक्टर</label>
                      <input
                        value={helperName}
                        onChange={(e) => setHelperName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                  </div>

                  {/* Stops list */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-bold text-stone-800">रूट स्टॉप व समय सूची</label>
                      <button
                        type="button"
                        onClick={handleAddStop}
                        className="text-orange-700 font-bold hover:underline cursor-pointer"
                      >
                        + स्टॉप जोड़ें
                      </button>
                    </div>

                    <div className="space-y-2">
                      {stops.map((stop, i) => (
                        <div key={i} className="flex flex-wrap items-center gap-2 p-2 bg-white rounded-xl border border-orange-200">
                          <input
                            placeholder="स्टॉप का नाम (Stop Name)"
                            value={stop.stopName}
                            onChange={(e) => {
                              const val = e.target.value;
                              setStops(prev => prev.map((s, idx) => idx === i ? { ...s, stopName: val } : s));
                            }}
                            className="flex-1 min-w-[140px] px-2.5 py-1.5 rounded-lg border border-stone-300 font-bold"
                          />
                          <input
                            placeholder="पिकअप समय"
                            value={stop.pickupTime}
                            onChange={(e) => {
                              const val = e.target.value;
                              setStops(prev => prev.map((s, idx) => idx === i ? { ...s, pickupTime: val } : s));
                            }}
                            className="w-28 px-2 py-1.5 rounded-lg border border-stone-300"
                          />
                          <input
                            placeholder="ड्रॉप समय"
                            value={stop.dropTime}
                            onChange={(e) => {
                              const val = e.target.value;
                              setStops(prev => prev.map((s, idx) => idx === i ? { ...s, dropTime: val } : s));
                            }}
                            className="w-28 px-2 py-1.5 rounded-lg border border-stone-300"
                          />
                          <input
                            type="number"
                            placeholder="मासिक शुल्क"
                            value={stop.monthlyFare}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setStops(prev => prev.map((s, idx) => idx === i ? { ...s, monthlyFare: val } : s));
                            }}
                            className="w-24 px-2 py-1.5 rounded-lg border border-stone-300"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveStop(i)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddRoute(false)}
                      className="px-4 py-2 bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                    >
                      रूट सुरक्षित करें
                    </button>
                  </div>
                </form>
              )}

              {/* Routes Cards */}
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center text-stone-400 py-10">परिवहन डेटा लोड हो रहा है...</p>
                ) : fetchError ? (
                  <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-200 text-stone-600">
                    <AlertTriangle className="w-8 h-8 mx-auto text-red-500 mb-1" />
                    <p className="font-bold text-red-700">परिवहन डेटा लोड करने में त्रुटि</p>
                    <p className="text-xs text-stone-400 mt-1">सर्वर से संपर्क नहीं हो सका।</p>
                    <button
                      onClick={fetchRoutes}
                      className="mt-2 px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      🔄 पुनः प्रयास करें
                    </button>
                  </div>
                ) : routes.length === 0 ? (
                  <p className="text-center text-stone-400 py-10">कोई बस रूट पंजीकृत नहीं है।</p>
                ) : (
                  routes.map(r => {
                    const assigned = getAssignedCount(r.id);
                    return (
                      <div key={r.id} className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-stone-900 text-sm">{r.routeName}</h4>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-900 font-mono">
                                {r.vehicleNumber}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                r.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {r.status}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                                {assigned} / {r.capacity} विद्यार्थी आवंटित
                              </span>
                            </div>
                            <p className="text-stone-500 text-xs mt-1 flex items-center gap-3 flex-wrap">
                              <span>चालक: <strong>{r.driverName}</strong></span>
                              <span className="flex items-center gap-1 font-mono">
                                <Phone className="w-3 h-3 text-orange-700" />
                                {r.driverPhone}
                              </span>
                              {r.helperName && <span>कंडक्टर: {r.helperName}</span>}
                              <span>क्षमता: {r.capacity} सीटें</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStartEditRoute(r)}
                              className="p-1.5 text-stone-400 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition cursor-pointer"
                              title="रूट संपादित करें"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setRouteToDelete(r)}
                              className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                              title="रूट हटाएं"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Stops list */}
                        <div className="bg-white rounded-xl border border-stone-200 p-3">
                          <span className="font-bold text-stone-700 text-[11px] block mb-2">स्टॉप एवं समय सूची:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {r.stops?.map((st, idx) => (
                              <div key={idx} className="p-2 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-stone-800 block text-xs flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-orange-600" />
                                    {st.stopName}
                                  </span>
                                  <span className="text-[10px] text-stone-500">
                                    {st.pickupTime} / {st.dropTime}
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-emerald-700">
                                  ₹{st.monthlyFare}/माह
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="space-y-3">
              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    placeholder="विद्यार्थी नाम अथवा अनुक्रमांक से खोजें..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-300 bg-stone-50 text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-stone-500 font-bold">कक्षा:</span>
                  <select
                    value={studentClassFilter}
                    onChange={(e) => setStudentClassFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-stone-300 bg-stone-50 text-xs font-bold"
                  >
                    <option value="all">सभी कक्षाएं</option>
                    {availableClasses.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student Transport Assignment Table */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold text-[11px] uppercase">
                      <th className="p-3">अनुक्रमांक</th>
                      <th className="p-3">विद्यार्थी का नाम</th>
                      <th className="p-3">कक्षा</th>
                      <th className="p-3">आवंटित बस रूट</th>
                      <th className="p-3">बोर्डिंग स्टॉप</th>
                      <th className="p-3">मासिक शुल्क</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-stone-400">
                          कोई विद्यार्थी नहीं मिला।
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map(student => {
                        const assignedRoute = routes.find(r => r.id === student.transportRouteId);
                        const assignedStop = assignedRoute?.stops?.find(s => s.stopName === student.transportStop);
                        return (
                          <tr key={student.id} className="hover:bg-amber-50/20">
                            <td className="p-3 font-mono font-bold text-stone-700">{student.rollNo}</td>
                            <td className="p-3 font-bold text-stone-900">{student.name}</td>
                            <td className="p-3 text-stone-600">{student.class}</td>
                            <td className="p-3">
                              <select
                                value={student.transportRouteId || ''}
                                onChange={(e) => {
                                  const rId = e.target.value;
                                  const r = routes.find(x => x.id === rId);
                                  const defaultStop = r?.stops?.[0]?.stopName || '';
                                  handleAssignStudentRoute(student, rId, defaultStop);
                                }}
                                className="px-2.5 py-1 rounded-lg border border-stone-300 text-xs font-medium bg-white"
                              >
                                <option value="">-- कोई नहीं (None) --</option>
                                {routes.map(r => (
                                  <option key={r.id} value={r.id}>
                                    {r.routeName} ({r.vehicleNumber})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="p-3">
                              {assignedRoute ? (
                                <select
                                  value={student.transportStop || ''}
                                  onChange={(e) => handleAssignStudentRoute(student, assignedRoute.id, e.target.value)}
                                  className="px-2.5 py-1 rounded-lg border border-stone-300 text-xs font-medium bg-white"
                                >
                                  <option value="">-- स्टॉप चुनें --</option>
                                  {assignedRoute.stops?.map((st, idx) => (
                                    <option key={idx} value={st.stopName}>
                                      {st.stopName} ({st.pickupTime})
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-stone-400 italic text-[11px]">-</span>
                              )}
                            </td>
                            <td className="p-3 font-bold text-emerald-700">
                              {assignedStop ? `₹${assignedStop.monthlyFare}/माह` : '-'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sub-Modal: Edit Route */}
        {editingRoute && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 my-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                <h4 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-orange-700" />
                  <span>बस रूट संपादित करें</span>
                </h4>
                <button onClick={() => setEditingRoute(null)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditRoute} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">रूट का नाम *</label>
                    <input
                      required
                      value={editRouteName}
                      onChange={(e) => setEditRouteName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">वाहन क्रमांक *</label>
                    <input
                      required
                      value={editVehicleNumber}
                      onChange={(e) => setEditVehicleNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">सीट क्षमता</label>
                    <input
                      type="number"
                      min={1}
                      value={editCapacity}
                      onChange={(e) => setEditCapacity(Number(e.target.value) || 40)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">चालक नाम *</label>
                    <input
                      required
                      value={editDriverName}
                      onChange={(e) => setEditDriverName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">चालक फोन *</label>
                    <input
                      required
                      value={editDriverPhone}
                      onChange={(e) => setEditDriverPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">स्थिति (Status)</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    >
                      <option value="Active">सक्रिय (Active)</option>
                      <option value="Maintenance">मरम्मत (Maintenance)</option>
                      <option value="Inactive">निष्क्रिय (Inactive)</option>
                    </select>
                  </div>
                </div>

                {/* Edit stops list */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-bold text-stone-800">स्टॉप सूची</label>
                    <button
                      type="button"
                      onClick={() => setEditStops(prev => [
                        ...prev,
                        { stopName: '', pickupTime: '07:30 AM', dropTime: '02:30 PM', monthlyFare: 700 }
                      ])}
                      className="text-orange-700 font-bold hover:underline cursor-pointer"
                    >
                      + स्टॉप जोड़ें
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {editStops.map((stop, i) => (
                      <div key={i} className="flex flex-wrap items-center gap-2 p-2 bg-stone-50 rounded-xl border border-stone-200">
                        <input
                          placeholder="स्टॉप का नाम"
                          value={stop.stopName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditStops(prev => prev.map((s, idx) => idx === i ? { ...s, stopName: val } : s));
                          }}
                          className="flex-1 min-w-[120px] px-2.5 py-1.5 rounded-lg border border-stone-300 font-bold bg-white"
                        />
                        <input
                          placeholder="पिकअप"
                          value={stop.pickupTime}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditStops(prev => prev.map((s, idx) => idx === i ? { ...s, pickupTime: val } : s));
                          }}
                          className="w-24 px-2 py-1.5 rounded-lg border border-stone-300 bg-white"
                        />
                        <input
                          placeholder="ड्रॉप"
                          value={stop.dropTime}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditStops(prev => prev.map((s, idx) => idx === i ? { ...s, dropTime: val } : s));
                          }}
                          className="w-24 px-2 py-1.5 rounded-lg border border-stone-300 bg-white"
                        />
                        <input
                          type="number"
                          placeholder="शुल्क"
                          value={stop.monthlyFare}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setEditStops(prev => prev.map((s, idx) => idx === i ? { ...s, monthlyFare: val } : s));
                          }}
                          className="w-20 px-2 py-1.5 rounded-lg border border-stone-300 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setEditStops(prev => prev.filter((_, idx) => idx !== i))}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setEditingRoute(null)}
                    className="px-4 py-2 bg-stone-100 font-bold rounded-xl cursor-pointer"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    सहेजें (Save)
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sub-Modal: Delete Route Confirmation */}
        {routeToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h4 className="font-bold text-stone-900 text-base">बस रूट हटाएं?</h4>
              </div>
              <p className="text-xs text-stone-600 mb-5">
                क्या आप बस मार्ग <strong className="text-stone-900">"{routeToDelete.routeName}"</strong> ({routeToDelete.vehicleNumber}) को स्थायी रूप से हटाना चाहते हैं?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRouteToDelete(null)}
                  className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteRoute}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  हाँ, हटाएं
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
