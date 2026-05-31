const express = require('express');
const router = express.Router();
const profCtrl = require('../controllers/profesor.controller');

router.get('/', profCtrl.obtenerProfesores);          
router.get('/todos', profCtrl.obtenerTodosProfesores); 
router.get('/inactivos', profCtrl.obtenerProfesoresInactivos); 
router.post('/', profCtrl.crearProfesor);
router.put('/:id', profCtrl.actualizarProfesor);
router.patch('/estado/:id', profCtrl.eliminarProfesor);
router.patch('/reactivar/:id', profCtrl.reactivarProfesor);

module.exports = router;