const express = require('express');
const router = express.Router();
const { obtenerProveedores } = require('../controllers/tusah.controller');

router.get('/', obtenerProveedores);

module.exports = router;