const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/realiza.controller');
router.get('/examen/:examenId', ctrl.obtenerPorExamen);
router.get('/verificar', ctrl.verificarRealiza);
router.post('/', ctrl.registrarRealiza);
router.put('/:id', ctrl.actualizarRealiza);
router.delete('/:id', ctrl.eliminarRealiza);
module.exports = router;