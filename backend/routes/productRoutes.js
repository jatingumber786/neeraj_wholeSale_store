const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, dealerOnly } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, dealerOnly, createProduct);
router.patch('/:id', protect, dealerOnly, updateProduct);
router.delete('/:id', protect, dealerOnly, deleteProduct);

module.exports = router;
