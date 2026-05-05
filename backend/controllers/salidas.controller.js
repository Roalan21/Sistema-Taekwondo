const { sql } = require('../db/conexion');

// 🔥 VENTA
const crearVenta = async (req, res) => {
    const { productos, MetodoPagoID } = req.body;

    if (!productos || productos.length === 0) {
        return res.status(400).json({ error: "No hay productos en la venta" });
    }

    if (!MetodoPagoID) {
        return res.status(400).json({ error: "Seleccione método de pago" });
    }

    const pool = await sql.connect();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        let totalFinal = 0;

        // 🔥 recalcular total (SEGURIDAD)
        for (let p of productos) {
            const descuento = p.descuento || 0;
            const subtotal = p.precio * p.cantidad * (1 - descuento / 100);
            totalFinal += subtotal;
        }


        // 🔹 RECIBO
        const recibo = await transaction.request()
            .input("Descripcion", sql.VarChar, "Venta de productos")
            .input("Tipo", sql.VarChar, "Venta")
            .input("MontoFinal", sql.Decimal(10,2), totalFinal)
            .input("TotalFinal", sql.Decimal(10,2), totalFinal)
            .input("Estado", sql.Bit, 1)
            .input("FechaEmision", sql.Date, new Date())
            .query(`
                INSERT INTO Recibo (Descripcion, Tipo, MontoFinal, TotalFinal, Estado, FechaEmision)
                OUTPUT INSERTED.ReciboID
                VALUES (@Descripcion, @Tipo, @MontoFinal, @TotalFinal, @Estado, @FechaEmision)
            `);

        const reciboID = recibo.recordset[0].ReciboID;

        await transaction.request()
            .input("ProductoID", sql.Int, p.id)
            .input("Cantidad", sql.Int, p.cantidad)
            .input("Descripcion", sql.VarChar, "Salida por venta")
            .input("Tipo", sql.VarChar, "Salida")
            .input("Fecha", sql.Date, new Date())
            .query(`
                INSERT INTO Inventario (ProductoID, Cantidad, Descripcion, TipoMovimiento, Fecha)
                VALUES (@ProductoID, @Cantidad, @Descripcion, @Tipo, @Fecha)
        `);


        // 🔹 VENTA
        const venta = await transaction.request()
            .input("ReciboID", sql.Int, reciboID)
            .input("Estado", sql.Bit, 1)
            .input("Fecha", sql.Date, new Date())
            .input("Monto", sql.Decimal(10,2), totalFinal)
            .input("Descripcion", sql.VarChar, "Venta de productos")
            .input("MetodoPagoID", sql.Int, MetodoPagoID)
            .query(`
                INSERT INTO Venta (ReciboID, Estado, Fecha, Monto, Descripcion, MetodoPagoID)
                OUTPUT INSERTED.VentaID
                VALUES (@ReciboID, @Estado, @Fecha, @Monto, @Descripcion, @MetodoPagoID)
            `);

        const ventaID = venta.recordset[0].VentaID;

        // 🔹 DETALLE
        for (let p of productos) {
            const descuento = p.descuento || 0;
            const subtotal = p.precio * p.cantidad * (1 - descuento / 100);

            await transaction.request()
                .input("VentaID", sql.Int, ventaID)
                .input("ProductoID", sql.Int, p.id)
                .input("CantidadProducto", sql.Int, p.cantidad)
                .input("PrecioUnitario", sql.Decimal(10,2), p.precio)
                .query(`
                    INSERT INTO Produce (VentaID, ProductoID, CantidadProducto, PrecioUnitario)
                    VALUES (@VentaID, @ProductoID, @CantidadProducto, @PrecioUnitario)
                `);
        }

        await transaction.commit();

        res.json({ message: "Venta registrada 💰" });

    } catch (err) {
        await transaction.rollback();

        console.error("❌ ERROR COMPLETO:");
        console.error(err);
        console.error("Mensaje:", err.message);
        console.error("Número:", err.number);
        console.error("Línea:", err.lineNumber);

        res.status(500).json({ error: err.message });
    }
};

// 🔥 REGALIA
const crearRegalia = async (req, res) => {
    const { destinatario, descripcion, productoID, cantidad } = req.body;

    const pool = await sql.connect();

    try {

        if (!productoID || !cantidad) {
            return res.status(400).json({ error: "Datos incompletos" });
        }

        await pool.request()
            .input("ProductoID", sql.Int, productoID)
            .input("Cantidad", sql.Int, cantidad)
            .input("Descripcion", sql.VarChar, "Salida por regalía")
            .input("Tipo", sql.VarChar, "Salida")
            .input("Fecha", sql.Date, new Date())
            .query(`
                INSERT INTO Inventario (ProductoID, Cantidad, Descripcion, TipoMovimiento, Fecha)
                VALUES (@ProductoID, @Cantidad, @Descripcion, @Tipo, @Fecha)
        `);

        const regalia = await pool.request()
            .input("Destinatario", sql.VarChar, destinatario)
            .input("Descripcion", sql.VarChar, descripcion)
            .input("Motivo", sql.VarChar, "Por definir")
            .input("Fecha", sql.Date, new Date())
            .input("Estado", sql.Bit, 1)
            .query(`
                INSERT INTO Regalia (Destinatario, Descripcion, Motivo, Fecha, Estado)
                OUTPUT INSERTED.RegaliaID
                VALUES (@Destinatario, @Descripcion, @Motivo, @Fecha, @Estado)
            `);

        const regaliaID = regalia.recordset[0].RegaliaID;

        await pool.request()
            .input("RegaliaID", sql.Int, regaliaID)
            .input("ProductoID", sql.Int, productoID)
            .input("Cantidad", sql.Int, cantidad)
            .query(`
                INSERT INTO DetalleDeRegalia
                VALUES (@RegaliaID, @ProductoID, @Cantidad)
            `);

        res.json({ message: "Regalía registrada 🎁" });

    } catch (err) {
        console.error("❌ ERROR COMPLETO:");
        console.error(err);
        console.error("Mensaje:", err.message);
        console.error("Número:", err.number);
        console.error("Línea:", err.lineNumber);

        res.status(500).json({ error: err.message });
    }
};

// 🔥 PROMOCION
const crearPromocion = async (req, res) => {
    const { tipo, fechaInicio, fechaFin, productoID, precioPromocion, cantidad } = req.body;

    const pool = await sql.connect();

    try {

        if (!productoID || !cantidad) {
            return res.status(400).json({ error: "Datos incompletos" });
        }

        await pool.request()
            .input("ProductoID", sql.Int, productoID)
            .input("Cantidad", sql.Int, cantidad)
            .input("Descripcion", sql.VarChar, "Salida por promoción")
            .input("Tipo", sql.VarChar, "Salida")
            .input("Fecha", sql.Date, new Date())
            .query(`
                INSERT INTO Inventario (ProductoID, Cantidad, Descripcion, TipoMovimiento, Fecha)
                VALUES (@ProductoID, @Cantidad, @Descripcion, @Tipo, @Fecha)
        `);

        const promo = await pool.request()
            .input("TipoPromo", sql.VarChar, tipo)
            .input("FechaInicio", sql.Date, fechaInicio)
            .input("FechaFin", sql.Date, fechaFin)
            .input("PrecioPromocion", sql.Decimal(10,2), precioPromocion)
            .input("Estado", sql.Bit, 1)
            .query(`
                INSERT INTO Promocion (TipoPromo, FechaInicio, FechaFin, PrecioPromocion, Estado )
                OUTPUT INSERTED.PromocionID
                VALUES (@TipoPromo, @FechaInicio, @FechaFin, @PrecioPromocion, @Estado)
            `);

        const promoID = promo.recordset[0].PromocionID;

        await pool.request()
            .input("PromocionID", sql.Int, promoID)
            .input("ProductoID", sql.Int, productoID)
            .input("Cantidad", sql.Int, cantidad)
            .query(`
                INSERT INTO DetalleDePromocion
                VALUES (@PromocionID, @ProductoID, @Cantidad)
            `);

        res.json({ message: "Promoción registrada 🏷️" });

    } catch (err) {
        console.error("❌ ERROR COMPLETO:");
        console.error(err);
        console.error("Mensaje:", err.message);
        console.error("Número:", err.number);
        console.error("Línea:", err.lineNumber);

        res.status(500).json({ error: err.message });
    }
};

module.exports = { crearVenta, crearRegalia, crearPromocion };