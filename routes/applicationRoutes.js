const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/applicationController');

router.use(protect);

router.get('/export/csv',          c.exportCSV);
router.get('/deadlines/upcoming',  c.upcoming);
router.post('/bulk-delete',        c.bulkDelete);
router.put('/bulk-status',         c.bulkStatus);

router.route('/').get(c.getAll).post(c.create);
router.route('/:id').get(c.getOne).put(c.update).delete(c.remove);
router.post('/:id/timeline',         c.addTimeline);
router.post('/:id/interview-rounds', c.addRound);

module.exports = router;