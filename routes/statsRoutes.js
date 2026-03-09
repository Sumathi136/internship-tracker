const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { overview } = require('../controllers/statsController');

router.use(protect);
router.get('/overview', overview);

module.exports = router;