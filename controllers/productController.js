const asyncHandler = require('../middlewares/asyncHandler')
const Product = require('../models/Product')
const mongoose = require('mongoose')

// Create a New Product
exports.createProduct = asyncHandler(async (req, res) => {
  try {
    const { name, price, category, description, sizes } = req.body

    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' })
    }

    const image = `/uploads/${req.file.filename}`

    // Validate ObjectId for category
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ error: 'Invalid Category ID' })
    }

    const newProduct = new Product({
      name,
      price,
      category: new mongoose.Types.ObjectId(category), // Convert to ObjectId
      description,
      sizes: JSON.parse(sizes),
      image
    })

    await newProduct.save()
    res
      .status(201)
      .json({ message: 'Product created successfully', product: newProduct })
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to create product', details: error.message })
  }
})

// Get All Products with Pagination
exports.getAllProducts = asyncHandler(async (req, res) => {
  try {
    // Extract page and limit from query params (default to page 1 and limit 10)
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit

    // Fetch products with pagination
    const products = await Product.find().skip(skip).limit(limit)

    // Get total product count for pagination info
    const totalProducts = await Product.countDocuments()

    res.json({
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      products
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// Get Product by ID
exports.getProductById = asyncHandler(async (req, res) => {
  try {
    // Populate the 'category' field to get the full category details
    const product = await Product.findById(req.params.id).populate('category')

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// Update Product API
exports.updateProduct = asyncHandler(async (req, res) => {
  try {
    // Check if the product exists
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    let updateData = req.body
    // If sizes is sent as a string, parse it into an array
    if (req.body.sizes && typeof req.body.sizes === 'string') {
      try {
        updateData.sizes = JSON.parse(req.body.sizes) // Convert JSON string to array
      } catch (error) {
        return res.status(400).json({ error: 'Invalid sizes format' })
      }
    }

    // If an image is uploaded, update the image path
    if (req.file) {
      updateData.image = req.file.path
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    })
  } catch (error) {
    console.error('Error updating product:', error)
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// Delete Product
exports.deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

exports.getAllProductsByCategory = asyncHandler(async (req, res) => {
  try {
    const { categoryId } = req.params
    const page = parseInt(req.query.page) || 1 // Default to page 1
    const limit = parseInt(req.query.limit) || 10 // Default limit 10
    const skip = (page - 1) * limit

    const total = await Product.countDocuments({ category: categoryId })
    const products = await Product.find({ category: categoryId })
      .populate('category')
      .skip(skip)
      .limit(limit)
      .select('-__v')

    res.status(200).json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      products
    })
  } catch (error) {
    console.error('Error fetching products by category:', error)
    res.status(500).json({ message: 'Server error' })
  }
})
