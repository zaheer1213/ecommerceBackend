const express = require('express');
const { register, login, deleteuser, getAllUsers, editUser, getUserById } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/delete/:id', deleteuser);
router.get('/', getAllUsers);
router.put('/:id', editUser);
router.get('/:id', getUserById);



module.exports = router;
