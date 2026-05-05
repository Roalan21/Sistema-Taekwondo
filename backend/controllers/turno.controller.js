const { sql } = require('../db/conexion');

// 🔍 LISTAR
const obtenerTurnos = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .query("SELECT * FROM Turno ORDER BY TurnoID DESC");
        
        console.log(`Se encontraron ${result.recordset.length} turnos`);
        res.json(result.recordset);
    } catch (err) {
        console.error("Error al obtener turnos:", err);
        res.status(500).json({ error: err.message });
    }
};

// ➕ CREAR
const crearTurno = async (req, res) => {
    const { HoraInicio, HoraFin } = req.body;
    
    console.log(`Intentando crear turno: ${HoraInicio} - ${HoraFin}`);

    // Validar que las horas no sean iguales
    if (HoraInicio === HoraFin) {
        return res.status(400).json({ error: "La hora de inicio no puede ser igual a la hora de fin" });
    }

    try {
        const pool = await sql.connect();

        // Verificar si ya existe un turno con el mismo horario
        const existe = await pool.request()
            .input('HI', sql.Time, HoraInicio)
            .input('HF', sql.Time, HoraFin)
            .query(`
                SELECT COUNT(*) as count 
                FROM Turno 
                WHERE HoraInicio = @HI AND HoraFin = @HF
            `);

        if (existe.recordset[0].count > 0) {
            return res.status(400).json({ error: "Ya existe un turno con este horario" });
        }

        // Insertar el nuevo turno
        const result = await pool.request()
            .input('HI', sql.Time, HoraInicio)
            .input('HF', sql.Time, HoraFin)
            .input('Estado', sql.Bit, 1)
            .query(`
                INSERT INTO Turno (HoraInicio, HoraFin, Estado)
                OUTPUT INSERTED.TurnoID
                VALUES (@HI, @HF, @Estado)
            `);

        const nuevoId = result.recordset[0].TurnoID;
        console.log(`Turno creado con ID: ${nuevoId}`);
        
        res.json({ 
            message: "Turno creado exitosamente",
            turnoId: nuevoId 
        });

    } catch (err) {
        console.error("Error detallado al crear turno:", err);
        
        // Manejar errores específicos de SQL Server
        if (err.message.includes("Violation of UNIQUE KEY")) {
            res.status(400).json({ error: "Ya existe un turno con este horario" });
        } else {
            res.status(500).json({ error: `Error al crear turno: ${err.message}` });
        }
    }
};

// ✏️ ACTUALIZAR
const actualizarTurno = async (req, res) => {
    const { id } = req.params;
    const { HoraInicio, HoraFin } = req.body;

    try {
        const pool = await sql.connect();

        // Verificar si existe
        const existe = await pool.request()
            .input('id', sql.Int, id)
            .query("SELECT TurnoID FROM Turno WHERE TurnoID = @id");
        
        if (existe.recordset.length === 0) {
            return res.status(404).json({ error: "Turno no encontrado" });
        }

        // Verificar duplicados excluyendo el turno actual
        const duplicado = await pool.request()
            .input('id', sql.Int, id)
            .input('HI', sql.Time, HoraInicio)
            .input('HF', sql.Time, HoraFin)
            .query(`
                SELECT COUNT(*) as count 
                FROM Turno 
                WHERE HoraInicio = @HI AND HoraFin = @HF 
                AND TurnoID != @id
            `);

        if (duplicado.recordset[0].count > 0) {
            return res.status(400).json({ error: "Ya existe otro turno con este horario" });
        }

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
        console.error("Error al actualizar turno:", err);
        res.status(500).json({ error: err.message });
    }
};

const eliminarTurno = async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await sql.connect();
        const transaction = new sql.Transaction(pool);

        await transaction.begin();

        try {
            await transaction.request()
                .input("id", sql.Int, id)
                .query("DELETE FROM Modalidad WHERE TurnoID = @id");

            await transaction.request()
                .input("id", sql.Int, id)
                .query("DELETE FROM Imparte WHERE TurnoID = @id");

            await transaction.request()
                .input("id", sql.Int, id)
                .query("DELETE FROM Turno WHERE TurnoID = @id");

            await transaction.commit();

            res.json({ message: "Turno eliminado correctamente" });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    obtenerTurnos,
    crearTurno,
    actualizarTurno,
    eliminarTurno
};