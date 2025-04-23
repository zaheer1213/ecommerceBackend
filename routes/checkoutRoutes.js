const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/CheckoutController');

// User Routes
router.post('/', checkoutController.createCheckout);
router.get('/:userId', checkoutController.getUserCheckout);

// Admin Routes
router.get('/', checkoutController.getAllCheckouts);
router.put('/:checkoutId', checkoutController.updateCheckoutStatus);
router.delete('/:checkoutId', checkoutController.deleteCheckout);
router.post('/payment-success', checkoutController.paymentSccess);

module.exports = router;
