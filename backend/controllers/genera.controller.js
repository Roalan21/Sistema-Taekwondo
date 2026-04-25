const { sql } = require('../db/conexion');

const registrarGenera = async (req, res) => {
    const { MensualidadID, PagoID, Monto } = req.body;

    const pool = await sql.connect();

    await pool.request()
        .input('MensualidadID', sql.Int, MensualidadID)
        .input('PagoID', sql.Int, PagoID)
        .input('Cuota', sql.Int, 1)
        .input('FechaPago', sql.Date, new Date())
        .input('PagoFinal', sql.Decimal(10,2), Monto)
        .input('Mora', sql.Int, 0)
        .input('Monto', sql.Decimal(10,2), Monto)
        .query(`
            INSERT INTO Genera
            (MensualidadID, PagoID, Cuota, FechaPago, PagoFinal, Mora, Monto)
            VALUES (@MensualidadID, @PagoID, @Cuota, @FechaPago, @PagoFinal, @Mora, @Monto)
        `);

    res.json({ message: "Pago aplicado a mensualidad" });
};

module.exports = { registrarGenera };