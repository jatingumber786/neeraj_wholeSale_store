const mongoose = require('mongoose');

let isUsingLocalDb = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (mongoUri && mongoUri.trim() !== '') {
    try {
      console.log('Connecting to MongoDB Atlas cluster...');
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn(`MongoDB Atlas connection failed (${err.message}). Falling back to local embedded store...`);
    }
  }

  // Instant zero-dependency local store fallback
  isUsingLocalDb = true;
  console.log('✓ Local High-Speed Document Store Active (backend/data/local_store.json)');
  console.log('ℹ To connect to live MongoDB Atlas, set MONGO_URI in backend/.env');
};

const getModel = (name) => {
  if (isUsingLocalDb) {
    const local = require('./localDb');
    if (name === 'User') return local.LocalUser;
    if (name === 'Product') return local.LocalProduct;
    if (name === 'Order') return local.LocalOrder;
    if (name === 'Counter') return local.LocalCounter;
  }
  return mongoose.model(name);
};

module.exports = connectDB;
module.exports.getModel = getModel;
module.exports.isUsingLocalDb = () => isUsingLocalDb;
