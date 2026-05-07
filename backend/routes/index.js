const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/assessment', require('./assessment'));
router.use('/career', require('./career'));
router.use('/data', require('./data'));
router.use('/crawler', require('./crawler'));

module.exports = router;
