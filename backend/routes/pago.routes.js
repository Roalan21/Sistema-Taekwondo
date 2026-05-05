const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pago.controller');
const { registrarPagoCompleto } = require('../controllers/pago.controller');
router.post('/', ctrl.registrarPagoCompleto);
router.post('/pago-completo', registrarPagoCompleto);

module.exports = router;