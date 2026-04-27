// routes/evento.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/evento.controller');

router.get('/', ctrl.obtenerEventos);
router.get('/:id', ctrl.obtenerEventoPorId);
router.post('/', ctrl.crearEvento);
router.put('/:id', ctrl.actualizarEvento);
router.delete('/:id', ctrl.eliminarEvento);

module.exports = router;