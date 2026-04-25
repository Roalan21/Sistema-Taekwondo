const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pago.controller');

router.post('/', ctrl.registrarPagoCompleto);

module.exports = router;