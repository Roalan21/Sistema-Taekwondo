const { sql } = require('../db/conexion');

// LISTAR
const obtenerEventos = async (req, res) => {
    const pool = await sql.connect();
    const result = await pool.request().query(`
        SELECT * FROM Evento ORDER BY Fecha DESC
    `);
    res.json(result.recordset);
};

// CREAR
const crearEvento = async (req, res) => {
    const { Nombre, Lugar, Fecha, Descripcion, Precio } = req.body;

    const pool = await sql.connect();
    await pool.request()
        .input('Nombre', sql.VarChar, Nombre)
        .input('Lugar', sql.VarChar, Lugar)
        .input('Fecha', sql.Date, Fecha)
        .input('Descripcion', sql.VarChar, Descripcion || '')
        .input('Precio', sql.Decimal(10,2), Precio)
        .query(`
            INSERT INTO Evento (Nombre, Lugar, Fecha, Descripcion, Precio)
            VALUES (@Nombre, @Lugar, @Fecha, @Descripcion, @Precio)
        `);

    res.json({ message: "Evento creado" });
};

module.exports = { obtenerEventos, crearEvento };