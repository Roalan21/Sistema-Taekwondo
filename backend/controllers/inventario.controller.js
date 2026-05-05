const { sql } = require('../db/conexion');

const registrarEntrada = async (req, res) => {
    const { ProductoID, Cantidad, Descripcion } = req.body;

    try {
        const pool = await sql.connect();

        await pool.request()
            .input("ProductoID", sql.Int, ProductoID)
            .input("Cantidad", sql.Int, Cantidad)
            .input("Descripcion", sql.VarChar, Descripcion)
            .input("Tipo", sql.VarChar, "Entrada")
            .input("Fecha", sql.Date, new Date())
            .input("Estado", sql.Bit, 1)
            .query(`
                INSERT INTO Inventario (ProductoID, Cantidad, Descripcion, TipoMovimiento, Fecha, Estado)
                VALUES (@ProductoID, @Cantidad, @Descripcion, @Tipo, @Fecha, @Estado)
            `);

        res.json({ message: "Entrada registrada 📦" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { registrarEntrada };