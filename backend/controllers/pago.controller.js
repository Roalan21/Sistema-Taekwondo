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

        const estado =
            (d.TipoPago === "MENSUALIDAD" && d.EsCuotas)
                ? 0
                : 1;

        const descripcion =
            `Recibo por ${d.TipoPago}`;

        let detalles = "";

        // DETALLES SEGÚN TIPO

        if (d.TipoPago === "MENSUALIDAD") {

            detalles = d.EsCuotas
                ? `Pago de mensualidad en ${d.Cuotas} cuotas`
                : "Pago completo de mensualidad";
        }

        if (d.TipoPago === "EXAMEN") {

            detalles = "Pago de examen de cambio de cinta";
        }

        if (d.TipoPago === "EVENTO") {

            const evento = await transaction.request()
                .input("EventoID", sql.Int, d.EventoID)
                .query(`
                    SELECT Nombre
                    FROM Evento
                    WHERE EventoID = @EventoID
                `);

            if (evento.recordset.length === 0) {
                throw new Error("Evento no encontrado");
            }

            detalles =
                `Pago de inscripción al evento ${evento.recordset[0].Nombre}`;
        }

        // RECIBO

        const recibo = await transaction.request()

            .input("Descripcion", sql.VarChar, descripcion)
            .input("Tipo", sql.VarChar, d.TipoPago)
            .input("Detalles", sql.VarChar, detalles)
            .input("FechaEmision", sql.Date, new Date())
            .input("MontoFinal", sql.Decimal(10,2), d.Monto)
            .input("TotalFinal", sql.Decimal(10,2), d.Monto)
            .input("Estado", sql.Bit, estado)

            .query(`
                INSERT INTO Recibo
                (
                    Descripcion,
                    Tipo,
                    Detalles,
                    FechaEmision,
                    MontoFinal,
                    TotalFinal,
                    Estado
                )
                OUTPUT INSERTED.ReciboID
                VALUES
                (
                    @Descripcion,
                    @Tipo,
                    @Detalles,
                    @FechaEmision,
                    @MontoFinal,
                    @TotalFinal,
                    @Estado
                )
            `);

        const reciboID =
            recibo.recordset[0].ReciboID;

        // PAGO

        const pago = await transaction.request()

            .input("ReciboID", sql.Int, reciboID)
            .input("MetodoPagoID", sql.Int, d.MetodoPagoID)
            .input("FechaPago", sql.Date, new Date())
            .input("Monto", sql.Decimal(10,2), d.Monto)
            .input("TipoPago", sql.VarChar, d.TipoPago)
            .input("Estado", sql.Bit, estado)
            .input("EstudianteID", sql.Int, d.EstudianteID)
            .input("ExamenID", sql.Int, d.ExamenID || null)
            .input("EventoID", sql.Int, d.EventoID || null)

            .query(`
                INSERT INTO Pago
                (
                    ReciboID,
                    MetodoPagoID,
                    FechaPago,
                    Monto,
                    TipoPago,
                    Estado,
                    EstudianteID,
                    ExamenID,
                    EventoID
                )
                VALUES
                (
                    @ReciboID,
                    @MetodoPagoID,
                    @FechaPago,
                    @Monto,
                    @TipoPago,
                    @Estado,
                    @EstudianteID,
                    @ExamenID,
                    @EventoID
                );

                SELECT SCOPE_IDENTITY() AS PagoID;
            `);

        const pagoID =
            pago.recordset[0].PagoID;

        // MENSUALIDAD

        if (d.TipoPago === "MENSUALIDAD") {

            const mensualidad = await transaction.request()

                .input("EstudianteID", sql.Int, d.EstudianteID)

                .query(`
                    SELECT TOP 1 *
                    FROM Mensualidad
                    WHERE EstudianteID = @EstudianteID
                    AND Estado IN ('PENDIENTE','VENCIDA')
                    ORDER BY FechaLimite ASC
                `);

            if (mensualidad.recordset.length === 0) {

                throw new Error(
                    "El estudiante no tiene mensualidad pendiente"
                );
            }

            const m = mensualidad.recordset[0];

            const totalCuotas =
                d.EsCuotas ? d.Cuotas : 1;

            if (totalCuotas > 6) {

                throw new Error(
                    "Máximo 6 cuotas"
                );
            }

            const valorCuota =
                d.Monto / totalCuotas;

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
                        (
                            MensualidadID,
                            PagoID,
                            Cuota,
                            FechaPago,
                            PagoFinal,
                            Mora,
                            Monto
                        )
                        VALUES
                        (
                            @MensualidadID,
                            @PagoID,
                            @Cuota,
                            @FechaPago,
                            @PagoFinal,
                            @Mora,
                            @Monto
                        )
                    `);
            }

            await transaction.request()

                .input("MensualidadID", sql.Int, m.MensualidadID)

                .query(`
                    UPDATE Mensualidad
                    SET Estado = 'PAGADA'
                    WHERE MensualidadID = @MensualidadID
                `);

            await transaction.request()

                .input("EstudianteID", sql.Int, d.EstudianteID)
                .input("Precio", sql.Decimal(10,2), m.Precio)
                .input("FechaLimite", sql.Date, m.FechaLimite)

                .query(`
                    INSERT INTO Mensualidad
                    (
                        EstudianteID,
                        Precio,
                        FechaLimite,
                        Estado
                    )
                    VALUES
                    (
                        @EstudianteID,
                        @Precio,
                        DATEADD(MONTH, 1, @FechaLimite),
                        'PENDIENTE'
                    )
                `);
        }

        // EXAMEN

        if (d.TipoPago === "EXAMEN") {
            if (!d.ExamenID) {
                throw new Error(
                    "No se recibió el examen"
                );
            }
            
            await transaction.request()

                .input("EstudianteID", sql.Int, d.EstudianteID)
                .input("ExamenID", sql.Int, d.ExamenID)
                .input("FechaRegistro", sql.Date, new Date())

                .query(`
                    INSERT INTO Realiza
                    (
                        EstudianteID,
                        ExamenID,
                        Resultado,
                        Asistencia,
                        FechaRegistro
                    )
                    VALUES
                    (
                        @EstudianteID,
                        @ExamenID,
                        NULL,
                        0,
                        @FechaRegistro
                    )
                `);
        }

        // EVENTO

        if (d.TipoPago === "EVENTO") {

            if (!d.EventoID) {

                throw new Error(
                    "Seleccione un evento"
                );
            }

            const existe = await transaction.request()

                .input("EstudianteID", sql.Int, d.EstudianteID)
                .input("EventoID", sql.Int, d.EventoID)

                .query(`
                    SELECT *
                    FROM Participa
                    WHERE EstudianteID = @EstudianteID
                    AND EventoID = @EventoID
                `);

            if (existe.recordset.length > 0) {

                throw new Error(
                    "El estudiante ya está inscrito en este evento"
                );
            }

            await transaction.request()

                .input("EstudianteID", sql.Int, d.EstudianteID)
                .input("EventoID", sql.Int, d.EventoID)
                .input("FechaRegistro", sql.Date, new Date())
                .input("Asistencia", sql.Bit, 0)
                .input("Resultado", sql.VarChar, null)

                .query(`
                    INSERT INTO Participa
                    (
                        EstudianteID,
                        EventoID,
                        FechaRegistro,
                        Asistencia,
                        Resultado
                    )
                    VALUES
                    (
                        @EstudianteID,
                        @EventoID,
                        @FechaRegistro,
                        @Asistencia,
                        @Resultado
                    )
                `);
        }

        await transaction.commit();

        res.json({
            message: "Pago registrado correctamente 💰",
            ReciboID: reciboID
        });

    } catch (err) {

        await transaction.rollback();

        console.error(err);

        res.status(500).json({
            error: err.message
        });
    }
};

module.exports = {
    registrarPagoCompleto
};