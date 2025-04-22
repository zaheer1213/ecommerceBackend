const Cart = require('../models/Cart')
const Product = require('../models/Product')
const asyncHandler = require('../middlewares/asyncHandler')

// Add to Cart
exports.addToCart = asyncHandler(async (req, res) => {
  try {
    const { userId, productId, quantity, selectedSize } = req.body

    if (!userId || !productId || !quantity || !selectedSize) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    let cart = await Cart.findOne({ userId })

    if (cart) {
      // Check if product already exists in cart with the same size
      const itemIndex = cart.items.findIndex(
        item =>
          item.productId.equals(productId) && item.selectedSize === selectedSize
      )

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity
      } else {
        cart.items.push({ productId, quantity, selectedSize })
      }

      await cart.save()
    } else {
      cart = new Cart({
        userId,
        items: [{ productId, quantity, selectedSize }]
      })

      await cart.save()
    }

    // ✅ Populate productId with full product details before sending response
    const populatedCart = await Cart.findById(cart._id).populate(
      'items.productId'
    )

    res.status(200).json({ message: 'Item added to cart', cart: populatedCart })
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to add item to cart', details: error.message })
  }
})

// Get All Cart Items with Pagination
exports.getAllCartItems = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 10 } = req.query

    const cart = await Cart.findOne({ userId }).populate('items.productId')
    if (!cart) return res.status(404).json({ message: 'Cart not found' })

    // Implement pagination on cart items
    const totalItems = cart.items.length
    const startIndex = (Number(page) - 1) * Number(limit)
    const endIndex = startIndex + Number(limit)

    const paginatedItems = cart.items.slice(startIndex, endIndex)

    res.status(200).json({
      items: paginatedItems,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: Number(page)
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Remove Item from Cart
exports.removeCartItem = asyncHandler(async (req, res) => {
  try {
    const { userId, productId } = req.params
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true }
    )

    if (!cart) return res.status(404).json({ message: 'Cart not found' })

    res.status(200).json({ message: 'Item removed from cart', cart })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update Cart Item
exports.updateCartItem = asyncHandler(async (req, res) => {
  try {
    const { userId, productId } = req.params
    const { quantity } = req.body

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' })
    }

    const cart = await Cart.findOneAndUpdate(
      { userId, 'items.productId': productId },
      { $set: { 'items.$.quantity': quantity } },
      { new: true }
    )

    if (!cart)
      return res.status(404).json({ message: 'Cart or product not found' })

    res.status(200).json({ message: 'Cart item updated successfully', cart })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
