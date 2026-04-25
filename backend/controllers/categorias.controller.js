const { sql } = require('../db/conexion');

// ✔ LISTAR
const getCategorias = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query("SELECT * FROM Categoria");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✔ CREAR
const crearCategoria = async (req, res) => {
    const { Nombre, Precio } = req.body;

    try {
        const pool = await sql.connect();
        await pool.request()
            .input('Nombre', sql.VarChar, Nombre)
            .input('Precio', sql.Decimal(10,2), Precio)
            .query("INSERT INTO Categoria (Nombre, Precio) VALUES (@Nombre, @Precio)");

        res.json({ message: "Categoría creada" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✔ ACTUALIZAR
const actualizarCategoria = async (req, res) => {
    const { id } = req.params;
    const { Nombre, Precio } = req.body;

    try {
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, id)
            .input('Nombre', sql.VarChar, Nombre)
            .input('Precio', sql.Decimal(10,2), Precio)
            .query(`
                UPDATE Categoria 
                SET Nombre = @Nombre, Precio = @Precio
                WHERE CategoriaID = @id
            `);

        res.json({ message: "Categoría actualizada" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✔ ELIMINAR (OPCIONAL)
const eliminarCategoria = async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM Categoria WHERE CategoriaID = @id");

        res.json({ message: "Categoría eliminada" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {getCategorias,crearCategoria,actualizarCategoria,eliminarCategoria};