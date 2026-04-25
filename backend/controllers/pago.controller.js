const { sql } = require('../db/conexion');

const registrarPagoCompleto = async (req, res) => {
    const d = req.body;
    const pool = await sql.connect();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // 1. RECIBO
        const recibo = await transaction.request()
            .input("Descripcion", sql.VarChar, d.Descripcion)
            .input("Tipo", sql.VarChar, "Mensualidad")
            .input("FechaEmision", sql.Date, new Date())
            .input("MontoFinal", sql.Decimal(10,2), d.Monto)
            .input("TotalFinal", sql.Decimal(10,2), d.Monto)
            .query(`
                INSERT INTO Recibo (Descripcion, Tipo, FechaEmision, MontoFinal, TotalFinal)
                OUTPUT INSERTED.ReciboID
                VALUES (@Descripcion, @Tipo, @FechaEmision, @MontoFinal, @TotalFinal)
            `);

        const reciboID = recibo.recordset[0].ReciboID;

        // 2. PAGO
        const pago = await transaction.request()
            .input("ReciboID", sql.Int, reciboID)
            .input("MetodoPagoID", sql.Int, d.MetodoPagoID)
            .input("FechaPago", sql.Date, new Date())
            .input("Monto", sql.Decimal(10,2), d.Monto)
            .input("TipoPago", sql.VarChar, "Mensualidad")
            .query(`
                INSERT INTO Pago (ReciboID, MetodoPagoID, FechaPago, Monto, TipoPago)
                OUTPUT INSERTED.PagoID
                VALUES (@ReciboID, @MetodoPagoID, @FechaPago, @Monto, @TipoPago)
            `);

        const pagoID = pago.recordset[0].PagoID;

        // 3. GENERA
        await transaction.request()
            .input("MensualidadID", sql.Int, d.MensualidadID)
            .input("PagoID", sql.Int, pagoID)
            .input("Cuota", sql.Int, d.Cuota)
            .input("FechaPago", sql.Date, new Date())
            .input("PagoFinal", sql.Decimal(10,2), d.Monto)
            .input("Mora", sql.Int, d.Mora || 0)
            .input("Monto", sql.Decimal(10,2), d.Monto)
            .query(`
                INSERT INTO Genera 
                (MensualidadID, PagoID, Cuota, FechaPago, PagoFinal, Mora, Monto)
                VALUES (@MensualidadID, @PagoID, @Cuota, @FechaPago, @PagoFinal, @Mora, @Monto)
            `);

        await transaction.commit();

        res.json({ message: "Pago registrado correctamente 💰" });

    } catch (err) {
        await transaction.rollback();
        res.status(500).json({ error: err.message });
    }
};

const listarPagos = async (req, res) => {
    try {
        const pool = await sql.connect();

        const result = await pool.request().query(`
            SELECT 
                E.PrimerNombre + ' ' + E.PrimerApellido AS Estudiante,
                M.Precio,
                G.Cuota,
                G.Monto,
                G.FechaPago,
                MP.Metodo
            FROM Genera G
            INNER JOIN Mensualidad M ON G.MensualidadID = M.MensualidadID
            INNER JOIN Pago P ON G.PagoID = P.PagoID
            INNER JOIN MetodoPago MP ON P.MetodoPagoID = MP.MetodoPagoID
            INNER JOIN Estudiante E ON M.EstudianteID = E.EstudianteID
            ORDER BY G.FechaPago DESC
        `);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { registrarPagoCompleto, listarPagos };