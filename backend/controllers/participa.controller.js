// controllers/participa.controller.js

const { sql } = require('../db/conexion');

// 🔹 LISTAR
const obtenerParticipaciones = async (req, res) => {
    const pool = await sql.connect();
    const result = await pool.request().query(`
        SELECT 
            Pa.ParticipaID,
            E.PrimerNombre + ' ' + E.PrimerApellido AS Estudiante,
            Ev.Nombre AS Evento,
            Pa.Asistencia,
            Pa.Resultado
        FROM Participa Pa
        INNER JOIN Estudiante E ON Pa.EstudianteID = E.EstudianteID
        INNER JOIN Evento Ev ON Pa.EventoID = Ev.EventoID
    `);

    res.json(result.recordset);
};

// 🔹 CREAR
const registrarParticipacion = async (req, res) => {
    const { EstudianteID, EventoID, Resultado } = req.body;

    const pool = await sql.connect();
    await pool.request()
        .input('EstudianteID', sql.Int, EstudianteID)
        .input('EventoID', sql.Int, EventoID)
        .input('FechaRegistro', sql.Date, new Date())
        .input('Asistencia', sql.Bit, 1)
        .input('Resultado', sql.VarChar, Resultado)
        .query(`
            INSERT INTO Participa 
            (EstudianteID, EventoID, FechaRegistro, Asistencia, Resultado)
            VALUES (@EstudianteID, @EventoID, @FechaRegistro, @Asistencia, @Resultado)
        `);

    res.json({ message: "Participación registrada" });
};

module.exports = { obtenerParticipaciones, registrarParticipacion };