const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

router.post('/add', contactController.createContact);
router.get('/contacts', contactController.getAllContacts);
router.delete('/contact/:id', contactController.deleteContact);

module.exports = router;
