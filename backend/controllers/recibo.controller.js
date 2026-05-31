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

const obtenerRecibo = async (req, res) => {

    try {

        const pool = await sql.connect();

        const result = await pool.request()
            .input("ReciboID", sql.Int, req.params.id)
            .query(`
                SELECT
                    r.ReciboID,
                    r.Descripcion,
                    r.Tipo,
                    r.Detalles,
                    r.FechaEmision,
                    r.TotalFinal,

                    p.TipoPago,
                    p.Monto,

                    v.Monto AS MontoVenta,

                    mp.Metodo,

                    e.Nombres,
                    e.Apellidos

                FROM Recibo r

                LEFT JOIN Pago p
                    ON r.ReciboID = p.ReciboID

                LEFT JOIN Venta v
                    ON r.ReciboID = v.ReciboID

                LEFT JOIN MetodoPago mp
                    ON mp.MetodoPagoID =
                        COALESCE(
                            p.MetodoPagoID,
                            v.MetodoPagoID
                        )

                LEFT JOIN Estudiante e
                    ON p.EstudianteID = e.EstudianteID

                WHERE r.ReciboID = @ReciboID
            `);

            const recibo = result.recordset[0];

            if (!recibo) {
                return res.status(404).json({
                    error: "Recibo no encontrado"
                });
            
        }

         const productos = await pool.request()
            .input("ReciboID", sql.Int, req.params.id)
            .query(`
                SELECT
                    pr.Nombre,
                    pd.CantidadProducto,
                    pd.PrecioUnitario,
                    (pd.CantidadProducto * pd.PrecioUnitario) AS Subtotal

                FROM Venta v

                INNER JOIN Produce pd
                    ON v.VentaID = pd.VentaID

                INNER JOIN Producto pr
                    ON pr.ProductoID = pd.ProductoID

                WHERE v.ReciboID = @ReciboID
            `);

        recibo.Productos =
            productos.recordset;

        res.json(recibo);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
};

module.exports = { crearRecibo, obtenerRecibo  };