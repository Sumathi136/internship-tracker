const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/resumeController');

router.use(protect);
router.get('/',    c.getAll);
router.post('/',   c.upload);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;