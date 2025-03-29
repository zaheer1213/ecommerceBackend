const Categorys = require("../models/Category");
const path = require('path');
const asyncHandler = require('../middlewares/asyncHandler');

// Create Category 
exports.createCategory = asyncHandler(async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if the image is uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const image = `/uploads/${req.file.filename}`; // Save image URL
    const newCategory = new Categorys({ name, image, description });

    await newCategory.save();

    res.status(201).json({ message: 'Category created successfully', category: newCategory });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category', details: error.message });
  }
});

// Get All Categories with Pagination
exports.getAllCategorys = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const totalCategories = await Categorys.countDocuments();
    const categories = await Categorys.find()
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      categories,
      totalCategories,
      totalPages: Math.ceil(totalCategories / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Error fetching Categories:', error);
    res.status(500).json({ error: 'Failed to fetch Categories' });
  }
});


// Get Category by ID
exports.getCategoryById = asyncHandler(async (req, res) => {
  try {
    const Category = await Categorys.findById(req.params.id);
    if (!Category) return res.status(404).json({ message: 'Category not found' });
    res.json(Category);
  } catch (error) {
    console.error('Error fetching Category:', error);
    res.status(500).json({ error: 'Failed to fetch Category' });
  }
});

// Update Category
exports.updateCategory = asyncHandler(async (req, res) => {
  try {
    let category = await Categorys.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    let updateData = req.body;

    // If an image is uploaded, update the image path and replace backslashes
    if (req.file) {
      updateData.image = req.file.path.replace(/\\/g, "/"); // Convert `\` to `/`
    }

    const updatedCategory = await Categorys.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ message: 'Category updated successfully', category: updatedCategory });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete Category
exports.deleteCategory = asyncHandler(async (req, res) => {
  try {
    const Category = await Categorys.findByIdAndDelete(req.params.id);
    if (!Category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting Category:', error);
    res.status(500).json({ error: 'Failed to delete Category' });
  }
}); 
