const express = require('express');
const router = express.Router();
const { obtenerTodos, obtenerPorId, crearEstudiante, actualizarEstudiante, eliminarEstudiante } = require('../controllers/estudiantes.controller');

router.get('/', obtenerTodos);
router.get('/:id', obtenerPorId);
router.post('/', crearEstudiante);
router.put('/:id', actualizarEstudiante);
router.patch('/estado/:id', eliminarEstudiante);

module.exports = router;