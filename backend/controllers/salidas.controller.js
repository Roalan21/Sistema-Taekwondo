const { sql } = require('../db/conexion');

//  VENTA
const crearVenta = async (req, res) => {
    const { productos, MetodoPagoID, MontoFinal } = req.body;

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

        //  recalcular total (SEGURIDAD)
        for (let p of productos) {
            const descuento = p.descuento || 0;
            const subtotal = p.precio * p.cantidad * (1 - descuento / 100);
            totalFinal += subtotal;
        }

        if (MontoFinal < totalFinal) {
            return res.status(400).json({
                error: `El monto (${MontoFinal}) no puede ser menor al total (${totalFinal})`
            });
        }

        for (let p of productos) {
            await transaction.request()
                .input("ProductoID", sql.Int, p.id)
                .input("Cantidad", sql.Int, p.cantidad)
                .input("Descripcion", sql.VarChar, "Salida por venta")
                .input("Tipo", sql.VarChar, "SALIDA")
                .input("Fecha", sql.Date, new Date())
                .input("Estado", sql.Bit, 1)
                .query(`
                    INSERT INTO Inventario (ProductoID, Cantidad, Descripcion, TipoMovimiento, Fecha, Estado)
                    VALUES (@ProductoID, @Cantidad, @Descripcion, @Tipo, @Fecha, @Estado)
                `);
        }

         detalles = "Venta de productos";

        //  RECIBO
        const recibo = await transaction.request()
            .input("Descripcion", sql.VarChar, "Venta de productos")
            .input("Tipo", sql.VarChar, "VENTA")
            .input("Detalles", sql.VarChar, detalles)
            .input("MontoFinal", sql.Decimal(10,2), totalFinal)
            .input("TotalFinal", sql.Decimal(10,2), totalFinal)
            .input("Estado", sql.Bit, 1)
            .input("FechaEmision", sql.Date, new Date())
            .query(`
                INSERT INTO Recibo (Descripcion, Tipo, Detalles, MontoFinal, TotalFinal, Estado, FechaEmision)
                OUTPUT INSERTED.ReciboID
                VALUES (@Descripcion, @Tipo, @Detalles, @MontoFinal, @TotalFinal, @Estado, @FechaEmision)
            `);

        const reciboID = recibo.recordset[0].ReciboID;


        //  VENTA
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

        //  DETALLE
        for (let p of productos) {
            const descuento = p.descuento || 0;
            const subtotal = p.precio * p.cantidad * (1 - descuento / 100);

            await transaction.request()
                .input("VentaID", sql.Int, ventaID)
                .input("ProductoID", sql.Int, p.id)
                .input("CantidadProducto", sql.Int, p.cantidad)
                .input("Descuento", sql.Decimal(10,2), p.descuento || 0)
                .input("PrecioUnitario", sql.Decimal(10,2), p.precio)
                .query(`
                    INSERT INTO Produce (VentaID, ProductoID, CantidadProducto,  Descuento, PrecioUnitario)
                    VALUES (@VentaID, @ProductoID, @CantidadProducto,  @Descuento, @PrecioUnitario)
                `);
        }

        await transaction.commit();

        res.json({ message: "Venta registrada 💰", ReciboID: reciboID});

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

//  REGALIA
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
            .input("Tipo", sql.VarChar, "SALIDA")
            .input("Fecha", sql.Date, new Date())
            .input("Estado", sql.Bit, 1)
            .query(`
                INSERT INTO Inventario (ProductoID, Cantidad, Descripcion, TipoMovimiento, Fecha, Estado)
                VALUES (@ProductoID, @Cantidad, @Descripcion, @Tipo, @Fecha, @Estado)
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

//  PROMOCION
const crearPromocion = async (req, res) => {
    const { tipo, fechaInicio, fechaFin, productoID, precioPromocion, cantidad } = req.body;

    const pool = await sql.connect();

    try {

        if (!productoID || !cantidad) {
            return res.status(400).json({ error: "Datos incompletos" });
        }

        const promo = await pool.request()
            .input("PrecioPromocion", sql.Decimal(10,2), precioPromocion)
            .input("FechaInicio", sql.Date, fechaInicio)
            .input("FechaFin", sql.Date, fechaFin)
            .input("TipoPromo", sql.VarChar, tipo)
            .input("Estado", sql.Bit, 1)
            .input("Descripcion", sql.VarChar, tipo)
            .query(`
                INSERT INTO Promocion
                (
                    PrecioPromocion,
                    FechaInicio,
                    FechaFin,
                    TipoPromo,
                    Estado,
                    Descripcion
                )
                OUTPUT INSERTED.PromocionID
                VALUES
                (
                    @PrecioPromocion,
                    @FechaInicio,
                    @FechaFin,
                    @TipoPromo,
                    @Estado,
                    @Descripcion
                )
            `);

        const promoID = promo.recordset[0].PromocionID;

        //  buscar precio original del producto
        const producto = await pool.request()
            .input("ProductoID", sql.Int, productoID)
            .query(`
                SELECT PrecioVenta
                FROM Producto
                WHERE ProductoID = @ProductoID
            `);

        const precioOriginal =
            producto.recordset[0].PrecioVenta;

        //  guardar detalle promoción
        await pool.request()
            .input("PromocionID", sql.Int, promoID)
            .input("ProductoID", sql.Int, productoID)
            .input("PrecioOriginal", sql.Decimal(10,2), precioOriginal)
            .input("PrecioPromocionAplicado", sql.Decimal(10,2), precioPromocion)
            .query(`
                INSERT INTO DetalleDePromocion
                (
                    PromocionID,
                    ProductoID,
                    PrecioOriginal,
                    PrecioPromocionAplicado
                )
                VALUES
                (
                    @PromocionID,
                    @ProductoID,
                    @PrecioOriginal,
                    @PrecioPromocionAplicado
                )
            `);

        res.json({ message: "Promoción registrada 🏷️" });

    } catch (err) {
        console.error("❌ ERROR COMPLETO:");
        console.error(err);
        console.error("Mensaje:", err.message);
        console.error("Número:", err.number);
        console.error("Línea:", err.lineNumber);

        res.status(500).json({  
            error: err.message,
            numero: err.number,
            linea: err.lineNumber});
    }
};

module.exports = { crearVenta, crearRegalia, crearPromocion };