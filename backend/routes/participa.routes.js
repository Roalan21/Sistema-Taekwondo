// routes/participa.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/participa.controller');

router.get('/', ctrl.obtenerParticipaciones);
router.get('/evento/:eventoId', ctrl.obtenerPorEvento);
router.get('/verificar', ctrl.verificarParticipacion);
router.post('/', ctrl.registrarParticipacion);
router.delete('/:id', ctrl.eliminarParticipacion);
router.put("/:id", ctrl.actualizarParticipacion);
module.exports = router;