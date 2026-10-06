const Order = require('../models/Order');
const Product = require('../models/Product');
const { getNextSequence } = require('../models/Counter');
const { appendOrderToSheet, getTodaySheetTitle } = require('../config/googleSheets');

// @desc    Place a wholesale order
// @route   POST /api/orders
// @access  Public / Private
const placeOrder = async (req, res) => {
  try {
    const { customerName, customerPhone, items, address, city, state, zip } = req.body;

    if (!customerName || !customerPhone || !items || !items.length || !address || !zip) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customer name, phone, delivery address, ZIP, and at least one item'
      });
    }

    // 1. Validate Stock and Out-of-stock status for every item
    const orderItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId || item._id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product "${item.name || 'Unknown'}" not found in catalog`
        });
      }

      if (product.outOfStock || product.stock <= 0) {
        return res.status(400).json({
          success: false,
          message: `Item "${product.name}" is currently Out of Stock!`
        });
      }

      const qty = Number(item.quantity);
      if (qty <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for item "${product.name}"`
        });
      }

      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${qty}`
        });
      }

      const subtotal = product.price * qty;
      calculatedTotal += subtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: qty,
        unit: product.unit || 'Unit',
        subtotal
      });
    }

    // 2. Generate Sequential Order ID (e.g. 1001, 1002...)
    const nextSeq = await getNextSequence('orderId');
    const orderId = String(nextSeq);

    // 3. Deduct stock atomically and update outOfStock flag if 0
    for (const orderItem of orderItems) {
      const prod = await Product.findById(orderItem.product);
      prod.stock = Math.max(0, prod.stock - orderItem.quantity);
      if (prod.stock === 0) {
        prod.outOfStock = true;
      }
      await prod.save();
    }

    // 4. Save Order to MongoDB
    const newOrder = await Order.create({
      orderId,
      customerId: req.user ? req.user._id : undefined,
      customerName,
      customerPhone,
      items: orderItems,
      address,
      city: city || '',
      state: state || '',
      zip,
      totalAmount: calculatedTotal,
      status: 'placed'
    });

    // 5. Instantly Append to Google Sheet (and auto-create today's sheet if first order of the day)
    let sheetResult = { live: false, sheetTitle: getTodaySheetTitle() };
    try {
      sheetResult = await appendOrderToSheet(newOrder);
      newOrder.sheetSynced = sheetResult.success;
      newOrder.sheetSyncedAt = new Date();
      if (sheetResult.error) {
        newOrder.sheetSyncError = sheetResult.error;
      }
      await newOrder.save();
    } catch (sheetErr) {
      console.error('Google Sheets sync error on order placement:', sheetErr.message);
      newOrder.sheetSyncError = sheetErr.message;
      await newOrder.save();
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully and recorded!',
      order: newOrder,
      googleSheet: {
        synced: newOrder.sheetSynced,
        live: sheetResult.live,
        sheetTitle: sheetResult.sheetTitle
      }
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Today's Orders (Dealer)
// @route   GET /api/orders/today
// @access  Private/Dealer
const getTodayOrders = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ createdAt: -1 });

    const totalTodayRevenue = orders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);

    res.status(200).json({
      success: true,
      dateTitle: getTodaySheetTitle(),
      count: orders.length,
      totalRevenue: totalTodayRevenue,
      orders
    });
  } catch (error) {
    console.error("Error fetching today's orders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Customer's previous orders
// @route   GET /api/orders/my-orders
// @access  Public / Private (by customerId or phone)
const getMyOrders = async (req, res) => {
  try {
    const { phone } = req.query;
    let query = {};

    if (req.user) {
      query.$or = [{ customerId: req.user._id }, { customerPhone: req.user.phone }];
    } else if (phone) {
      query.customerPhone = phone;
    } else {
      return res.status(400).json({ success: false, message: 'Please provide phone or log in' });
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Dealer Dashboard Statistics
// @route   GET /api/orders/stats
// @access  Private/Dealer
const getDealerStats = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayOrdersCount = await Order.countDocuments({ createdAt: { $gte: startOfDay } });
    const todayOrders = await Order.find({ createdAt: { $gte: startOfDay } });
    const todayRevenue = todayOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    const totalProducts = await Product.countDocuments();
    const inStock = await Product.countDocuments({ outOfStock: false, stock: { $gte: 10 } });
    const lowStock = await Product.countDocuments({ outOfStock: false, stock: { $gt: 0, $lt: 10 } });
    const outOfStock = await Product.countDocuments({ $or: [{ outOfStock: true }, { stock: { $lte: 0 } }] });

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10);

    res.status(200).json({
      success: true,
      today: {
        orderCount: todayOrdersCount,
        revenue: todayRevenue,
        sheetTitle: getTodaySheetTitle()
      },
      inventory: {
        total: totalProducts,
        inStock,
        lowStock,
        outOfStock
      },
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching dealer stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  placeOrder,
  getTodayOrders,
  getMyOrders,
  getDealerStats
};
