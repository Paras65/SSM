import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { api } from '../../services/api';
import type { TransportRoute, TransportStop } from '../../types';
import { X, Bus, Plus, Trash2, Phone, MapPin, CheckCircle2 } from 'lucide-react';

interface TransportManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransportManagementModal: React.FC<TransportManagementModalProps> = ({ isOpen, onClose }) => {
  const { currentSchool } = useSchool();
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
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

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const data = await api.getTransportRoutes(currentSchool.id);
      setRoutes(data);
    } catch (err) {
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
    } catch (err: any) {
      alert(err.message || 'रूट जोड़ने में त्रुटि आई।');
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (!confirm('क्या आप इस बस रूट को हटाना चाहते हैं?')) return;
    try {
      await api.deleteTransportRoute(id);
      setRoutes(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('रूट हटाने में त्रुटि आई।');
    }
  };

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
                {currentSchool.hindiName} • बस मार्ग, स्टॉप व चालक विवरण
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

        {/* Action Bar */}
        <div className="py-3 flex items-center justify-between border-b border-stone-100 shrink-0 text-xs font-bold">
          <span className="text-stone-700">सक्रिय बस रूट्स ({routes.length})</span>
          <button
            onClick={() => setShowAddRoute(!showAddRoute)}
            className="px-4 py-2 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>नया रूट जोड़ें</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {showAddRoute && (
            <form onSubmit={handleCreateRoute} className="bg-amber-50/70 p-5 rounded-2xl border border-orange-200 space-y-4">
              <h4 className="font-bold text-orange-950 text-sm">नवीन बस रूट पंजीकरण</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">रूट का नाम</label>
                  <input
                    required
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">वाहन क्रमांक (Vehicle No)</label>
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
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value) || 40)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">चालक (Driver Name)</label>
                  <input
                    required
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">चालक संपर्क (Phone)</label>
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
                    className="text-orange-700 font-bold hover:underline"
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
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
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
                  className="px-4 py-2 bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl shadow-xs"
                >
                  रूट सुरक्षित करें
                </button>
              </div>
            </form>
          )}

          {/* Routes Cards */}
          <div className="space-y-4">
            {routes.length === 0 ? (
              <p className="text-center text-stone-400 py-10">कोई बस रूट पंजीकृत नहीं है।</p>
            ) : (
              routes.map(r => (
                <div key={r.id} className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-stone-900 text-sm">{r.routeName}</h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-900 font-mono">
                          {r.vehicleNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                          {r.status}
                        </span>
                      </div>
                      <p className="text-stone-500 text-xs mt-1 flex items-center gap-3">
                        <span>चालक: <strong>{r.driverName}</strong></span>
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-orange-700" />
                          {r.driverPhone}
                        </span>
                        {r.helperName && <span>कंडक्टर: {r.helperName}</span>}
                        <span>क्षमता: {r.capacity} सीटें</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteRoute(r.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

