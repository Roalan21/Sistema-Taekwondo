const { sql } = require('../db/conexion');

const registrarEntrada = async (req, res) => {
    const { ProductoID, Cantidad, Descripcion } = req.body;

    try {
        const pool = await sql.connect();

        await pool.request()
            .input("ProductoID", sql.Int, ProductoID)
            .input("Cantidad", sql.Int, Cantidad)
            .input("Descripcion", sql.VarChar, Descripcion)
            .input("Tipo", sql.VarChar, "ENTRADA")
            .input("Fecha", sql.Date, new Date())
            .input("Estado", sql.Bit, 1)
            .query(`
                INSERT INTO Inventario
                (
                    ProductoID,
                    Cantidad,
                    Descripcion,
                    TipoMovimiento,
                    Fecha,
                    Estado
                )
                VALUES
                (
                    @ProductoID,
                    @Cantidad,
                    @Descripcion,
                    @Tipo,
                    @Fecha,
                    @Estado
                )
            `);

        res.json({
            message: "Entrada registrada 📦"
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: err.message
        });
    }
};

const obtenerMovimientos = async (req, res) => {
    try {
        const pool = await sql.connect();

        const result = await pool.request().query(`
            SELECT TOP 20
                I.InventarioID,
                P.Nombre AS Producto,
                I.Cantidad,
                I.Descripcion,
                I.TipoMovimiento,
                I.Fecha
            FROM Inventario I
            INNER JOIN Producto P
                ON I.ProductoID = P.ProductoID
            ORDER BY I.InventarioID DESC
        `);

        res.json(result.recordset);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: err.message
        });
    }
};

module.exports = {
    registrarEntrada,
    obtenerMovimientos
};