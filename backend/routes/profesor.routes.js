const express = require('express');
const router = express.Router();
const profCtrl = require('../controllers/profesor.controller');

router.get('/', profCtrl.obtenerProfesores);
router.post('/', profCtrl.crearProfesor);
router.put('/:id', profCtrl.actualizarProfesor);

// 👇 IMPORTANTE: ruta para inactivar
router.patch('/estado/:id', profCtrl.eliminarProfesor);

module.exports = router;