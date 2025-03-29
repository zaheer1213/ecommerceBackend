const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');

const categoryController = require("../controllers/CategoryController");

router.post('/', upload.single('image'), categoryController.createCategory);
router.get('/', categoryController.getAllCategorys); // Get All Products
router.get('/:id', categoryController.getCategoryById); // Get Product by ID
router.put('/:id', upload.single('image'), categoryController.updateCategory); // Update Product
router.delete('/:id', categoryController.deleteCategory); // Delete Product

module.exports = router;