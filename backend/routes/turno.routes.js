const express = require('express');
const router = express.Router();

const turnoCtrl = require('../controllers/turno.controller');

router.get('/', turnoCtrl.obtenerTurnos);
router.post('/', turnoCtrl.crearTurno);
router.put('/:id', turnoCtrl.actualizarTurno);
router.delete('/:id', turnoCtrl.eliminarTurno);

module.exports = router;