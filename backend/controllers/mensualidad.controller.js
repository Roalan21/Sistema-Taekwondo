const { sql } = require('../db/conexion');

// LISTAR
const obtenerMensualidades = async (req, res) => {
    const pool = await sql.connect();
    const result = await pool.request().query(`
        SELECT M.*, 
               E.PrimerNombre + ' ' + E.PrimerApellido AS Estudiante
        FROM Mensualidad M
        INNER JOIN Estudiante E ON M.EstudianteID = E.EstudianteID
    `);

    res.json(result.recordset);
};

// CREAR
const crearMensualidad = async (req, res) => {
    const { EstudianteID, Precio, FechaLimite } = req.body;

    const pool = await sql.connect();
    await pool.request()
        .input('EstudianteID', sql.Int, EstudianteID)
        .input('Precio', sql.Decimal(10,2), Precio)
        .input('FechaLimite', sql.Date, FechaLimite)
        .query(`
            INSERT INTO Mensualidad (EstudianteID, Precio, FechaLimite)
            VALUES (@EstudianteID, @Precio, @FechaLimite)
        `);

    res.json({ message: "Mensualidad creada" });
};

module.exports = { obtenerMensualidades, crearMensualidad };