const express = require('express');

const router = express.Router();

const ctrl = require('../controllers/examen.controller');
router.get('/', ctrl.obtenerExamenes);
router.get('/:id', ctrl.obtenerExamen);
router.post('/', ctrl.crearExamen);
router.put('/:id', ctrl.editarExamen);
router.delete('/:id', ctrl.eliminarExamen);

module.exports = router;