// routes/participa.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/participa.controller');

router.get('/', ctrl.obtenerParticipaciones);
router.post('/', ctrl.registrarParticipacion);

module.exports = router;