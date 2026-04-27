const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/modalidad.controller');

router.get('/', ctrl.obtener);
router.post('/', ctrl.crear);
router.delete('/:id', ctrl.eliminar);

module.exports = router;