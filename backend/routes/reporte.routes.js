const express = require("express");
const router = express.Router();

const reporteCtrl = require("../controllers/reporte.controller");

router.get("/ingresos", reporteCtrl.ingresosPorFecha);
router.get("/mensualidades", reporteCtrl.mensualidadesReporte);
router.get("/morosos", reporteCtrl.estudiantesMorosos);
router.get("/productos-vendidos", reporteCtrl.productosMasVendidos);

module.exports = router;