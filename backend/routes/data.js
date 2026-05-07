const express = require('express');
const router = express.Router();
const dataCtrl = require('../controllers/dataController');
const { authMiddleware } = require('../middleware/auth');

router.get('/overview', authMiddleware, dataCtrl.getOverview);
router.get('/trend', authMiddleware, dataCtrl.getTrend);
router.get('/skill-cloud', authMiddleware, dataCtrl.getSkillCloud);
router.get('/radar', authMiddleware, dataCtrl.getRadar);
router.get('/jobs', authMiddleware, dataCtrl.getJobList);

module.exports = router;
