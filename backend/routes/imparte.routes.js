const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/imparte.controller');

router.get('/', ctrl.obtenerImparte);
router.post('/', ctrl.crearImparte);
router.delete('/:profesorId/:turnoId', ctrl.eliminarImparte);

module.exports = router;