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
        console.error("❌ ERROR:", err);
        res.status(500).json({ error: err.message });
    }
};

// 🔹 Listar productos
const obtenerProductos = async (req, res) => {
    try {
        const pool = await sql.connect();

        const result = await pool.request().query(`
            SELECT Distinct P.ProductoID, P.Nombre, P.PrecioVenta
            FROM Producto P
        `);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { crearProducto, obtenerProductos };