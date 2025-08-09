const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qr_ordering';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Function to generate sequential token number for orders
const generateOrderToken = async (restaurantId) => {
  try {
    // Import Order model to ensure it's available
    const Order = require('../models/Order');
    
    console.log('Looking for last order with restaurantId:', restaurantId);
    
    // Find the highest token number for this restaurant
    const lastOrder = await Order.findOne(
      { restaurantId },
      { token: 1 },
      { sort: { token: -1 } }
    );
    
    console.log('Last order found:', lastOrder);
    
    // Start from 1 if no orders exist, otherwise increment the last token
    let nextToken;
    if (!lastOrder || !lastOrder.token || isNaN(lastOrder.token)) {
      nextToken = 1;
      console.log('No previous orders or invalid token, starting with:', nextToken);
    } else {
      nextToken = lastOrder.token + 1;
      console.log('Incrementing from last token:', lastOrder.token, 'to:', nextToken);
    }
    
    return nextToken;
  } catch (error) {
    console.error('Error generating order token:', error);
    // Fallback: use timestamp as token
    return Math.floor(Date.now() / 1000);
  }
};

// Script to drop the old unique index on tableNumber (run once, then remove)
if (require.main === module) {
  const Table = require('../models/Table');
  (async () => {
    await connectDB();
    try {
      const result = await Table.collection.dropIndex('tableNumber_1');
      console.log('Dropped index:', result);
    } catch (err) {
      console.error('Error dropping index:', err.message);
    } finally {
      process.exit(0);
    }
  })();
}

module.exports = { connectDB, generateOrderToken }; 