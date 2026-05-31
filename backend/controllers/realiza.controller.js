const { sql } = require('../db/conexion');

//  OBTENER POR EXAMEN
const obtenerPorExamen = async (req, res) => {

    const { examenId } = req.params;

    try {

        const pool = await sql.connect();

        const result = await pool.request()
            .input("ExamenID", sql.Int, examenId)
            .query(`
                SELECT
                    R.RealizaID,
                    R.EstudianteID,
                    E.Nombres + ' ' + E.Apellidos AS Estudiante,
                    R.ExamenID,
                    Ex.CintaEvaluada,
                    Ex.Fecha,
                    R.Asistencia,
                    R.Nota,
                    R.Resultado,
                    R.FechaRegistro,
                    E.CintaActual
                FROM Realiza R
                INNER JOIN Estudiante E
                    ON E.EstudianteID = R.EstudianteID
                INNER JOIN Examen Ex
                    ON Ex.ExamenID = R.ExamenID
                WHERE R.ExamenID = @ExamenID
                ORDER BY E.Nombres
            `);

        res.json(result.recordset);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
};

//  VERIFICAR
const verificarRealiza = async (req, res) => {

    const { estudiante, examen } = req.query;

    try {

        const pool = await sql.connect();

        const result = await pool.request()
            .input("EstudianteID", sql.Int, estudiante)
            .input("ExamenID", sql.Int, examen)
            .query(`
                SELECT *
                FROM Realiza
                WHERE EstudianteID = @EstudianteID
                AND ExamenID = @ExamenID
            `);

        res.json({
            existe: result.recordset.length > 0
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
};

//  REGISTRAR
const registrarRealiza = async (req, res) => {

    const {
        EstudianteID,
        ExamenID
    } = req.body;

    try {

        const pool = await sql.connect();

        await pool.request()

            .input("EstudianteID", sql.Int, EstudianteID)
            .input("ExamenID", sql.Int, ExamenID)
            .input("FechaRegistro", sql.Date, new Date())
            .input("Asistencia", sql.Bit, 0)
            .input("Nota", sql.Decimal(5,2), null)
            .input("Resultado", sql.VarChar, null)

            .query(`
                INSERT INTO Realiza
                (
                    EstudianteID,
                    ExamenID,
                    Resultado,
                    Asistencia,
                    FechaRegistro,
                    Nota
                )
                VALUES
                (
                    @EstudianteID,
                    @ExamenID,
                    @Resultado,
                    @Asistencia,
                    @FechaRegistro,
                    @Nota
                )
            `);

        res.json({
            message: "Inscripción al examen realizada"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
};

//  ACTUALIZAR
const actualizarRealiza = async (req, res) => {

    const { id } = req.params;

    const {
        Asistencia,
        Nota,
        Resultado,
        NuevaCinta
    } = req.body;

    try {

        const pool = await sql.connect();

        // actualizar realiza
        await pool.request()

            .input("RealizaID", sql.Int, id)
            .input("Asistencia", sql.Bit, Asistencia)
            .input("Nota", sql.Decimal(5,2), Nota)
            .input("Resultado", sql.VarChar, Resultado)

            .query(`
                UPDATE Realiza
                SET
                    Asistencia = @Asistencia,
                    Nota = @Nota,
                    Resultado = @Resultado
                WHERE RealizaID = @RealizaID
            `);

        // si aprobó → cambiar cinta
        if (Resultado === "APROBADO" && NuevaCinta) {

            await pool.request()

                .input("RealizaID", sql.Int, id)
                .input("NuevaCinta", sql.VarChar, NuevaCinta)

                .query(`
                    UPDATE Estudiante
                    SET CintaActual = @NuevaCinta
                    WHERE EstudianteID = (
                        SELECT EstudianteID
                        FROM Realiza
                        WHERE RealizaID = @RealizaID
                    )
                `);
        }

        res.json({
            message: "Examen actualizado correctamente"
        });

    } catch (error) {

        console.error(error);

        let mensaje =
            error.originalError?.info?.message
            || error.message
            || "Error interno";

        mensaje = mensaje
            .replace(
                /\[Microsoft\]\[ODBC Driver 17 for SQL Server\]\[SQL Server\]/g,
                ""
            )
            .trim();

        res.status(500).json({
            error: mensaje
        });
    }
};

//  ELIMINAR
const eliminarRealiza = async (req, res) => {

    const { id } = req.params;

    try {

        const pool = await sql.connect();

        await pool.request()
            .input("RealizaID", sql.Int, id)
            .query(`
                DELETE FROM Realiza
                WHERE RealizaID = @RealizaID
            `);

        res.json({
            message: "Registro eliminado"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    obtenerPorExamen,
    verificarRealiza,
    registrarRealiza,
    actualizarRealiza,
    eliminarRealiza
};