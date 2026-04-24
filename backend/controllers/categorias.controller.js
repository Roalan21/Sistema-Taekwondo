const { sql } = require('../db/conexion');

const getCategorias = async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Categoria');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getCategorias };