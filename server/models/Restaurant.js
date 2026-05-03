const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    // Billing & Contact Information
    billingName: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    // Default bill settings
    defaultGstPercentage: { type: Number, default: 0 },
    billFooterMessage: { type: String, default: 'Thank You! Visit Again' },
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);