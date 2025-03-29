const Contact = require('../models/Contact');
const asyncHandler = require('../middlewares/asyncHandler');

// Save Contact
exports.createContact = asyncHandler(async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();
    res.status(201).json({ message: 'Contact saved successfully', contact: newContact });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save contact', details: error.message });
  }
});

// Show All Contacts with Pagination
exports.getAllContacts = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const totalContacts = await Contact.countDocuments();
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      contacts,
      totalContacts,
      totalPages: Math.ceil(totalContacts / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts', details: error.message });
  }
});


// Delete Contact
exports.deleteContact = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact', details: error.message });
  }
}); 
