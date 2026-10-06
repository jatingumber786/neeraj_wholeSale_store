const Product = require('../models/Product');

// @desc    Get all products with optional search, category, and status filtering
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status) {
      if (status === 'Out of Stock') {
        query.$or = [{ outOfStock: true }, { stock: { $lte: 0 } }];
      } else if (status === 'Low Stock') {
        query.outOfStock = false;
        query.stock = { $gt: 0, $lt: 10 };
      } else if (status === 'In Stock') {
        query.outOfStock = false;
        query.stock = { $gte: 10 };
      }
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    // Distinct categories for quick filter chips
    const categories = await Product.distinct('category');

    res.status(200).json({
      success: true,
      count: products.length,
      categories: ['All', ...categories],
      products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new product (Dealer only)
// @route   POST /api/products
// @access  Private/Dealer
const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, image, unit, minOrderQty, description, outOfStock } = req.body;

    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, Category, Price, and Stock are required'
      });
    }

    const product = await Product.create({
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      unit: unit || 'Unit',
      minOrderQty: Number(minOrderQty) || 1,
      image: image || undefined,
      description: description || '',
      outOfStock: Boolean(outOfStock) || Number(stock) <= 0
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product details / stock / out-of-stock
// @route   PATCH /api/products/:id
// @access  Private/Dealer
const updateProduct = async (req, res) => {
  try {
    const { name, category, price, stock, image, unit, minOrderQty, description, outOfStock } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) {
      product.stock = Number(stock);
      // Automatically adjust outOfStock if stock hits 0
      if (Number(stock) <= 0) {
        product.outOfStock = true;
      }
    }
    if (image !== undefined) product.image = image;
    if (unit !== undefined) product.unit = unit;
    if (minOrderQty !== undefined) product.minOrderQty = Number(minOrderQty);
    if (description !== undefined) product.description = description;
    if (outOfStock !== undefined) product.outOfStock = Boolean(outOfStock);

    await product.save();

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Dealer
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
