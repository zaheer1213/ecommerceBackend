const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
