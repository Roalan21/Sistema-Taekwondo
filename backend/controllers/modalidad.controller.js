const { sql } = require('../db/conexion');

// 🔥 OBTENER (incluyendo TurnoID)
const obtener = async (req, res) => {
    try {
        const pool = await sql.connect();

        const result = await pool.request().query(`
            SELECT M.ModalidadID, M.TurnoID, M.Dia,
                   T.HoraInicio, T.HoraFin
            FROM Modalidad M
            INNER JOIN Turno T ON M.TurnoID = T.TurnoID
        `);

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 🔥 CREAR MULTIPLE
const crear = async (req, res) => {
    const { TurnoID, Dias } = req.body;

    // Validaciones
    if (!TurnoID || !Dias || !Array.isArray(Dias) || Dias.length === 0) {
        return res.status(400).json({ error: "Se requiere TurnoID y un array Dias no vacío" });
    }

    try {
        const pool = await sql.connect();

        // Verificar si el turno existe
        const turnoExiste = await pool.request()
            .input('turnoId', sql.Int, TurnoID)
            .query("SELECT 1 FROM Turno WHERE TurnoID = @turnoId");
        
        if (turnoExiste.recordset.length === 0) {
            return res.status(404).json({ error: "El turno especificado no existe" });
        }

        // Insertar cada día
        for (let dia of Dias) {
            // Verificar si ya existe para evitar duplicados
            const existe = await pool.request()
                .input('turno', sql.Int, TurnoID)
                .input('dia', sql.VarChar, dia)
                .query("SELECT 1 FROM Modalidad WHERE TurnoID = @turno AND Dia = @dia");
            
            if (existe.recordset.length === 0) {
                await pool.request()
                    .input('turno', sql.Int, TurnoID)
                    .input('dia', sql.VarChar, dia)
                    .query(`
                        INSERT INTO Modalidad (TurnoID, Dia)
                        VALUES (@turno, @dia)
                    `);
            }
        }

        res.json({ message: "Modalidades registradas exitosamente" });

    } catch (err) {
        console.error("Error en crear modalidad:", err);
        res.status(500).json({ error: err.message });
    }
};

// 🔥 ELIMINAR
const eliminar = async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await sql.connect();

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM Modalidad WHERE ModalidadID = @id");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Modalidad no encontrada" });
        }

        res.json({ message: "Modalidad eliminada exitosamente" });

    } catch (err) {
        console.error("Error al eliminar modalidad:", err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { obtener, crear, eliminar };