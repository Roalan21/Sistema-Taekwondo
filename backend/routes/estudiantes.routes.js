const express = require('express');
const router = express.Router();
const { obtenerTodos } = require('../controllers/estudiantes.controller');

router.get('/', obtenerTodos);

module.exports = router;