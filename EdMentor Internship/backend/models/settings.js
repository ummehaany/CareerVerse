const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. "marketplace_settings"
  commissionRate: { type: Number, default: 10, min: 0, max: 100 } // commission percentage
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
