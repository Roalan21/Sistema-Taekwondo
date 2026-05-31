const { sql } = require('../db/conexion');

// LISTAR
const obtenerMensualidades = async (req, res) => {

    const pool = await sql.connect();

    const result = await pool.request().query(`
        SELECT
            M.*,
            E.Nombres + ' ' + E.Apellidos AS Estudiante
        FROM Mensualidad M
        INNER JOIN Estudiante E
            ON M.EstudianteID = E.EstudianteID
        Where E.Estado=1
    `);

    res.json(result.recordset);
};

// OBTENER POR ID
const obtenerPorId = async (req, res) => {

    try {

        const { id } = req.params;

        const pool = await sql.connect();

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT *
                FROM Mensualidad
                WHERE MensualidadID = @id
            `);

        if (result.recordset.length === 0) {

            return res.status(404).json({
                error: 'Mensualidad no encontrada'
            });
        }

        res.json(result.recordset[0]);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });
    }
};



module.exports = {
    obtenerMensualidades,
    obtenerPorId
};