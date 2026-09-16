import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { InventoryItem } from '../../types';
import { X, Package, Plus, Trash2, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface InventoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InventoryManagementModal: React.FC<InventoryManagementModalProps> = ({ isOpen, onClose }) => {
  const { currentSchool } = useSchool();
  const { showError } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddItem, setShowAddItem] = useState(false);

  // Form state
  const [itemName, setItemName] = useState('ग्रीष्मकालीन गणवेश (शर्ट व पैंट)');
  const [category, setCategory] = useState('गणवेश (Uniform)');
  const [sizeOrStandard, setSizeOrStandard] = useState('Size 32');
  const [unitPrice, setUnitPrice] = useState(650);
  const [stockQuantity, setStockQuantity] = useState(40);
  const [minimumAlertStock, setMinimumAlertStock] = useState(10);
  const [unit, setUnit] = useState('सेट (Set)');

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const data = await api.getInventory(currentSchool.id);
      setItems(data);
    } catch (err) {
      setFetchError(true);
      showError('सामग्री सूची लोड करने में त्रुटि। कृपया पुनः प्रयास करें।');
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInventory();
    }
  }, [isOpen, currentSchool.id]);

  if (!isOpen) return null;

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newItem = await api.createInventoryItem({
        schoolId: currentSchool.id,
        itemName,
        category,
        sizeOrStandard,
        unitPrice,
        stockQuantity,
        minimumAlertStock,
        unit
      });
      setItems(prev => [newItem, ...prev]);
      setShowAddItem(false);
    } catch (err: any) {
      alert(err.message || 'सामग्री जोड़ने में त्रुटि।');
    }
  };

  const handleAdjustStock = async (id: string, delta: number) => {
    try {
      const updated = await api.adjustInventoryStock(id, delta);
      setItems(prev => prev.map(item => item.id === id ? updated : item));
    } catch (err: any) {
      alert(err.message || 'स्टॉक अपडेट में त्रुटि।');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('क्या आप इस वस्तु को हटाना चाहते हैं?')) return;
    try {
      await api.deleteInventoryItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      alert('हटाने में त्रुटि।');
    }
  };

  const filteredItems = items.filter(i => {
    if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 relative my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center text-xl">
              <Package className="w-5 h-5 text-orange-700" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                विद्यालय गणवेश व पुस्तक भंडार (Uniform & Book Store Inventory)
              </h3>
              <p className="text-xs text-stone-500">
                {currentSchool.hindiName} • गणवेश, पाठ्यपुस्तक, डायरी व स्टेशनरी स्टॉक
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

        {/* Action bar & Filters */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 shrink-0 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="text-stone-500 uppercase text-[10px]">श्रेणी:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-300 bg-stone-50 font-bold"
            >
              <option value="all">सभी वस्तुएं ({items.length})</option>
              <option value="गणवेश (Uniform)">गणवेश (Uniform)</option>
              <option value="पुस्तकें (Books)">पुस्तकें (Books)</option>
              <option value="अभ्यास पुस्तिका (Notebooks)">अभ्यास पुस्तिका</option>
              <option value="बैज व बेल्ट">बैज व बेल्ट</option>
              <option value="स्टेशनरी (Stationery)">स्टेशनरी</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddItem(!showAddItem)}
            className="px-4 py-2 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>नई सामग्री जोड़ें</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {showAddItem && (
            <form onSubmit={handleCreateItem} className="bg-amber-50/70 p-5 rounded-2xl border border-orange-200 space-y-3">
              <h4 className="font-bold text-orange-950 text-sm">नवीन भंडार सामग्री प्रविष्टि</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">सामग्री का नाम (Item Name)</label>
                  <input
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">श्रेणी (Category)</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="गणवेश (Uniform)">गणवेश (Uniform)</option>
                    <option value="पुस्तकें (Books)">पुस्तकें (Books)</option>
                    <option value="अभ्यास पुस्तिका (Notebooks)">अभ्यास पुस्तिका (Notebooks)</option>
                    <option value="बैज व बेल्ट">बैज व बेल्ट</option>
                    <option value="स्टेशनरी (Stationery)">स्टेशनरी (Stationery)</option>
                    <option value="अन्य">अन्य</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">साइज / कक्षा मानक</label>
                  <input
                    value={sizeOrStandard}
                    onChange={(e) => setSizeOrStandard(e.target.value)}
                    placeholder="उदा. Size 32, कक्षा 8"
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">मूल्य (Unit Price ₹)</label>
                  <input
                    type="number"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">प्रारंभिक स्टॉक मात्रा</label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">न्यूनतम चेतावनी स्टॉक</label>
                  <input
                    type="number"
                    value={minimumAlertStock}
                    onChange={(e) => setMinimumAlertStock(Number(e.target.value) || 10)}
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">इकाई (Unit)</label>
                  <input
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddItem(false)}
                  className="px-4 py-1.5 bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl shadow-xs"
                >
                  सामग्री सुरक्षित करें
                </button>
              </div>
            </form>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold text-[11px] uppercase">
                  <th className="p-3">सामग्री नाम</th>
                  <th className="p-3">श्रेणी</th>
                  <th className="p-3">साइज / कक्षा</th>
                  <th className="p-3">मूल्य</th>
                  <th className="p-3">उपलब्ध स्टॉक</th>
                  <th className="p-3 text-center">स्टॉक समायोजन (+/-)</th>
                  <th className="p-3 text-right">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-400">
                      भंडार सूची लोड हो रही है...
                    </td>
                  </tr>
                ) : fetchError ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-500">
                      <AlertTriangle className="w-8 h-8 mx-auto text-red-500 mb-1" />
                      <p className="font-bold text-red-600">सामग्री सूची लोड करने में त्रुटि</p>
                      <button
                        onClick={fetchInventory}
                        className="mt-2 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg shadow-xs"
                      >
                        🔄 पुनः प्रयास करें
                      </button>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-400">
                      भंडार में कोई वस्तु नहीं मिली।
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => {
                    const isLowStock = item.stockQuantity <= item.minimumAlertStock;
                    return (
                      <tr key={item.id} className="hover:bg-amber-50/20">
                        <td className="p-3 font-bold text-stone-900 flex items-center gap-1.5">
                          {isLowStock && (
                            <span title="कम स्टॉक चेतावनी!">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            </span>
                          )}
                          <span>{item.itemName}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-800">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3 text-stone-600 font-mono">{item.sizeOrStandard || '-'}</td>
                        <td className="p-3 font-bold text-stone-900">₹{item.unitPrice}</td>
                        <td className="p-3 font-bold">
                          <span className={isLowStock ? 'text-red-700' : 'text-emerald-700'}>
                            {item.stockQuantity}
                          </span>
                          <span className="text-[10px] text-stone-400 font-normal"> {item.unit}</span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleAdjustStock(item.id, -1)}
                              disabled={item.stockQuantity <= 0}
                              className="px-2 py-0.5 bg-stone-100 hover:bg-red-50 text-red-700 rounded font-bold transition disabled:opacity-40"
                              title="वितरण (-1)"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => handleAdjustStock(item.id, 1)}
                              className="px-2 py-0.5 bg-stone-100 hover:bg-emerald-50 text-emerald-700 rounded font-bold transition"
                              title="आवक (+1)"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => {
                                const qty = prompt('जोड़ने अथवा घटाने वाली संख्या (उदा. +10 या -5):', '10');
                                if (qty) handleAdjustStock(item.id, Number(qty));
                              }}
                              className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[10px] font-bold"
                            >
                              बल्क
                            </button>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-stone-400 hover:text-red-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

