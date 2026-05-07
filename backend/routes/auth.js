const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/login', authCtrl.login);
router.put('/profile', authMiddleware, authCtrl.updateProfile);
router.get('/info', authMiddleware, authCtrl.getUserInfo);

module.exports = router;
