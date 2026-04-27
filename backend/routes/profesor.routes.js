const express = require('express');
const router = express.Router();
const profCtrl = require('../controllers/profesor.controller');

router.get('/', profCtrl.obtenerProfesores);           // Solo activos
router.get('/todos', profCtrl.obtenerTodosProfesores); // 🔥 NUEVO: activos e inactivos
router.get('/inactivos', profCtrl.obtenerProfesoresInactivos); // 🔥 NUEVO: solo inactivos
router.post('/', profCtrl.crearProfesor);
router.put('/:id', profCtrl.actualizarProfesor);
router.patch('/estado/:id', profCtrl.eliminarProfesor);
router.patch('/reactivar/:id', profCtrl.reactivarProfesor);

module.exports = router;