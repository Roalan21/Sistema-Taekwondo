const express = require('express');
const router = express.Router();
const ctrl =
    require('../controllers/mensualidad.controller');

router.get('/', ctrl.obtenerMensualidades);
router.get('/:id', ctrl.obtenerPorId);

module.exports = router;