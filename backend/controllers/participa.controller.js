// controllers/participa.controller.js
const { sql } = require('../db/conexion');

// 🔹 LISTAR TODAS LAS PARTICIPACIONES
const obtenerParticipaciones = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query(`
            SELECT 
                Pa.ParticipaID,
                Pa.EstudianteID,
                E.PrimerNombre + ' ' + E.PrimerApellido AS Estudiante,
                Pa.EventoID,
                Ev.Nombre AS Evento,
                Pa.FechaRegistro,
                Pa.Asistencia,
                Pa.Resultado
            FROM Participa Pa
            INNER JOIN Estudiante E ON Pa.EstudianteID = E.EstudianteID
            INNER JOIN Evento Ev ON Pa.EventoID = Ev.EventoID
            ORDER BY Pa.FechaRegistro DESC
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error("Error en obtenerParticipaciones:", error);
        res.status(500).json({ error: error.message });
    }
};

// 🔹 OBTENER PARTICIPACIONES POR EVENTO
const obtenerPorEvento = async (req, res) => {
    const { eventoId } = req.params;
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('EventoID', sql.Int, eventoId)
            .query(`
                SELECT 
                    Pa.ParticipaID,
                    Pa.EstudianteID,
                    E.PrimerNombre + ' ' + E.PrimerApellido AS Estudiante,
                    Pa.EventoID,
                    Ev.Nombre AS Evento,
                    Pa.FechaRegistro,
                    Pa.Asistencia,
                    Pa.Resultado
                FROM Participa Pa
                INNER JOIN Estudiante E ON Pa.EstudianteID = E.EstudianteID
                INNER JOIN Evento Ev ON Pa.EventoID = Ev.EventoID
                WHERE Pa.EventoID = @EventoID
                ORDER BY E.PrimerNombre
            `);
        res.json(result.recordset);
    } catch (error) {
        console.error("Error en obtenerPorEvento:", error);
        res.status(500).json({ error: error.message });
    }
};

// 🔹 VERIFICAR SI YA EXISTE PARTICIPACIÓN
const verificarParticipacion = async (req, res) => {
    const { estudiante, evento } = req.query;
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('EstudianteID', sql.Int, estudiante)
            .input('EventoID', sql.Int, evento)
            .query(`
                SELECT * FROM Participa 
                WHERE EstudianteID = @EstudianteID AND EventoID = @EventoID
            `);
        res.json({ existe: result.recordset.length > 0 });
    } catch (error) {
        console.error("Error en verificarParticipacion:", error);
        res.status(500).json({ error: error.message });
    }
};

// 🔹 CREAR PARTICIPACIÓN
const registrarParticipacion = async (req, res) => {
    const { EstudianteID, EventoID, Resultado } = req.body;
    
    try {
        const pool = await sql.connect();
        
        // Verificar que el estudiante y evento existan
        const checkEstudiante = await pool.request()
            .input('EstudianteID', sql.Int, EstudianteID)
            .query(`SELECT * FROM Estudiante WHERE EstudianteID = @EstudianteID`);
            
        const checkEvento = await pool.request()
            .input('EventoID', sql.Int, EventoID)
            .query(`SELECT * FROM Evento WHERE EventoID = @EventoID`);
            
        if (checkEstudiante.recordset.length === 0) {
            return res.status(404).json({ error: "Estudiante no encontrado" });
        }
        if (checkEvento.recordset.length === 0) {
            return res.status(404).json({ error: "Evento no encontrado" });
        }
        
        await pool.request()
            .input('EstudianteID', sql.Int, EstudianteID)
            .input('EventoID', sql.Int, EventoID)
            .input('FechaRegistro', sql.Date, new Date())
            .input('Asistencia', sql.Bit, 1)
            .input('Resultado', sql.VarChar, Resultado || null)
            .query(`
                INSERT INTO Participa 
                (EstudianteID, EventoID, FechaRegistro, Asistencia, Resultado)
                VALUES (@EstudianteID, @EventoID, @FechaRegistro, @Asistencia, @Resultado)
            `);
            
        res.json({ message: "Participación registrada exitosamente" });
    } catch (error) {
        console.error("Error en registrarParticipacion:", error);
        res.status(500).json({ error: error.message });
    }
};

// 🔹 ELIMINAR PARTICIPACIÓN
const eliminarParticipacion = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('ParticipaID', sql.Int, id)
            .query(`DELETE FROM Participa WHERE ParticipaID = @ParticipaID`);
            
        res.json({ message: "Participación eliminada exitosamente" });
    } catch (error) {
        console.error("Error en eliminarParticipacion:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    obtenerParticipaciones, 
    obtenerPorEvento,
    verificarParticipacion,
    registrarParticipacion, 
    eliminarParticipacion 
};