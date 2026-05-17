const { sql } = require('../db/conexion');

// 🔍 LISTAR
const obtenerTurnos = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .query("SELECT * FROM Turno ORDER BY TurnoID DESC");
        
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ➕ CREAR (Optimizado para evitar el error de OUTPUT con Trigger)
const crearTurno = async (req, res) => {
    const { HoraInicio, HoraFin } = req.body;
    
    if (HoraInicio === HoraFin) {
        return res.status(400).json({ error: "La hora de inicio no puede ser igual a la hora de fin" });
    }

    try {
        const pool = await sql.connect();

        // 1. Quitamos el OUTPUT del INSERT
        const resultInsert = await pool.request()
            .input('HI', sql.Time, HoraInicio)
            .input('HF', sql.Time, HoraFin)
            .input('Estado', sql.Bit, 1)
            .query(`
                INSERT INTO Turno (HoraInicio, HoraFin, Estado)
                VALUES (@HI, @HF, @Estado);
                
                -- 2. Pedimos el último ID generado manualmente
                SELECT SCOPE_IDENTITY() AS TurnoID;
            `);

        // El ID ahora estará en resultInsert.recordset[0].TurnoID
        const nuevoId = resultInsert.recordset[0].TurnoID;

        res.json({ 
            message: "Turno creado exitosamente",
            turnoId: nuevoId 
        });

    } catch (err) {
        if (err.message.includes("traslapa")) {
            return res.status(400).json({ error: "Este horario choca con otro turno ya existente" });
        }
        
        console.error("Error al crear turno:", err);
        res.status(500).json({ error: `Error del servidor: ${err.message}` });
    }
};

// ✏️ ACTUALIZAR
const actualizarTurno = async (req, res) => {
    const { id } = req.params;
    const { HoraInicio, HoraFin } = req.body;

    try {
        const pool = await sql.connect();

        // Nota: El trigger 'INSTEAD OF INSERT' no afecta al UPDATE.
        // Si quieres que el UPDATE también valide traslapes, necesitarías un trigger 'INSTEAD OF UPDATE'.
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

        res.json({ message: "Turno actualizado exitosamente" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 🗑️ ELIMINAR (Se mantiene igual)
const eliminarTurno = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            await transaction.request().input("id", sql.Int, id).query("DELETE FROM Modalidad WHERE TurnoID = @id");
            await transaction.request().input("id", sql.Int, id).query("DELETE FROM Imparte WHERE TurnoID = @id");
            await transaction.request().input("id", sql.Int, id).query("DELETE FROM Corresponde WHERE TurnoID = @id");
            await transaction.request().input("id", sql.Int, id).query("DELETE FROM Turno WHERE TurnoID = @id");
            await transaction.commit();
            res.json({ message: "Turno eliminado correctamente" });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { obtenerTurnos, crearTurno, actualizarTurno, eliminarTurno };