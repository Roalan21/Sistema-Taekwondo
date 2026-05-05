const { sql } = require('../db/conexion');

// 🔹 obtener examenes
const obtenerExamenes = async (req, res) => {
    try {
        const pool = await sql.connect();

        const result = await pool.request().query(`
            SELECT ExamenID, Fecha, Precio
            FROM Examen
            ORDER BY Fecha DESC
        `);

        res.json(result.recordset);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { obtenerExamenes };