const Review = require('../models/Review');
const asyncHandler = require('../middlewares/asyncHandler');

// Create a Review
exports.createReview = asyncHandler(async (req, res) => {
    try {
        const { productId, name, email, rating, review } = req.body;
        const newReview = new Review({ productId, name, email, rating, review });
        await newReview.save();
        res.status(201).json({ message: 'Review submitted successfully', review: newReview });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit review', details: error.message });
    }
});

// Get All Reviews for a Product
exports.getReviewsByProduct = asyncHandler(async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews', details: error.message });
    }
});

// Update a Review
// Update a Review
exports.updateReview = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the review exists before updating
        const existingReview = await Review.findById(id);
        if (!existingReview) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // Update review
        const updatedReview = await Review.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true, // Ensure validations are applied
        });

        if (!updatedReview) {
            return res.status(400).json({ error: 'Failed to update review' });
        }

        res.status(200).json({ message: 'Review updated successfully', review: updatedReview });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ error: 'Failed to update review', details: error.message });
    }
});


// Delete a Review
exports.deleteReview = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        await Review.findByIdAndDelete(id);
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete review', details: error.message });
    }
});

// Show All Reviews with Pagination
exports.getAllReview = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const totalReviews = await Review.countDocuments();
        const reviews = await Review.find()
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.status(200).json({
            reviews,
            totalReviews,
            totalPages: Math.ceil(totalReviews / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews', details: error.message });
    }
});

