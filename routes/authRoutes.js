const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const auth = require('../controllers/authController');

router.post('/register', auth.register);
router.post('/login',    auth.login);
router.get('/me',        protect, auth.getMe);
router.put('/profile',   protect, auth.updateProfile);
router.put('/password',  protect, auth.changePassword);

module.exports = router;