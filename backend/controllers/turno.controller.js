const { sql } = require('../db/conexion');

// 🔍 LISTAR
const obtenerTurnos = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .query("SELECT * FROM Turno");

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ➕ CREAR
const crearTurno = async (req, res) => {
    const { HoraInicio, HoraFin } = req.body;

    try {
        const pool = await sql.connect();

        await pool.request()
            .input('HI', sql.Time, HoraInicio)
            .input('HF', sql.Time, HoraFin)
            .query(`
                INSERT INTO Turno (HoraInicio, HoraFin)
                VALUES (@HI, @HF)
            `);

        res.json({ message: "Turno creado" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✏️ ACTUALIZAR
const actualizarTurno = async (req, res) => {
    const { id } = req.params;
    const { HoraInicio, HoraFin } = req.body;

    try {
        const pool = await sql.connect();

        await pool.request()
            .input('id', sql.Int, id)
            .input('HI', sql.Time, HoraInicio)
            .input('HF', sql.Time, HoraFin)
            .query(`
                UPDATE Turno
                SET HoraInicio = @HI,
                    HoraFin = @HF
                WHERE TurnoID = @id
            `);

        res.json({ message: "Turno actualizado" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 🗑️ ELIMINAR (simple)
const eliminarTurno = async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await sql.connect();

        await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM Turno WHERE TurnoID = @id");

        res.json({ message: "Turno eliminado" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    obtenerTurnos,
    crearTurno,
    actualizarTurno,
    eliminarTurno
};