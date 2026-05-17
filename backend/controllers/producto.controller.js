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
        if (err.message.includes('CHK_Hora')) {
            return res.status(400).json({ error: "La hora de fin debe ser posterior a la hora de inicio." });
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
                ProductoID, 
                Nombre, 
                Descripcion, 
                PrecioVenta, 
                StockActual 
            FROM Producto
            WHERE Estado = 1 
        `);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
module.exports = { crearProducto, obtenerProductos };