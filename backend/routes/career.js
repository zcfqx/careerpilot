const express = require('express');
const router = express.Router();
const careerCtrl = require('../controllers/careerController');
const { authMiddleware } = require('../middleware/auth');

router.post('/generate', authMiddleware, careerCtrl.generateCareer);
router.post('/training', authMiddleware, careerCtrl.generateTraining);
router.get('/training-detail', authMiddleware, careerCtrl.getTrainingDetail);
router.get('/list', authMiddleware, careerCtrl.getPlanList);
router.get('/detail/:id', authMiddleware, careerCtrl.getPlanDetail);

module.exports = router;
