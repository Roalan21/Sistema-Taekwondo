const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/metodoPago.controller');

router.get('/', ctrl.obtenerMetodos);

module.exports = router;