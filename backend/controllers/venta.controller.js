const { sql } = require('../db/conexion');

const registrarVenta = async (req, res) => {
    const { productos } = req.body;

    const pool = await sql.connect();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // 🔹 RECIBO
        const recibo = await transaction.request()
            .input("Descripcion", sql.VarChar, "Venta de productos")
            .input("Tipo", sql.VarChar, "Venta")
            .input("FechaEmision", sql.Date, new Date())
            .input("MontoFinal", sql.Decimal(10,2), 0)
            .input("TotalFinal", sql.Decimal(10,2), 0)
            .input("Estado", sql.Bit, 1)
            .query(`
                INSERT INTO Recibo (Descripcion, Tipo, FechaEmision, MontoFinal, TotalFinal, Estado)
                OUTPUT INSERTED.ReciboID
                VALUES (@Descripcion, @Tipo, @FechaEmision, @MontoFinal, @TotalFinal, @Estado)
            `);

        const reciboID = recibo.recordset[0].ReciboID;

        // 🔹 VENTA
        const venta = await transaction.request()
            .input("ReciboID", sql.Int, reciboID)
            .input("Fecha", sql.Date, new Date())
            .query(`
                INSERT INTO Venta (ReciboID, Fecha)
                OUTPUT INSERTED.VentaID
                VALUES (@ReciboID, @Fecha)
            `);

        const ventaID = venta.recordset[0].VentaID;

        let total = 0;

        for (const p of productos) {
            const subtotal = p.Cantidad * p.PrecioUnitario;
            total += subtotal;

            // 🔹 detalle
            await transaction.request()
                .input("VentaID", sql.Int, ventaID)
                .input("ProductoID", sql.Int, p.ProductoID)
                .input("Cantidad", sql.Int, p.Cantidad)
                .input("PrecioUnitario", sql.Decimal(10,2), p.PrecioUnitario)
                .query(`
                    INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, PrecioUnitario)
                    VALUES (@VentaID, @ProductoID, @Cantidad, @PrecioUnitario)
                `);

            // 🔹 inventario
            await transaction.request()
                .input("Cantidad", sql.Int, p.Cantidad)
                .input("ProductoID", sql.Int, p.ProductoID)
                .query(`
                    UPDATE Inventario
                    SET Stock = Stock - @Cantidad
                    WHERE ProductoID = @ProductoID
                `);
        }

        // 🔹 actualizar recibo
        await transaction.request()
            .input("Total", sql.Decimal(10,2), total)
            .input("ReciboID", sql.Int, reciboID)
            .query(`
                UPDATE Recibo
                SET MontoFinal = @Total, TotalFinal = @Total
                WHERE ReciboID = @ReciboID
            `);

        await transaction.commit();

        res.json({ message: "Venta registrada 💰" });

    } catch (err) {
        await transaction.rollback();
        res.status(500).json({ error: err.message });
    }
};

module.exports = { registrarVenta };