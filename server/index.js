const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./utils/db');
const categoryRoutes = require('./routes/categoryRoutes');
const menuItemRoutes = require('./routes/menuItemRoutes');
const tableRoutes = require('./routes/tableRoutes');
const staffRoutes = require('./routes/staffRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const staffAuthRoutes = require('./routes/staffAuthRoutes');
const kitchenRoutes = require('./routes/kitchenRoutes');
const path = require('path');
const Restaurant = require('./models/Restaurant');
const menuItemController = require('./controllers/menuItemController');
const feedbackRoutes = require('./routes/feedbackRoutes');
const commentRoutes = require('./routes/commentRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('Created uploads directory');
}

dotenv.config();

const app = express();
app.use(cookieParser());
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

// CORS configuration for both development and production
const allowedOrigins = [
  'http://localhost:3000',
  'https://qr-ordering-beryl.vercel.app',
  // 'https://hearings-lane-part-casio.trycloudflare.com',
  'https://creations-mins-exception-roots.trycloudflare.com',
  'https://qr-ordering-crbq.onrender.com',
  'https://yourhotelmenu.ngrok.io', // Ngrok frontend domain
  'https://backend.hotel.com'       // Cloudflare backend domain
];

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});

// Enhanced Socket.io connection for real-time order updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join restaurant room for real-time updates
  socket.on('joinRestaurant', (restaurantId) => {
    socket.join(`restaurant_${restaurantId}`);
    console.log(`Client ${socket.id} joined restaurant ${restaurantId}`);
  });

  // Join kitchen room for kitchen staff
  socket.on('joinKitchen', (restaurantId) => {
    socket.join(`kitchen_${restaurantId}`);
    console.log(`Kitchen staff ${socket.id} joined kitchen ${restaurantId}`);
  });

  // Handle order status updates
  socket.on('orderStatusUpdate', (data) => {
    socket.to(`restaurant_${data.restaurantId}`).emit('orderStatusUpdated', data);
    socket.to(`kitchen_${data.restaurantId}`).emit('orderStatusUpdated', data);
  });

  // Handle new orders
  socket.on('newOrder', (data) => {
    socket.to(`restaurant_${data.restaurantId}`).emit('newOrderReceived', data);
    socket.to(`kitchen_${data.restaurantId}`).emit('newOrderReceived', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available in controllers via req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Connect to MongoDB
connectDB().catch(err => {
  console.error('DB connection error:', err);
  process.exit(1);
});

// Root route
app.get('/', (req, res) => {
  res.send('CoptOfRestorent API is running');
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/restaurants/:restaurantId/orders', orderRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurants/:restaurantId/categories', categoryRoutes);
app.use('/api/restaurants/:restaurantId/menu', menuItemRoutes);
app.use('/admin/:restaurantId/menu', menuItemRoutes); // Admin menu endpoint
app.use('/api/restaurants/:restaurantId/tables', tableRoutes);
app.use('/api/restaurants/:restaurantId/orders', orderRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/staff-auth', staffAuthRoutes); // New staff authentication routes
app.use('/api/kitchen', kitchenRoutes); // New kitchen management routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Register public menu route for QR code users
app.get('/api/restaurants/menu/public/:restaurantId', menuItemController.listMenuItemsPublic);

// Legacy public QR URL: /r/:restaurantSlug/menu/:tableNumber
app.get('/r/:restaurantSlug/menu/:tableNumber', async (req, res, next) => {
  try {
    const { restaurantSlug, tableNumber } = req.params;
    const restaurant = await Restaurant.findOne({ slug: restaurantSlug });
    if (!restaurant) return res.status(404).send('Restaurant not found');
    // Optionally, add slug for SEO: /r/:restaurantId-:slug/menu/:tableNumber
    return res.redirect(301, `/r/${restaurant._id}-${restaurant.slug}/menu/${tableNumber}`);
  } catch (err) {
    next(err);
  }
});

// Legacy admin URL: /admin/:restaurantSlug/* → /admin/:restaurantId/*
app.get(/^\/admin\/([^\/]+)\/(.*)/, async (req, res, next) => {
  try {
    const restaurantSlug = req.params[0];
    const subpath = req.params[1] ? '/' + req.params[1] : '';
    const restaurant = await Restaurant.findOne({ slug: restaurantSlug });
    if (!restaurant) return res.status(404).send('Restaurant not found');
    return res.redirect(301, `/admin/${restaurant._id}${subpath}`);
  } catch (err) {
    next(err);
  }
});

// Legacy API: /api/:resource/:restaurantSlug → /api/restaurants/:restaurantId/:resource
const legacyApiResources = ['menu', 'tables', 'orders', 'categories'];
legacyApiResources.forEach(resource => {
  app.all(new RegExp(`^/api/${resource}/([^/]+)/(.*)`), async (req, res, next) => {
    try {
      const restaurantSlug = req.params[0];
      const subpath = req.params[1] ? '/' + req.params[1] : '';
      const restaurant = await Restaurant.findOne({ slug: restaurantSlug });
      if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
      return res.redirect(301, `/api/restaurants/${restaurant._id}/${resource}${subpath}`);
    } catch (err) {
      next(err);
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 