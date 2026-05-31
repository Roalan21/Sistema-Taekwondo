const { sql } = require('../db/conexion');

const crearProducto = async (req, res) => {
    console.log("📥 BODY:", req.body);

    try {
        const { Nombre, Descripcion, PrecioVenta} = req.body;

        const pool = await sql.connect();

        const result = await pool.request()
            .input("Nombre", sql.VarChar, Nombre)
            .input("Descripcion", sql.VarChar, Descripcion)
            .input("PrecioVenta", sql.Decimal(10,2), PrecioVenta)
            .input("ProveedorID", sql.Int, 1)
            .input("Estado", sql.Bit, 1)
            .query(`
                INSERT INTO Producto (ProveedorID, PrecioVenta, Descripcion, Nombre, Estado)
                OUTPUT INSERTED.ProductoID
                VALUES (@ProveedorID, @PrecioVenta, @Descripcion, @Nombre, @Estado)
            `);

        res.json({ message: "Producto guardado 📦" });

    } catch (err) {
        if (err.message.includes('CHK_Precio')) {
            return res.status(400).json({ error: "El precio debe ser un valor mayor a cero." });
        }
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

// 🔹 Listar productos (Modificado)
const obtenerProductos = async (req, res) => {
    try {
        const pool = await sql.connect();

        const result = await pool.request().query(`

        SELECT

            p.ProductoID,
            p.Nombre,
            p.Descripcion,
            p.PrecioVenta,
            p.StockActual,

            MAX(promo.PromocionID) AS PromocionID,
            MAX(promo.TipoPromo) AS TipoPromo,
            MAX(promo.PrecioPromocion) AS PrecioPromocion,

            CASE
                WHEN MAX(promo.PromocionID) IS NOT NULL
                THEN 1
                ELSE 0
            END AS TienePromocion

        FROM Producto p

        LEFT JOIN DetalleDePromocion dp
            ON dp.ProductoID = p.ProductoID

        LEFT JOIN Promocion promo
            ON promo.PromocionID = dp.PromocionID
            AND promo.Estado = 1
            AND CAST(GETDATE() AS DATE)
                BETWEEN promo.FechaInicio
                AND promo.FechaFin

        GROUP BY
            p.ProductoID,
            p.Nombre,
            p.Descripcion,
            p.PrecioVenta,
            p.StockActual
        `);
        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const actualizarProducto = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            Nombre,
            Descripcion,
            PrecioVenta
        } = req.body;

        const pool =
            await sql.connect();

        await pool.request()

            .input("ProductoID", sql.Int, id)

            .input("Nombre", sql.VarChar, Nombre)

            .input("Descripcion", sql.VarChar, Descripcion)

            .input(
                "PrecioVenta",
                sql.Decimal(10,2),
                PrecioVenta
            )

            .query(`

                UPDATE Producto

                SET
                    Nombre = @Nombre,
                    Descripcion = @Descripcion,
                    PrecioVenta = @PrecioVenta

                WHERE ProductoID = @ProductoID
            `);

        res.json({
            message:
                "Producto actualizado"
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });
    }
};
module.exports = { crearProducto, obtenerProductos,actualizarProducto };