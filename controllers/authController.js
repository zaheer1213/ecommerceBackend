const asyncHandler = require('../middlewares/asyncHandler')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.register = asyncHandler(async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role
    })

    // Generate JWT token after successful registration
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Registration failed',error })
  }
})

exports.login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) return res.status(400).json({ error: 'Invalid credentials' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' })

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role // Include role in response
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Login failed' })
  }
})

exports.editUser = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id
    const updatedData = req.body // Data to update

    const updatedUser = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true
    })

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' }) // Use 404 for missing user
    }

    res.json({ message: 'User updated successfully', data: updatedUser })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Update failed' })
  }
})

exports.deleteuser = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id
    const deleteuserbyId = await User.findByIdAndDelete(id)

    if (!deleteuserbyId) {
      return res.status(404).json({ message: 'User not found' }) // Use 404 for missing user
    }

    res.json({ message: 'User deleted successfully', data: deleteuserbyId })
  } catch (error) {
    console.error('Error deleting user:', error) // Log error for debugging
    res.status(500).json({ error: 'Delete failed' })
  }
})

exports.getAllUsers = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query // Default to page 1, limit 10 users per page
    const skip = (Number(page) - 1) * Number(limit)

    // Fetch users with pagination
    const users = await User.find().skip(skip).limit(Number(limit))

    // Get total users for pagination info
    const totalUsers = await User.countDocuments()

    res.status(200).json({
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: Number(page)
    })
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to fetch users', details: error.message })
  }
})

exports.getUserById = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id

    const updatedUser = await User.findById(id)

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' }) // Use 404 for missing user
    }

    res.json({ data: updatedUser })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'somthing went wrong' })
  }
})
