const express = require('express');
const router = express.Router();

const { crearProducto, obtenerProductos, actualizarProducto } = require('../controllers/producto.controller');

router.get('/', obtenerProductos);
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
module.exports = router;