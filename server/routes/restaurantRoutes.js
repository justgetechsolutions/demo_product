const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');

// Get restaurant settings
router.get('/:restaurantId/settings', restaurantController.getRestaurantSettings);

// Update restaurant settings
router.put('/:restaurantId/settings', restaurantController.updateRestaurantSettings);

module.exports = router;