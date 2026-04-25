const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categorias.controller');

router.get('/', ctrl.getCategorias);
router.post('/', ctrl.crearCategoria);
router.put('/:id', ctrl.actualizarCategoria);
router.delete('/:id', ctrl.eliminarCategoria);

module.exports = router;