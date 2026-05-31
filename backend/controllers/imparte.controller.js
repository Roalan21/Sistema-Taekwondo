const { sql } = require('../db/conexion');

// 🔹 LISTAR (Corregido)
const obtenerImparte = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query(`
            SELECT I.ImparteID,
                   I.ProfesorID,  -- 👈 AGREGAR ESTO
                   I.TurnoID,     -- 👈 AGREGAR ESTO
                   P.PrimerNombre + ' ' + P.PrimerApellido AS Profesor,
                   T.HoraInicio,
                   T.HoraFin,
                   I.TipoDeClase,
                   I.FechaRegistro
            FROM Imparte I
            INNER JOIN Profesor P ON I.ProfesorID = P.ProfesorID
            INNER JOIN Turno T ON I.TurnoID = T.TurnoID
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 🔹 CREAR
const crearImparte = async (req, res) => {
    const { ProfesorID, TurnoID, TipoDeClase } = req.body;

    try {
        const pool = await sql.connect();
        await pool.request()
            .input('ProfesorID', sql.Int, ProfesorID)
            .input('TurnoID', sql.Int, TurnoID)
            .input('TipoDeClase', sql.VarChar, TipoDeClase)
            .input('FechaRegistro', sql.Date, new Date())
            .query(`
                INSERT INTO Imparte (ProfesorID, TurnoID, TipoDeClase, FechaRegistro)
                VALUES (@ProfesorID, @TurnoID, @TipoDeClase, @FechaRegistro)
            `);

        res.json({ message: "Asignación creada" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 🔹 ELIMINAR
const eliminarImparte = async (req, res) => {
    const { profesorId, turnoId } = req.params;

    try {
        const pool = await sql.connect();

        await pool.request()
            .input('ProfesorID', sql.Int, profesorId)
            .input('TurnoID', sql.Int, turnoId)
            .query(`
                DELETE FROM Imparte
                WHERE ProfesorID = @ProfesorID
                AND TurnoID = @TurnoID
            `);

        res.json({
            message: "Asignación eliminada"
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

module.exports = {
    obtenerImparte,
    crearImparte,
    eliminarImparte
};