const mongoose = require('mongoose');

const CheckoutSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        selectedSize: { 
          type: String,
          required: true,
          enum: ['S', 'M', 'L', 'XL', 'XXL'] // Assuming standard sizes
        }
      }
    ],

    totalAmount: { type: Number, required: true },

    shippingMethod: {
      type: String,
      enum: ['Flat rate', 'Local pickup'],
      required: true
    },

    paymentMethod: {
      type: String,
      enum: ['CASH ON DELIVERY', 'UPI'],
      required: true
    },

    address: {
      fullName: { type: String, required: true, trim: true },
      streetAddress: { type: String, required: true, trim: true },
      apartment: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      zip: { type: String, required: true, trim: true },
      orderNotes: { type: String, trim: true }
    },

    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },

    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled'],
      default: 'Pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Checkout', CheckoutSchema);
