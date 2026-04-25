const { sql } = require('../db/conexion');

// 🔥 OBTENER
const obtener = async (req, res) => {
    try {
        const pool = await sql.connect();

        const result = await pool.request().query(`
            SELECT M.ModalidadID, M.Dia,
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

    try {
        const pool = await sql.connect();

        for (let dia of Dias) {
            await pool.request()
                .input('turno', sql.Int, TurnoID)
                .input('dia', sql.VarChar, dia)
                .query(`
                    INSERT INTO Modalidad (TurnoID, Dia)
                    VALUES (@turno, @dia)
                `);
        }

        res.json({ message: "Modalidades registradas" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 🔥 ELIMINAR
const eliminar = async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await sql.connect();

        await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM Modalidad WHERE ModalidadID = @id");

        res.json({ message: "Eliminado" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


module.exports = { obtener, crear, eliminar };