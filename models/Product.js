const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String },
  image: { type: String },
  sizes: [
    {
      size: {
        type: String,
        enum: ['S', 'M', 'L', 'XL', 'XXL'],
        required: true,
      },
      stock: {
        type: Number,
        required: true,
        min: 0,
      }
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
