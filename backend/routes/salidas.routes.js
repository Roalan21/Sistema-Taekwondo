const express = require('express');
const router = express.Router();

const {
    crearVenta,
    crearRegalia,
    crearPromocion
} = require('../controllers/salidas.controller');

router.post('/venta', crearVenta);
router.post('/regalia', crearRegalia);
router.post('/promocion', crearPromocion);

module.exports = router;