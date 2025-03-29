const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

router.post('/add', reviewController.createReview);
router.get('/reviews/:productId', reviewController.getReviewsByProduct);
router.put('/review/:id', reviewController.updateReview);
router.delete('/review/:id', reviewController.deleteReview);
router.get('/getAllReview', reviewController.getAllReview);

module.exports = router;
