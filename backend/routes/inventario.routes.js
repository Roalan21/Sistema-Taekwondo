const express = require('express');
const router = express.Router();

const { registrarEntrada,obtenerMovimientos } = require('../controllers/inventario.controller');

router.post('/entrada', registrarEntrada);
router.get('/movimientos', obtenerMovimientos);
module.exports = router;