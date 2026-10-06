const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1000 }
});

const MongooseCounter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const CounterProxy = new Proxy(MongooseCounter, {
  get(target, prop) {
    const { isUsingLocalDb, getModel } = require('../config/db');
    if (isUsingLocalDb()) {
      const model = getModel('Counter');
      const val = model[prop];
      return typeof val === 'function' ? val.bind(model) : val;
    }
    return target[prop];
  }
});

const getNextSequence = async (sequenceName) => {
  const { isUsingLocalDb, getModel } = require('../config/db');
  if (isUsingLocalDb()) {
    const local = getModel('Counter');
    const doc = await local.findByIdAndUpdate(
      sequenceName,
      { $inc: { seq: 1 } },
      { upsert: true }
    );
    return doc.seq;
  }

  const sequenceDocument = await MongooseCounter.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.seq;
};

module.exports = { Counter: CounterProxy, getNextSequence };
