const Razorpay = require('razorpay')
const nodemailer = require('nodemailer')
const Checkout = require('../models/Checkout')
const Cart = require('../models/Cart')
require('dotenv').config()
const asyncHandler = require('../middlewares/asyncHandler')

// Initialize Razorpay
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASSWORD
  }
})

// Send Email Function
const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.ADMIN_EMAIL,
    to,
    subject,
    text
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(`Error sending email: ${error}`)
    } else {
      console.log(`Email sent: ${info.response}`)
    }
  })
}

// Create Checkout and Generate Razorpay Order
exports.createCheckout = asyncHandler(async (req, res) => {
  try {
    const {
      userId,
      address,
      shippingMethod,
      paymentMethod,
      email,
      phone,
      status
    } = req.body
    const customerName = address.fullName

    // Validate Cart
    const cart = await Cart.findOne({ userId }).populate('items.productId')
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' })
    }

    // Calculate Total Amount
    const totalAmount = cart.items.reduce((acc, item) => {
      return acc + item.productId.price * item.quantity
    }, 0)

    // Transform Data to Match Schema
    const checkoutData = {
      userId,
      items: cart.items,
      totalAmount,
      shippingMethod,
      paymentMethod,
      address: {
        fullName: address.fullName,
        streetAddress: address.streetAddress,
        city: address.city,
        zip: address.zip,
        orderNotes: address.orderNotes
      },
      phone: phone,
      email: email,
      status: status
    }

    const newCheckout = new Checkout(checkoutData)
    await newCheckout.save()

    // Razorpay Payment for UPI
    if (paymentMethod === 'UPI') {
      const order = await razorpayInstance.orders.create({
        amount: totalAmount * 100,
        currency: 'INR',
        receipt: `receipt_${newCheckout._id}`
      })

      // Save Razorpay Order ID to your checkout document
      newCheckout.razorpayOrderId = order.id
      await newCheckout.save()
      // Send Email to Admin
      sendEmail(
        process.env.ADMIN_EMAIL,
        'New Order Received - GetTrendy',
        `A new order has been placed with Order ID: ${newCheckout._id}.
                Customer Name: ${customerName}
                Total Amount: ₹${totalAmount}`
      )

      // Send Email to User
      sendEmail(
        email,
        'Order Confirmation - GetTrendy',
        `Hi ${customerName},

Thank you for choosing GetTrendy!

We are excited to let you know that your order (ID: ${newCheckout._id}) has been received and is being processed by our team. Your order will be delivered within 2 to 3 working days.

**Order Details:**  
- Total Amount: ₹${totalAmount}
- Payment Method: ${paymentMethod}
- Shipping Address: ${address.fullName}, ${address.streetAddress}, ${address.city}, ${address.zip}

If you have any questions, feel free to contact us.

Thank you once again for shopping with GetTrendy!  
Best Regards,  
**GetTrendy Team**  
`
      )
      return res.status(201).json({
        message: 'Checkout successful. Proceed to payment',
        checkout: newCheckout,
        order
      })
    }

    // Clear Cart for Cash on Delivery
    await Cart.deleteOne({ userId })

    // Send Email for COD Orders
    sendEmail(
      process.env.ADMIN_EMAIL,
      'New COD Order - GetTrendy',
      `Dear Team,
        
        A new order has been placed on Get Trendy. Please find the order details below:
        
        Order ID: ${newCheckout._id}  
        Customer Name: ${customerName}  
        Total Amount: ₹${totalAmount}  
        
        Please process this order at the earliest. Let’s ensure a smooth and timely fulfillment for our customer.
        
        Best,  
        Get Trendy Order System`
    )

    sendEmail(
      email,
      'Order Confirmation - GetTrendy',
      `Hi ${customerName},

Thank you for choosing GetTrendy!

We are excited to let you know that your order (ID: ${newCheckout._id}) has been received and is being processed by our team. Your order will be delivered within 2 to 3 working days.

**Order Details:**  
- Total Amount: ₹${totalAmount}
- Payment Method: ${paymentMethod}
- Shipping Address: ${address.fullName}, ${address.streetAddress}, ${address.city}, ${address.zip}

If you have any questions, feel free to contact us.

Thank you once again for shopping with GetTrendy!  
Best Regards,  
**GetTrendy Team**  
`
    )

    res.status(201).json({
      message: 'Checkout successful without payment',
      checkout: newCheckout
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Checkout failed', details: error.message })
  }
})

// exports.createCheckout = async (req, res) => {
//     try {
//         const { userId, address, shippingMethod, paymentMethod } = req.body;

//         const cart = await Cart.findOne({ userId }).populate('items.productId');

//         if (!cart || cart.items.length === 0) {
//             return res.status(400).json({ error: 'Cart is empty' });
//         }

//         const totalAmount = cart.items.reduce((acc, item) => {
//             return acc + item.productId.price * item.quantity;
//         }, 0);

//         const checkoutData = {
//             userId,
//             items: cart.items,
//             totalAmount,
//             shippingMethod,
//             paymentMethod,
//             address
//         };

//         const newCheckout = new Checkout(checkoutData);
//         await newCheckout.save();

//         // Clear Cart after Checkout
//         await Cart.deleteOne({ userId });

//         res.status(201).json({ message: 'Checkout successful', checkout: newCheckout });
//     } catch (error) {
//         res.status(500).json({ error: 'Checkout failed', details: error.message });
//     }
// };

// Get Checkout by User
exports.getUserCheckout = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params
    const checkout = await Checkout.find({ userId }).populate('items.productId')
    res.status(200).json({ checkout })
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to get checkout details', details: error.message })
  }
})

// Get All Checkouts
exports.getAllCheckouts = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query // Default to page 1, 10 results per page
    const skip = (Number(page) - 1) * Number(limit)

    // Fetch checkouts with pagination
    const checkouts = await Checkout.find()
      .populate('userId')
      .populate('items.productId')
      .skip(skip)
      .limit(Number(limit))

    // Total checkouts count for pagination info
    const totalCheckouts = await Checkout.countDocuments()

    res.status(200).json({
      checkouts,
      totalCheckouts,
      totalPages: Math.ceil(totalCheckouts / limit),
      currentPage: Number(page)
    })
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to fetch all checkouts', details: error.message })
  }
})

//   Update Checkout Status
exports.updateCheckoutStatus = asyncHandler(async (req, res) => {
  try {
    const { checkoutId } = req.params
    const { status } = req.body

    const checkout = await Checkout.findByIdAndUpdate(
      checkoutId,
      { status },
      { new: true }
    )

    if (!checkout) {
      return res.status(404).json({ error: 'Checkout not found' })
    }

    res.status(200).json({ message: 'Checkout status updated', checkout })
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to update status', details: error.message })
  }
})

//  Delete Checkout
exports.deleteCheckout = asyncHandler(async (req, res) => {
  try {
    const { checkoutId } = req.params

    const checkout = await Checkout.findByIdAndDelete(checkoutId)

    if (!checkout) {
      return res.status(404).json({ error: 'Checkout not found' })
    }

    res.status(200).json({ message: 'Checkout deleted successfully' })
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to delete checkout', details: error.message })
  }
})

// payment-success
exports.paymentSccess = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id } = req.body

  const checkout = await Checkout.findOne({
    razorpayOrderId: razorpay_order_id
  })
  if (!checkout) {
    return res.status(404).json({ error: 'Order not found' })
  }

  // Update checkout payment status
  checkout.razorpayPaymentId = razorpay_payment_id
  checkout.paymentStatus = 'Paid'
  await checkout.save()

  // Clear user's cart
  await Cart.deleteOne({ userId: checkout.userId })

  res.status(200).json({ message: 'Payment successful and cart cleared.' })
})
