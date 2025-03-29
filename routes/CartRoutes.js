const express = require('express');
const router = express.Router();
const cartController = require('../controllers/CartController');

router.post('/add', cartController.addToCart);
router.get('/:userId', cartController.getAllCartItems);
router.delete('/:userId/:productId', cartController.removeCartItem);
router.put('/:userId/:productId', cartController.updateCartItem);

module.exports = router;
