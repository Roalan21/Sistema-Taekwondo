// routes/evento.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/evento.controller');

router.get('/', ctrl.obtenerEventos);
router.post('/', ctrl.crearEvento);

module.exports = router;