const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const Table = require('../models/Table');
const Staff = require('../models/Staff');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://tradewithengineer369:tradewithengineer369@cluster0.g7wwwwc.mongodb.net/';

async function migrate() {
  await mongoose.connect(MONGO_URI);
  const restaurants = await Restaurant.find();
  for (const r of restaurants) {
    const filter = { restaurantSlug: r.slug };
    const update = { restaurantId: r._id };
    await MenuItem.updateMany(filter, update);
    await Order.updateMany(filter, update);
    await Table.updateMany(filter, update);
    await Staff.updateMany(filter, update);
    await User.updateMany(filter, update);
    console.log(`Updated documents for restaurant ${r.slug}`);
  }
  await mongoose.disconnect();
  console.log('Migration complete.');
}

migrate(); 