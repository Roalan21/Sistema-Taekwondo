const express = require('express');
const router = express.Router();

const { crearProducto, obtenerProductos } = require('../controllers/producto.controller');

router.get('/', obtenerProductos);
router.post('/', crearProducto);

module.exports = router;