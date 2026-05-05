const { sql } = require('../db/conexion');

const obtenerProveedores = async (req, res) => {
    try {
        const pool = await sql.connect();

        const result = await pool.request().query(`
            SELECT TusahID, Fecha
            FROM Tusah
        `);

        res.json(result.recordset);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { obtenerProveedores };