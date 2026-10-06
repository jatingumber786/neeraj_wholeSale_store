const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Customer' },
    email: { type: String, sparse: true },
    phone: { type: String, sparse: true },
    role: { type: String, enum: ['customer', 'dealer'], default: 'customer' },
    firebaseUid: { type: String, sparse: true },
    addresses: [addressSchema]
  },
  { timestamps: true }
);

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = new Proxy(MongooseUser, {
  get(target, prop) {
    const { isUsingLocalDb, getModel } = require('../config/db');
    if (isUsingLocalDb()) {
      const model = getModel('User');
      const val = model[prop];
      return typeof val === 'function' ? val.bind(model) : val;
    }
    return target[prop];
  }
});
