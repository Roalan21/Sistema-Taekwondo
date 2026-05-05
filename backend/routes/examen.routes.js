const express = require('express');
const router = express.Router();

const { obtenerExamenes } = require('../controllers/examen.controller');

// GET /examenes
router.get('/', obtenerExamenes);

module.exports = router;