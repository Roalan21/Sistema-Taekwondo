const { sql } = require('../db/conexion');

const crearRecibo = async (req, res) => {
    const { Descripcion, Tipo, MontoFinal } = req.body;

    const pool = await sql.connect();

    const result = await pool.request()
        .input('Descripcion', sql.VarChar, Descripcion)
        .input('Tipo', sql.VarChar, Tipo)
        .input('FechaEmision', sql.Date, new Date())
        .input('MontoFinal', sql.Decimal(10,2), MontoFinal)
        .input('TotalFinal', sql.Decimal(10,2), MontoFinal)
        .query(`
            INSERT INTO Recibo (Descripcion, Tipo, FechaEmision, MontoFinal, TotalFinal)
            OUTPUT INSERTED.ReciboID
            VALUES (@Descripcion, @Tipo, @FechaEmision, @MontoFinal, @TotalFinal)
        `);

    res.json({ ReciboID: result.recordset[0].ReciboID });
};

module.exports = { crearRecibo };