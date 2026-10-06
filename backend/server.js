const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const { ensureTodayWorksheet } = require('./config/googleSheets');
const Product = require('./models/Product');
const { Counter } = require('./models/Counter');
const User = require('./models/User');
const { initialProducts } = require('./seeds/seedProducts');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const sheetRoutes = require('./routes/sheetRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sheets', sheetRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Wholesale E-Commerce Ordering API',
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

// Initialize server and database
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database has no products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('No products detected in database. Seeding initial wholesale catalog...');
      await Product.insertMany(initialProducts);

      const counter = await Counter.findById('orderId');
      if (!counter) {
        await Counter.create({ _id: 'orderId', seq: 1000 });
      }

      const dealerEmail = process.env.DEALER_EMAIL || 'dealer@wholesale.com';
      const existingDealer = await User.findOne({ role: 'dealer' });
      if (!existingDealer) {
        await User.create({
          name: 'Jatin Gumber (Dealer)',
          email: dealerEmail,
          phone: '+91 99999 88888',
          role: 'dealer'
        });
      }
      console.log('✓ Initial wholesale products & dealer account ready.');
    }

    // Ensure today's Google Sheet worksheet exists
    try {
      await ensureTodayWorksheet();
    } catch (sheetErr) {
      console.warn('Google Sheet initialization notice:', sheetErr.message);
    }

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Wholesale Ordering API running on http://localhost:${PORT}`);
      console.log(`📡 Google Sheets Integration: Active`);
      console.log(`📦 Catalog Status: ${productCount || initialProducts.length} wholesale products ready`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
