const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, default: 'Unit' },
  subtotal: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    items: [orderItemSchema],
    address: { type: String, required: true },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zip: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'dispatched', 'delivered', 'cancelled'],
      default: 'placed'
    },
    sheetSynced: { type: Boolean, default: false },
    sheetSyncedAt: { type: Date },
    sheetSyncError: { type: String, default: null }
  },
  { timestamps: true }
);

const MongooseOrder = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = new Proxy(MongooseOrder, {
  get(target, prop) {
    const { isUsingLocalDb, getModel } = require('../config/db');
    if (isUsingLocalDb()) {
      const model = getModel('Order');
      const val = model[prop];
      return typeof val === 'function' ? val.bind(model) : val;
    }
    return target[prop];
  }
});
