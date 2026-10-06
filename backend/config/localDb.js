const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(__dirname, '..', 'data', 'local_store.json');

// Ensure data folder exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

class LocalCollection {
  constructor(name) {
    this.name = name;
  }

  _readAll() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const db = JSON.parse(raw);
        return db[this.name] || [];
      }
    } catch (e) {
      console.warn(`Error reading local db for ${this.name}:`, e.message);
    }
    return [];
  }

  _writeAll(items) {
    let db = {};
    try {
      if (fs.existsSync(DB_FILE)) {
        db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      }
    } catch (e) {
      db = {};
    }
    db[this.name] = items;
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  }

  find(query = {}) {
    let items = this._readAll();

    // Filtering logic
    if (Object.keys(query).length > 0) {
      items = items.filter((item) => {
        for (const [key, val] of Object.entries(query)) {
          if (key === '$or' && Array.isArray(val)) {
            const matchAny = val.some((subQuery) => {
              return Object.entries(subQuery).every(([subKey, subVal]) => {
                if (subVal && typeof subVal === 'object' && subVal.$regex) {
                  const reg = new RegExp(subVal.$regex, subVal.$options || '');
                  return reg.test(item[subKey] || '');
                }
                if (subVal && typeof subVal === 'object' && subVal.$lte !== undefined) {
                  return (item[subKey] || 0) <= subVal.$lte;
                }
                return item[subKey] === subVal;
              });
            });
            if (!matchAny) return false;
            continue;
          }

          if (val && typeof val === 'object') {
            if (val.$regex) {
              const reg = new RegExp(val.$regex, val.$options || '');
              if (!reg.test(item[key] || '')) return false;
            }
            if (val.$gte !== undefined && (item[key] || 0) < val.$gte) return false;
            if (val.$gt !== undefined && (item[key] || 0) <= val.$gt) return false;
            if (val.$lt !== undefined && (item[key] || 0) >= val.$lt) return false;
            if (val.$lte !== undefined && (item[key] || 0) > val.$lte) return false;
          } else if (item[key] !== val) {
            return false;
          }
        }
        return true;
      });
    }

    // Return wrap object supporting .sort() and .limit()
    const resultObj = {
      _data: items,
      sort: (sortObj = {}) => {
        if (sortObj.createdAt === -1) {
          resultObj._data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return resultObj;
      },
      limit: (n) => {
        resultObj._data = resultObj._data.slice(0, n);
        return resultObj._data;
      },
      then: (resolve, reject) => {
        try {
          resolve(resultObj._data.map(item => wrapDocument(this, item)));
        } catch (e) {
          reject(e);
        }
      }
    };

    return resultObj;
  }

  async findOne(query = {}) {
    const list = await this.find(query);
    return list[0] || null;
  }

  async findById(id) {
    if (!id) return null;
    const items = this._readAll();
    const item = items.find((it) => it._id === id || it._id === String(id));
    return item ? wrapDocument(this, item) : null;
  }

  async create(data) {
    const items = this._readAll();
    const doc = {
      _id: data._id || crypto.randomUUID().replace(/-/g, '').slice(0, 24),
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(doc);
    this._writeAll(items);
    return wrapDocument(this, doc);
  }

  async insertMany(list) {
    const docs = [];
    for (const it of list) {
      docs.push(await this.create(it));
    }
    return docs;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const items = this._readAll();
    let index = items.findIndex((it) => it._id === id);

    if (index === -1) {
      if (options.upsert) {
        const newDoc = {
          _id: id,
          seq: 1000,
          ...update.$inc ? { seq: 1000 + (update.$inc.seq || 0) } : update,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        items.push(newDoc);
        this._writeAll(items);
        return wrapDocument(this, newDoc);
      }
      return null;
    }

    let item = items[index];
    if (update.$inc) {
      for (const [k, v] of Object.entries(update.$inc)) {
        item[k] = (item[k] || 0) + v;
      }
    }
    if (update.$set) {
      Object.assign(item, update.$set);
    }
    Object.assign(item, { ...update, updatedAt: new Date().toISOString() });
    delete item.$inc;
    delete item.$set;

    items[index] = item;
    this._writeAll(items);
    return wrapDocument(this, item);
  }

  async findByIdAndDelete(id) {
    let items = this._readAll();
    const filtered = items.filter((it) => it._id !== id);
    this._writeAll(filtered);
    return true;
  }

  async countDocuments(query = {}) {
    const res = await this.find(query);
    return res.length;
  }

  async distinct(field) {
    const items = this._readAll();
    const values = new Set();
    items.forEach((it) => {
      if (it[field]) values.add(it[field]);
    });
    return Array.from(values);
  }

  async deleteMany() {
    this._writeAll([]);
    return true;
  }
}

function wrapDocument(collection, raw) {
  const doc = { ...raw };
  doc.save = async function () {
    const items = collection._readAll();
    const idx = items.findIndex((it) => it._id === doc._id);
    doc.updatedAt = new Date().toISOString();
    if (idx !== -1) {
      items[idx] = { ...doc };
    } else {
      items.push({ ...doc });
    }
    collection._writeAll(items);
    return doc;
  };
  doc.select = function() { return doc; };
  return doc;
}

module.exports = {
  LocalUser: new LocalCollection('users'),
  LocalProduct: new LocalCollection('products'),
  LocalOrder: new LocalCollection('orders'),
  LocalCounter: new LocalCollection('counters')
};
