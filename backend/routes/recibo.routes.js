const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/recibo.controller');

router.post('/', ctrl.crearRecibo);

module.exports = router;