const { sql } = require('../db/conexion');

const registrarPagoCompleto = async (req, res) => {
    const d = req.body;
    const pool = await sql.connect();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        if (!d.TipoPago) {
            throw new Error("Debe seleccionar un tipo de pago");
        }

        const estado = (d.TipoPago === "Mensualidad" && d.EsCuotas) ? 0 : 1;
        const descripcion = `Recibo por ${d.TipoPago}`;

        // 🔹 RECIBO
        const recibo = await transaction.request()
            .input("Descripcion", sql.VarChar, descripcion)
            .input("Tipo", sql.VarChar, d.TipoPago)
            .input("FechaEmision", sql.Date, new Date())
            .input("MontoFinal", sql.Decimal(10,2), d.Monto)
            .input("TotalFinal", sql.Decimal(10,2), d.Monto)
            .input("Estado", sql.Bit, estado)
            .query(`
                INSERT INTO Recibo 
                (Descripcion, Tipo, FechaEmision, MontoFinal, TotalFinal, Estado)
                OUTPUT INSERTED.ReciboID
                VALUES (@Descripcion, @Tipo, @FechaEmision, @MontoFinal, @TotalFinal, @Estado)
            `);

        const reciboID = recibo.recordset[0].ReciboID;

        // 🔹 PAGO
        const pago = await transaction.request()
            .input("ReciboID", sql.Int, reciboID)
            .input("MetodoPagoID", sql.Int, d.MetodoPagoID)
            .input("FechaPago", sql.Date, new Date())
            .input("Monto", sql.Decimal(10,2), d.Monto)
            .input("TipoPago", sql.VarChar, d.TipoPago)
            .input("Estado", sql.Bit, estado)
            .query(`
                INSERT INTO Pago 
                (ReciboID, MetodoPagoID, FechaPago, Monto, TipoPago, Estado)
                OUTPUT INSERTED.PagoID
                VALUES (@ReciboID, @MetodoPagoID, @FechaPago, @Monto, @TipoPago, @Estado)
            `);

        const pagoID = pago.recordset[0].PagoID;

        // =====================================================
        // 🟢 MENSUALIDAD
        // =====================================================
        if (d.TipoPago === "Mensualidad") {

            const mensualidad = await transaction.request()
                .input("EstudianteID", sql.Int, d.EstudianteID)
                .query(`
                    SELECT TOP 1 * 
                    FROM Mensualidad 
                    WHERE EstudianteID = @EstudianteID
                    ORDER BY FechaLimite DESC
                `);

            if (mensualidad.recordset.length === 0) {
                throw new Error("El estudiante no tiene mensualidad");
            }

            const m = mensualidad.recordset[0];

            const totalCuotas = d.EsCuotas ? d.Cuotas : 1;

            if (totalCuotas > 6) {
                throw new Error("Máximo 6 cuotas");
            }

            const valorCuota = d.Monto / totalCuotas;

            for (let i = 1; i <= totalCuotas; i++) {
                await transaction.request()
                    .input("MensualidadID", sql.Int, m.MensualidadID)
                    .input("PagoID", sql.Int, pagoID)
                    .input("Cuota", sql.Int, i)
                    .input("FechaPago", sql.Date, new Date())
                    .input("PagoFinal", sql.Decimal(10,2), valorCuota)
                    .input("Mora", sql.Int, 0)
                    .input("Monto", sql.Decimal(10,2), valorCuota)
                    .query(`
                        INSERT INTO Genera 
                        (MensualidadID, PagoID, Cuota, FechaPago, PagoFinal, Mora, Monto)
                        VALUES (@MensualidadID, @PagoID, @Cuota, @FechaPago, @PagoFinal, @Mora, @Monto)
                    `);
            }
        }

        // =====================================================
        // 🟣 EXAMEN
        // =====================================================
        if (d.TipoPago === "Examen") {

            if (!d.ExamenID) throw new Error("Seleccione un examen");

            const existe = await transaction.request()
                .input("ExamenID", sql.Int, d.ExamenID)
                .query(`SELECT PagoID FROM Examen WHERE ExamenID = @ExamenID`);

            if (existe.recordset[0].PagoID) {
                throw new Error("Este examen ya está pagado");
            }

            await transaction.request()
                .input("PagoID", sql.Int, pagoID)
                .input("ExamenID", sql.Int, d.ExamenID)
                .query(`
                    UPDATE Examen
                    SET PagoID = @PagoID
                    WHERE ExamenID = @ExamenID
                `);
        }

        // =====================================================
        // 🔵 EVENTO
        // =====================================================
        if (d.TipoPago === "Evento") {

            if (!d.EventoID) throw new Error("Seleccione un evento");

            const existe = await transaction.request()
                .input("EventoID", sql.Int, d.EventoID)
                .query(`SELECT PagoID FROM Evento WHERE EventoID = @EventoID`);

            if (existe.recordset[0].PagoID) {
                throw new Error("Este evento ya está pagado");
            }

            await transaction.request()
                .input("PagoID", sql.Int, pagoID)
                .input("EventoID", sql.Int, d.EventoID)
                .query(`
                    UPDATE Evento
                    SET PagoID = @PagoID
                    WHERE EventoID = @EventoID
                `);
        }

        await transaction.commit();

        res.json({ message: "Pago registrado correctamente 💰" });

    } catch (err) {
        await transaction.rollback();
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { registrarPagoCompleto };