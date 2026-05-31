const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/recibo.controller');

router.post('/', ctrl.crearRecibo);
router.get('/:id', ctrl.obtenerRecibo);
module.exports = router;