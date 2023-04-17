const express = require('express');
const { 
    loginUser,
    registerUser,
    resetUser,
    updateProfilePic,
    updateUserDetails 
} = require('../controllers/AuthController.js');

const router = express.Router();
router.post('/register', registerUser)
router.post('/login', loginUser)
router.put('/reset', resetUser)
router.put('/updateProfilePic', updateProfilePic)
router.put('/updateUserDetails', updateUserDetails)
module.exports = router