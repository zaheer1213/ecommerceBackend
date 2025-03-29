const express = require('express');
const router = express.Router();

// Import all routes
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const contactRoutes = require('./contactRoutes');
const cartRoutes = require('./CartRoutes');
const categoryRoutes = require('./categoryRoutes');
const checkoutRoutes = require("./checkoutRoutes");
const reviewRoutes = require("./reviewRoutes");

// Use routes with specific prefixes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/category', categoryRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/contact', contactRoutes);
router.use('/review', reviewRoutes);



module.exports = router;
