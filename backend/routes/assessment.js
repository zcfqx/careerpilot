const express = require('express');
const router = express.Router();
const assessmentCtrl = require('../controllers/assessmentController');
const { authMiddleware } = require('../middleware/auth');

router.post('/submit', authMiddleware, assessmentCtrl.submitAssessment);
router.get('/history', authMiddleware, assessmentCtrl.getHistory);
router.get('/:id', authMiddleware, assessmentCtrl.getDetail);

module.exports = router;
