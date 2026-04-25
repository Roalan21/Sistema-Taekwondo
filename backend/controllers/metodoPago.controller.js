const { sql } = require('../db/conexion');

const obtenerMetodos = async (req, res) => {
    const pool = await sql.connect();
    const result = await pool.request().query("SELECT * FROM MetodoPago");
    res.json(result.recordset);
};

module.exports = { obtenerMetodos };