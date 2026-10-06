const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, default: 'Unit', trim: true },
    minOrderQty: { type: Number, default: 1, min: 1 },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
    },
    outOfStock: { type: Boolean, default: false },
    description: { type: String, default: '' }
  },
  { timestamps: true }
);

const MongooseProduct = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = new Proxy(MongooseProduct, {
  get(target, prop) {
    const { isUsingLocalDb, getModel } = require('../config/db');
    if (isUsingLocalDb()) {
      const model = getModel('Product');
      const val = model[prop];
      return typeof val === 'function' ? val.bind(model) : val;
    }
    return target[prop];
  }
});
