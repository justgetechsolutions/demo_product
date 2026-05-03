const Restaurant = require('../models/Restaurant');

exports.getRestaurantSettings = async(req, res) => {
    try {
        const { restaurantId } = req.params;

        console.log('Fetching settings for restaurantId:', restaurantId);

        let restaurant = await Restaurant.findById(restaurantId);

        console.log('Restaurant found:', !!restaurant);

        if (!restaurant) {
            // If restaurant doesn't exist, return 404
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        // Return settings with default values for fields that might be null/undefined
        const settings = {
            _id: restaurant._id,
            name: restaurant.name || '',
            slug: restaurant.slug || '',
            billingName: restaurant.billingName || '',
            address: restaurant.address || '',
            city: restaurant.city || '',
            postalCode: restaurant.postalCode || '',
            phone: restaurant.phone || '',
            email: restaurant.email || '',
            gstNumber: restaurant.gstNumber || '',
            logoUrl: restaurant.logoUrl || '',
            defaultGstPercentage: restaurant.defaultGstPercentage || 0,
            billFooterMessage: restaurant.billFooterMessage || 'Thank You! Visit Again',
        };

        console.log('Returning settings:', settings);
        res.json(settings);
    } catch (err) {
        console.error('Error fetching restaurant settings:', err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.updateRestaurantSettings = async(req, res) => {
    try {
        const { restaurantId } = req.params;
        const { billingName, address, city, postalCode, phone, email, gstNumber, logoUrl, defaultGstPercentage, billFooterMessage } = req.body;

        console.log('Updating settings for restaurantId:', restaurantId);

        // Build update object with only provided fields
        const updateData = {};
        if (billingName !== undefined) updateData.billingName = billingName;
        if (address !== undefined) updateData.address = address;
        if (city !== undefined) updateData.city = city;
        if (postalCode !== undefined) updateData.postalCode = postalCode;
        if (phone !== undefined) updateData.phone = phone;
        if (email !== undefined) updateData.email = email;
        if (gstNumber !== undefined) updateData.gstNumber = gstNumber;
        if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
        if (defaultGstPercentage !== undefined) updateData.defaultGstPercentage = defaultGstPercentage;
        if (billFooterMessage !== undefined) updateData.billFooterMessage = billFooterMessage;

        console.log('Update data:', updateData);

        const restaurant = await Restaurant.findByIdAndUpdate(
            restaurantId,
            updateData, { new: true }
        );

        if (!restaurant) {
            console.log('Restaurant not found for update');
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        // Return settings with default values
        const settings = {
            _id: restaurant._id,
            name: restaurant.name || '',
            slug: restaurant.slug || '',
            billingName: restaurant.billingName || '',
            address: restaurant.address || '',
            city: restaurant.city || '',
            postalCode: restaurant.postalCode || '',
            phone: restaurant.phone || '',
            email: restaurant.email || '',
            gstNumber: restaurant.gstNumber || '',
            logoUrl: restaurant.logoUrl || '',
            defaultGstPercentage: restaurant.defaultGstPercentage || 0,
            billFooterMessage: restaurant.billFooterMessage || 'Thank You! Visit Again',
        };

        console.log('Settings updated successfully:', settings);
        res.json(settings);
    } catch (err) {
        console.error('Error updating restaurant settings:', err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};