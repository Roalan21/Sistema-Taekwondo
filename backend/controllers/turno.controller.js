const { sql } = require('../db/conexion');

//  LISTAR
const obtenerTurnos = async (req, res) => {

    try {

        const pool =
            await sql.connect();

        const result =
            await pool.request()
                .query(`
                    SELECT
                        T.TurnoID,
                        T.HoraInicio,
                        T.HoraFin,
                        T.Estado,

                        M.Dia,

                        C.CategoriaID,
                        CAT.Nombre AS CategoriaNombre

                    FROM Turno T

                    LEFT JOIN Modalidad M
                        ON T.TurnoID = M.TurnoID

                    LEFT JOIN Corresponde C
                        ON T.TurnoID = C.TurnoID

                    LEFT JOIN Categoria CAT
                        ON C.CategoriaID = CAT.CategoriaID

                    ORDER BY
                        T.TurnoID DESC
                `);

        res.json(
            result.recordset
        );

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });
    }
};

//  CREAR (Optimizado para evitar el error de OUTPUT con Trigger)
const crearTurno = async (req, res) => {

    const {
        HoraInicio,
        HoraFin,
        Dias,
        Categorias
    } = req.body;

    try {

        const pool = await sql.connect();

        const transaction =
            new sql.Transaction(pool);

        await transaction.begin();

        try {
            // VALIDAR TRASLAPE
            for (const dia of Dias) {

                const conflicto = await transaction.request()
                    .input('HoraInicio', sql.Time, HoraInicio)
                    .input('HoraFin', sql.Time, HoraFin)
                    .input('Dia', sql.VarChar, dia)
                    .query(`
                        SELECT TOP 1 T.TurnoID
                        FROM Turno T
                        INNER JOIN Modalidad M
                            ON T.TurnoID = M.TurnoID
                        WHERE T.Estado = 1
                        AND M.Dia = @Dia
                        AND @HoraInicio < T.HoraFin
                        AND @HoraFin > T.HoraInicio
                    `);

                if (conflicto.recordset.length > 0) {

                    throw new Error(
                        `Ya existe un turno que se traslapa el día ${dia}`
                    );
                }
            }

            // CREAR TURNO
            const result =
                await transaction.request()
                    .input('HI', sql.Time, HoraInicio)
                    .input('HF', sql.Time, HoraFin)
                    .input('Estado', sql.Bit, 1)
                    .query(`
                        INSERT INTO Turno
                        (HoraInicio, HoraFin, Estado)

                        OUTPUT INSERTED.TurnoID

                        VALUES
                        (@HI, @HF, @Estado);
                    `);

            const turnoID =
                result.recordset[0].TurnoID;

            console.log("Turno creado:", turnoID);
            // INSERTAR MODALIDADES
            for (const dia of Dias) {

                await transaction.request()
                    .input('TurnoID', sql.Int, turnoID)
                    .input('Dia', sql.VarChar, dia)
                    .query(`
                        INSERT INTO Modalidad
                        (TurnoID, Dia)

                        VALUES
                        (@TurnoID, @Dia)
                    `);
            }

            // RELACIONAR CATEGORÍAS
            for (const categoria of Categorias) {

                await transaction.request()
                    .input('CategoriaID', sql.Int, categoria)
                    .input('TurnoID', sql.Int, turnoID)
                    .query(`
                        INSERT INTO Corresponde
                        (CategoriaID, TurnoID)

                        VALUES
                        (@CategoriaID, @TurnoID)
                    `);
            }

            await transaction.commit();

            res.json({
                message:
                    "Turno creado correctamente"
            });

        } catch (err) {

            await transaction.rollback();

            throw err;
        }

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });
    }
};
//  ACTUALIZAR
const actualizarTurno = async (req, res) => {

    const { id } = req.params;

    const {
        HoraInicio,
        HoraFin,
        Dias,
        Categorias
    } = req.body;

    try {

        const pool = await sql.connect();

        const transaction =
            new sql.Transaction(pool);

        await transaction.begin();

        try {

            // VALIDAR TRASLAPES
            for (const dia of Dias) {

                const conflicto =
                    await transaction.request()
                        .input(
                            'HoraInicio',
                            sql.Time,
                            HoraInicio
                        )
                        .input(
                            'HoraFin',
                            sql.Time,
                            HoraFin
                        )
                        .input(
                            'Dia',
                            sql.VarChar,
                            dia
                        )
                        .input(
                            'TurnoID',
                            sql.Int,
                            id
                        )
                        .query(`
                            SELECT TOP 1 T.TurnoID

                            FROM Turno T

                            INNER JOIN Modalidad M
                                ON T.TurnoID = M.TurnoID

                            WHERE T.Estado = 1

                            AND T.TurnoID <> @TurnoID

                            AND M.Dia = @Dia

                            AND @HoraInicio < T.HoraFin

                            AND @HoraFin > T.HoraInicio
                        `);

                if (
                    conflicto.recordset.length > 0
                ) {

                    throw new Error(
                        `Ya existe un turno que se traslapa el día ${dia}`
                    );
                }
            }

            // ACTUALIZAR HORARIO
            await transaction.request()
                .input(
                    'TurnoID',
                    sql.Int,
                    id
                )
                .input(
                    'HoraInicio',
                    sql.Time,
                    HoraInicio
                )
                .input(
                    'HoraFin',
                    sql.Time,
                    HoraFin
                )
                .query(`
                    UPDATE Turno

                    SET
                        HoraInicio = @HoraInicio,
                        HoraFin = @HoraFin

                    WHERE TurnoID = @TurnoID
                `);

            // ELIMINAR MODALIDADES ANTERIORES
            await transaction.request()
                .input(
                    'TurnoID',
                    sql.Int,
                    id
                )
                .query(`
                    DELETE FROM Modalidad
                    WHERE TurnoID = @TurnoID
                `);

            // INSERTAR NUEVAS MODALIDADES
            for (const dia of Dias) {

                await transaction.request()
                    .input(
                        'TurnoID',
                        sql.Int,
                        id
                    )
                    .input(
                        'Dia',
                        sql.VarChar,
                        dia
                    )
                    .query(`
                        INSERT INTO Modalidad
                        (
                            TurnoID,
                            Dia
                        )

                        VALUES
                        (
                            @TurnoID,
                            @Dia
                        )
                    `);
            }

            // ELIMINAR CATEGORÍAS ANTERIORES
            await transaction.request()
                .input(
                    'TurnoID',
                    sql.Int,
                    id
                )
                .query(`
                    DELETE FROM Corresponde
                    WHERE TurnoID = @TurnoID
                `);

            // INSERTAR NUEVAS CATEGORÍAS
            for (const categoria of Categorias) {

                await transaction.request()
                    .input(
                        'CategoriaID',
                        sql.Int,
                        categoria
                    )
                    .input(
                        'TurnoID',
                        sql.Int,
                        id
                    )
                    .query(`
                        INSERT INTO Corresponde
                        (
                            CategoriaID,
                            TurnoID
                        )

                        VALUES
                        (
                            @CategoriaID,
                            @TurnoID
                        )
                    `);
            }

            await transaction.commit();

            res.json({
                message:
                    "Turno actualizado correctamente"
            });

        } catch (err) {

            await transaction.rollback();

            throw err;
        }

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });
    }
};
//  ELIMINAR 
const eliminarTurno = async (req, res) => {

    const { id } = req.params;

    try {

        const pool = await sql.connect();

        const transaction =
            new sql.Transaction(pool);

        await transaction.begin();

        try {

            const turnoID = parseInt(id);

            console.log(
                "Eliminando turno:",
                turnoID
            );

            // ELIMINAR MODALIDADES
            await transaction.request()
                .input("id", sql.Int, turnoID)
                .query(`
                    DELETE FROM Modalidad
                    WHERE TurnoID = @id
                `);

            // ELIMINAR RELACIÓN CON PROFESORES
            await transaction.request()
                .input("id", sql.Int, turnoID)
                .query(`
                    DELETE FROM Imparte
                    WHERE TurnoID = @id
                `);

            // ELIMINAR RELACIÓN CON CATEGORÍAS
            await transaction.request()
                .input("id", sql.Int, turnoID)
                .query(`
                    DELETE FROM Corresponde
                    WHERE TurnoID = @id
                `);

            // ELIMINAR TURNO
            await transaction.request()
                .input("id", sql.Int, turnoID)
                .query(`
                    DELETE FROM Turno
                    WHERE TurnoID = @id
                `);

            await transaction.commit();

            res.json({
                message:
                    "Turno eliminado correctamente"
            });

        } catch (err) {

            await transaction.rollback();

            throw err;
        }

    } catch (err) {

        console.error(
            "Error eliminando turno:",
            err
        );

        res.status(500).json({
            error: err.message
        });
    }
};

const obtenerTurnosPorCategoria = async (req, res) => {
    const { categoriaId } = req.params;

    try {
        const pool = await sql.connect();

        const result = await pool.request()
            .input('categoriaId', sql.Int, categoriaId)
            .query(`
                SELECT T.*
                FROM Turno T
                INNER JOIN Corresponde C
                    ON T.TurnoID = C.TurnoID
                WHERE C.CategoriaID = @categoriaId
                AND T.Estado = 1
            `);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { obtenerTurnos, crearTurno, actualizarTurno, eliminarTurno, obtenerTurnosPorCategoria };