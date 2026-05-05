const express = require('express');
const router = express.Router();

const { registrarVenta } = require('../controllers/venta.controller');

router.post('/', registrarVenta);

module.exports = router;