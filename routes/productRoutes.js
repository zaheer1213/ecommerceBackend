const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../config/multerConfig');

// Product Routes
router.post('/', upload.single('image'), productController.createProduct); // Create Product
router.get('/', productController.getAllProducts); // Get All Products
router.get('/:id', productController.getProductById); // Get Product by ID
router.put('/:id', upload.single('image'), productController.updateProduct); // Update Product
router.delete('/:id', productController.deleteProduct); // Delete Product

module.exports = router;
