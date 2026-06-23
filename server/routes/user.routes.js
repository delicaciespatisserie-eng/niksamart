const express = require('express');
const {
    getProfile,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    changePassword,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // Protect all user routes

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/addresses', addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);
router.put('/change-password', changePassword);

module.exports = router;
