const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  stopName: { type: String, required: true },
  pickupTime: { type: String, default: '07:30 AM' },
  dropTime: { type: String, default: '02:30 PM' },
  monthlyFare: { type: Number, default: 800 }
}, { _id: false });

const transportRouteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true, default: 'ssm-gorakhpur', index: true },
  routeName: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  driverName: { type: String, required: true },
  driverPhone: { type: String, required: true },
  helperName: { type: String, default: '' },
  capacity: { type: Number, default: 40 },
  stops: [stopSchema],
  status: { type: String, enum: ['Active', 'Maintenance', 'Inactive'], default: 'Active' }
}, {
  timestamps: true
});

transportRouteSchema.index({ schoolId: 1, status: 1 });

module.exports = mongoose.model('TransportRoute', transportRouteSchema);

