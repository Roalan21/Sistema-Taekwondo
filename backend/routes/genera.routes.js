const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/genera.controller');

router.post('/', ctrl.registrarGenera);

module.exports = router;