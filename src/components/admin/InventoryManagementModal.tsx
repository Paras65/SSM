import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { InventoryItem, AuditLogEntry } from '../../types';
import {
  X,
  Package,
  Plus,
  Trash2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  History,
  IndianRupee,
  CheckCircle2
} from 'lucide-react';

interface InventoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InventoryManagementModal: React.FC<InventoryManagementModalProps> = ({ isOpen, onClose }) => {
  const { currentSchool } = useSchool();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<'items' | 'history'>('items');
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

  // Edit item state
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSizeOrStandard, setEditSizeOrStandard] = useState('');
  const [editUnitPrice, setEditUnitPrice] = useState(0);
  const [editMinimumAlertStock, setEditMinimumAlertStock] = useState(10);
  const [editUnit, setEditUnit] = useState('');

  // Delete item modal
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  // Adjust stock modal
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(10);

  // History state
  const [stockLogs, setStockLogs] = useState<AuditLogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

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

  const fetchStockLogs = async () => {
    setLogsLoading(true);
    try {
      const data = await api.getAuditLogs(currentSchool.id, 'STOCK_ADJUSTED');
      setStockLogs(data);
    } catch (err) {
      console.error('Failed to fetch stock logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInventory();
      fetchStockLogs();
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
      showSuccess(`सामग्री "${newItem.itemName}" सफलतापूर्वक जोड़ी गई!`);
    } catch (err: any) {
      showError(err.message || 'सामग्री जोड़ने में त्रुटि।');
    }
  };

  const handleStartEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setEditItemName(item.itemName);
    setEditCategory(item.category);
    setEditSizeOrStandard(item.sizeOrStandard || '');
    setEditUnitPrice(item.unitPrice);
    setEditMinimumAlertStock(item.minimumAlertStock);
    setEditUnit(item.unit);
  };

  const handleSaveEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const updated = await api.updateInventoryItem(editingItem.id, {
        itemName: editItemName,
        category: editCategory,
        sizeOrStandard: editSizeOrStandard,
        unitPrice: editUnitPrice,
        minimumAlertStock: editMinimumAlertStock,
        unit: editUnit
      });
      setItems(prev => prev.map(i => i.id === editingItem.id ? updated : i));
      setEditingItem(null);
      showSuccess(`सामग्री "${updated.itemName}" सफलतापूर्वक अद्यतन हुई!`);
    } catch (err: any) {
      showError(err.message || 'सामग्री अद्यतन करने में त्रुटि।');
    }
  };

  const handleAdjustStock = async (id: string, delta: number) => {
    try {
      const updated = await api.adjustInventoryStock(id, delta);
      setItems(prev => prev.map(item => item.id === id ? updated : item));
      showSuccess(`स्टॉक समायोजन सफल: ${delta >= 0 ? '+' : ''}${delta}`);
      fetchStockLogs();
    } catch (err: any) {
      showError(err.message || 'स्टॉक अपडेट में त्रुटि।');
    }
  };

  const handleConfirmCustomAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem || adjustDelta === 0) return;
    await handleAdjustStock(adjustingItem.id, adjustDelta);
    setAdjustingItem(null);
  };

  const handleConfirmDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await api.deleteInventoryItem(itemToDelete.id);
      setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
      showSuccess(`सामग्री "${itemToDelete.itemName}" सफलतापूर्वक हटा दी गई!`);
      setItemToDelete(null);
    } catch (err: any) {
      showError(err.message || 'हटाने में त्रुटि।');
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
                {currentSchool.hindiName} • गणवेश, पाठ्यपुस्तक, डायरी, स्टेशनरी व स्टॉक इतिहास
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

        {/* Tab Switcher & Actions */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 shrink-0 text-xs font-bold">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('items')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'items' ? 'bg-orange-700 text-white shadow-xs' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>सामग्री भंडार ({items.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                fetchStockLogs();
              }}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history' ? 'bg-orange-700 text-white shadow-xs' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>स्टॉक आवक-जावक इतिहास ({stockLogs.length})</span>
            </button>
          </div>

          {activeTab === 'items' && (
            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-300 bg-stone-50 font-bold"
              >
                <option value="all">सभी श्रेणियां ({items.length})</option>
                <option value="गणवेश (Uniform)">गणवेश (Uniform)</option>
                <option value="पुस्तकें (Books)">पुस्तकें (Books)</option>
                <option value="अभ्यास पुस्तिका (Notebooks)">अभ्यास पुस्तिका</option>
                <option value="बैज व बेल्ट">बैज व बेल्ट</option>
                <option value="स्टेशनरी (Stationery)">स्टेशनरी</option>
              </select>

              <button
                onClick={() => setShowAddItem(!showAddItem)}
                className="px-4 py-2 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>नई सामग्री जोड़ें</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {activeTab === 'items' && (
            <div className="space-y-4">
              {showAddItem && (
                <form onSubmit={handleCreateItem} className="bg-amber-50/70 p-5 rounded-2xl border border-orange-200 space-y-3">
                  <h4 className="font-bold text-orange-950 text-sm">नवीन भंडार सामग्री प्रविष्टि</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-stone-700 mb-1">सामग्री का नाम (Item Name) *</label>
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
                      <label className="block font-bold text-stone-700 mb-1">मूल्य (Unit Price ₹) *</label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(Number(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">प्रारंभिक स्टॉक मात्रा *</label>
                      <input
                        type="number"
                        min={0}
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
                        min={0}
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
                      className="px-4 py-1.5 bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-1.5 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl shadow-xs cursor-pointer"
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
                            className="mt-2 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
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
                                  className="px-2 py-0.5 bg-stone-100 hover:bg-red-50 text-red-700 rounded font-bold transition disabled:opacity-40 cursor-pointer"
                                  title="वितरण (-1)"
                                >
                                  -1
                                </button>
                                <button
                                  onClick={() => handleAdjustStock(item.id, 1)}
                                  className="px-2 py-0.5 bg-stone-100 hover:bg-emerald-50 text-emerald-700 rounded font-bold transition cursor-pointer"
                                  title="आवक (+1)"
                                >
                                  +1
                                </button>
                                <button
                                  onClick={() => {
                                    setAdjustingItem(item);
                                    setAdjustDelta(10);
                                  }}
                                  className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[10px] font-bold cursor-pointer"
                                  title="स्टॉक समायोजन (Bulk Adjust)"
                                >
                                  समायोजन
                                </button>
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleStartEditItem(item)}
                                  className="p-1 text-stone-400 hover:text-orange-600 rounded cursor-pointer"
                                  title="विवरण संपादित करें"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setItemToDelete(item)}
                                  className="p-1 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                                  title="वस्तु हटाएं"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
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

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="bg-white rounded-2xl border border-stone-200 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold text-[11px] uppercase">
                      <th className="p-3">दिनांक व समय</th>
                      <th className="p-3">प्रशासक / कर्ता</th>
                      <th className="p-3">विवरण (Description)</th>
                      <th className="p-3 text-right">कार्रवाई प्रकार</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {logsLoading ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-stone-400">
                          स्टॉक इतिहास लोड हो रहा है...
                        </td>
                      </tr>
                    ) : stockLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-stone-400">
                          कोई स्टॉक समायोजन इतिहास दर्ज नहीं है।
                        </td>
                      </tr>
                    ) : (
                      stockLogs.map(log => (
                        <tr key={log.id} className="hover:bg-amber-50/20">
                          <td className="p-3 font-mono text-stone-600">
                            {new Date(log.createdAt).toLocaleString('hi-IN')}
                          </td>
                          <td className="p-3 font-bold text-stone-800">
                            {log.actorName || log.actorType}
                          </td>
                          <td className="p-3 text-stone-900 font-medium">
                            {log.description}
                          </td>
                          <td className="p-3 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                              {log.action}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sub-Modal: Edit Inventory Item */}
        {editingItem && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                <h4 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-orange-700" />
                  <span>सामग्री विवरण संपादित करें</span>
                </h4>
                <button onClick={() => setEditingItem(null)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditItem} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block font-bold text-stone-700 mb-1">सामग्री का नाम *</label>
                    <input
                      required
                      value={editItemName}
                      onChange={(e) => setEditItemName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">श्रेणी</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
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
                      value={editSizeOrStandard}
                      onChange={(e) => setEditSizeOrStandard(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">मूल्य (Unit Price ₹) *</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={editUnitPrice}
                      onChange={(e) => setEditUnitPrice(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">न्यूनतम चेतावनी स्टॉक</label>
                    <input
                      type="number"
                      min={0}
                      value={editMinimumAlertStock}
                      onChange={(e) => setEditMinimumAlertStock(Number(e.target.value) || 10)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-bold text-stone-700 mb-1">इकाई (Unit)</label>
                    <input
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
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

        {/* Sub-Modal: Stock Adjustment */}
        {adjustingItem && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200">
              <h4 className="font-bold text-stone-900 text-base mb-2">स्टॉक समायोजन (Adjust Stock)</h4>
              <p className="text-xs text-stone-600 mb-3">
                सामग्री: <strong className="text-stone-900">{adjustingItem.itemName}</strong>
                <br />
                वर्तमान स्टॉक: <strong className="text-emerald-700">{adjustingItem.stockQuantity} {adjustingItem.unit}</strong>
              </p>

              <form onSubmit={handleConfirmCustomAdjust} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    जोड़ने (+) अथवा घटाने (-) वाली संख्या:
                  </label>
                  <input
                    type="number"
                    required
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold text-stone-900"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[-20, -10, -5, +5, +10, +20].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAdjustDelta(val)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
                          adjustDelta === val
                            ? 'bg-orange-100 text-orange-900 border-orange-300'
                            : 'bg-stone-50 text-stone-600 border-stone-200'
                        }`}
                      >
                        {val > 0 ? `+${val}` : val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAdjustingItem(null)}
                    className="flex-1 py-2 bg-stone-100 font-bold rounded-xl cursor-pointer"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    समायोजन लागू करें
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sub-Modal: Delete Confirmation */}
        {itemToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h4 className="font-bold text-stone-900 text-base">सामग्री हटाएं?</h4>
              </div>
              <p className="text-xs text-stone-600 mb-5">
                क्या आप सामग्री <strong className="text-stone-900">"{itemToDelete.itemName}"</strong> ({itemToDelete.category}) को भंडार से स्थायी रूप से हटाना चाहते हैं?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteItem}
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
