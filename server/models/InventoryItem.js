const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true, default: 'ssm-gorakhpur', index: true },
  itemName: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['गणवेश (Uniform)', 'पुस्तकें (Books)', 'अभ्यास पुस्तिका (Notebooks)', 'बैज व बेल्ट', 'स्टेशनरी (Stationery)', 'अन्य'],
    required: true 
  },
  sizeOrStandard: { type: String, default: '' }, // e.g., 'Size 32' or 'Class 8'
  unitPrice: { type: Number, required: true, min: [0, 'मूल्य नकारात्मक नहीं हो सकता'] },
  stockQuantity: { type: Number, default: 0, min: [0, 'स्टॉक नकारात्मक नहीं हो सकता'] },
  minimumAlertStock: { type: Number, default: 10, min: [0, 'अलर्ट स्टॉक नकारात्मक नहीं हो सकता'] },
  unit: { type: String, default: 'पीस (Pcs)' }
}, {
  timestamps: true
});

inventoryItemSchema.index({ schoolId: 1, category: 1 });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);

