const express = require('express');
const router = express.Router();

const { registrarEntrada } = require('../controllers/inventario.controller');

router.post('/entrada', registrarEntrada);

module.exports = router;