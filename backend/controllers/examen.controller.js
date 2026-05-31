const { sql } = require('../db/conexion');

// LISTAR
const obtenerExamenes = async (req, res) => {

    try {

        const pool = await sql.connect();

        const result = await pool.request().query(`
            SELECT *
            FROM Examen
            ORDER BY Fecha DESC
        `);

        res.json(result.recordset);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
};

// OBTENER UNO
const obtenerExamen = async (req, res) => {

    const { id } = req.params;

    try {

        const pool = await sql.connect();

        const result = await pool.request()
            .input("ExamenID", sql.Int, id)
            .query(`
                SELECT *
                FROM Examen
                WHERE ExamenID = @ExamenID
            `);

        res.json(result.recordset[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
};

// CREAR
const crearExamen = async (req, res) => {

    const {
        Fecha,
        Precio,
        CintaEvaluada
    } = req.body;

    try {

        const pool = await sql.connect();

        await pool.request()

            .input("Fecha", sql.Date, Fecha)
            .input("Precio", sql.Decimal(10,2), Precio)
            .input("CintaEvaluada", sql.VarChar, CintaEvaluada)

            .query(`
                INSERT INTO Examen
                (
                    Fecha,
                    Precio,
                    CintaEvaluada,
                    Estado
                )
                VALUES
                (
                    @Fecha,
                    @Precio,
                    @CintaEvaluada,
                    1
                )
            `);

        res.json({
            message: "Examen creado"
        });

    } catch (error) {

        console.error(error);

        let mensaje = error.message;

        if (mensaje.includes('[SQL Server]')) {

            mensaje =
                mensaje.split('[SQL Server]')[1];
        }

        res.status(500).json({
            error: mensaje
        });
    }
};

// EDITAR
const editarExamen = async (req, res) => {

    const { id } = req.params;

    const {
        Fecha,
        Precio,
        CintaEvaluada
    } = req.body;

    try {

        const pool = await sql.connect();

        await pool.request()

            .input("ExamenID", sql.Int, id)
            .input("Fecha", sql.Date, Fecha)
            .input("Precio", sql.Decimal(10,2), Precio)
            .input("CintaEvaluada", sql.VarChar, CintaEvaluada)

            .query(`
                UPDATE Examen
                SET
                    Fecha = @Fecha,
                    Precio = @Precio,
                    CintaEvaluada = @CintaEvaluada
                WHERE ExamenID = @ExamenID
            `);

        res.json({
            message: "Examen actualizado"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
};

// ELIMINAR
const eliminarExamen = async (req, res) => {

    const { id } = req.params;

    try {

        const pool = await sql.connect();

        await pool.request()
            .input("ExamenID", sql.Int, id)
            .query(`
                DELETE FROM Examen
                WHERE ExamenID = @ExamenID
            `);

        res.json({
            message: "Examen eliminado"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    obtenerExamenes,
    obtenerExamen,
    crearExamen,
    editarExamen,
    eliminarExamen
};