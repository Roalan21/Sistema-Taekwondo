const { sql } = require('../db/conexion');

const obtenerDashboard = async (req, res) => {

    try {

        const pool = await sql.connect();

        
        // TOTAL ESTUDIANTES
        

        const estudiantes =
            await pool.request().query(`
                SELECT COUNT(*) AS Total
                FROM Estudiante
                WHERE Estado = 1
            `);

        
        // INGRESOS DEL MES
        

        const ingresos =
            await pool.request().query(`

                SELECT

                    ISNULL(
                        SUM(Monto),
                        0
                    ) AS Total

                FROM Pago

                WHERE
                    MONTH(FechaPago) =
                        MONTH(GETDATE())

                    AND YEAR(FechaPago) =
                        YEAR(GETDATE())

            `);

        const ingresosPorTipo =
            await pool.request().query(`

                SELECT

                    TipoPago,

                    SUM(Monto) AS Total

                FROM Pago

                GROUP BY TipoPago

            `);

        
        // PRODUCTOS BAJO STOCK
        

        const stock =
            await pool.request().query(`
                SELECT
                    ProductoID,
                    Nombre,
                    StockActual
                FROM Producto
                WHERE StockActual <= 5
            `);

        
        // EVENTOS PRÓXIMOS
        

        const eventos =
            await pool.request().query(`
                SELECT TOP 5
                    EventoID,
                    Nombre,
                    Fecha
                FROM Evento
                WHERE Fecha >= CAST(GETDATE() AS DATE)
                ORDER BY Fecha ASC
            `);

        
        // EXÁMENES PRÓXIMOS
        

        const examenes =
            await pool.request().query(`
                SELECT TOP 5
                    ExamenID,
                    CintaEvaluada,
                    Fecha
                FROM Examen
                WHERE Fecha >= CAST(GETDATE() AS DATE)
                ORDER BY Fecha ASC
            `);
        
        
        // MENSUALIDADES PENDIENTES
        

        const pendientes =
            await pool.request().query(`

                SELECT COUNT(*) AS Total

                FROM Mensualidad M

                INNER JOIN Estudiante E
                    ON E.EstudianteID = M.EstudianteID

                WHERE
                    M.Estado = 'PENDIENTE'
                    AND E.Estado = 1

            `);

        
        // MENSUALIDADES VENCIDAS
        

        const vencidas =
            await pool.request().query(`

                SELECT COUNT(*) AS Total

                FROM Mensualidad M

                INNER JOIN Estudiante E
                    ON E.EstudianteID = M.EstudianteID

                WHERE
                    M.Estado = 'VENCIDA'
                    AND E.Estado = 1

            `);

        
        // ESTADO DE MENSUALIDADES
        

        const estadosMensualidades =
            await pool.request().query(`

                SELECT
                    M.Estado,
                    COUNT(*) AS Total

                FROM Mensualidad M

                INNER JOIN Estudiante E
                    ON E.EstudianteID = M.EstudianteID

                WHERE
                    E.Estado = 1

                GROUP BY
                    M.Estado

            `);
        
        // TOP 5 MOROSOS
        

        const morosos =
            await pool.request().query(`

                SELECT TOP 5

                    E.EstudianteID,

                    E.Nombres,

                    E.Apellidos,

                    COUNT(*) AS TotalPendientes

                FROM Mensualidad M

                INNER JOIN Estudiante E
                    ON E.EstudianteID =
                    M.EstudianteID

                WHERE
                    M.Estado IN
                    (
                        'VENCIDA'
                    )
                    AND E.Estado=1

                GROUP BY

                    E.EstudianteID,
                    E.Nombres,
                    E.Apellidos

                ORDER BY
                    TotalPendientes DESC

            `);
        
        
        // PRÓXIMOS CUMPLEAÑOS
        

        const cumpleanios =
            await pool.request().query(`

                SELECT

                    EstudianteID,
                    Nombres,
                    Apellidos,
                    FechaDeNacimiento

                FROM Estudiante

                WHERE
                    Estado = 1

                    AND MONTH(FechaDeNacimiento) =
                        MONTH(GETDATE())

                ORDER BY
                    DAY(FechaDeNacimiento)

            `);
        
        // PRODUCTOS MÁS VENDIDOS
        

        const productosVendidos =
            await pool.request().query(`
                SELECT TOP 5

                    p.Nombre,

                    SUM(pr.CantidadProducto)
                    AS TotalVendido

                FROM Produce pr

                INNER JOIN Producto p
                    ON p.ProductoID = pr.ProductoID

                GROUP BY p.Nombre

                ORDER BY TotalVendido DESC
            `);

        res.json({

            estudiantes:
                estudiantes.recordset[0].Total,

            ingresos:
                ingresos.recordset[0].Total,
            ingresosPorTipo:
                ingresosPorTipo.recordset,

            stock:
                stock.recordset,

            eventos:
                eventos.recordset,

            examenes:
                examenes.recordset,

            mensualidadesPendientes:
                pendientes.recordset[0].Total,

            mensualidadesVencidas:
                vencidas.recordset[0].Total,
            
            estadosMensualidades:
                estadosMensualidades.recordset,
            morosos:
                morosos.recordset,
            cumpleanios:
                cumpleanios.recordset,

            productosVendidos:
                productosVendidos.recordset
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });
    }
};

module.exports = {
    obtenerDashboard
};