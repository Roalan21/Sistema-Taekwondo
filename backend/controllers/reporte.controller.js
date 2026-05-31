const { sql } = require("../db/conexion");

const ingresosPorFecha = async (req, res) => {
    const { desde, hasta } = req.query;

    try {
        const pool = await sql.connect();

        const result = await pool.request()
            .input("desde", sql.Date, desde)
            .input("hasta", sql.Date, hasta)
            .query(`
                SELECT
                    R.Tipo,
                    COUNT(*) AS Cantidad,
                    SUM(R.TotalFinal) AS Total
                FROM Recibo R
                WHERE R.FechaEmision BETWEEN @desde AND @hasta
                GROUP BY R.Tipo
                ORDER BY Total DESC
            `);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const mensualidadesReporte = async (req, res) => {
    try {
        const pool = await sql.connect();

        const result = await pool.request().query(`
            SELECT
                M.Estado,
                COUNT(*) AS Cantidad,
                SUM(M.Precio) AS Total
            FROM Mensualidad M
            INNER JOIN Estudiante E
                ON M.EstudianteID = E.EstudianteID
            WHERE E.Estado = 1
            GROUP BY M.Estado
        `);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const estudiantesMorosos = async (req, res) => {
    try {
        const pool = await sql.connect();

        const result = await pool.request().query(`
            SELECT
                E.EstudianteID,
                E.Nombres,
                E.Apellidos,
                COUNT(M.MensualidadID) AS TotalPendientes,
                SUM(M.Precio) AS TotalDebe
            FROM Estudiante E
            INNER JOIN Mensualidad M
                ON E.EstudianteID = M.EstudianteID
            WHERE
                E.Estado = 1
                AND M.Estado IN ('VENCIDA')
            GROUP BY
                E.EstudianteID,
                E.Nombres,
                E.Apellidos
            ORDER BY TotalDebe DESC
        `);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const productosMasVendidos = async (req, res) => {
    const { desde, hasta } = req.query;

    try {
        const pool = await sql.connect();

        const result = await pool.request()
            .input("desde", sql.Date, desde)
            .input("hasta", sql.Date, hasta)
            .query(`
                SELECT
                    P.Nombre,
                    SUM(PR.CantidadProducto) AS CantidadVendida,
                    SUM(PR.CantidadProducto * PR.PrecioUnitario) AS TotalVendido
                FROM Produce PR
                INNER JOIN Producto P
                    ON PR.ProductoID = P.ProductoID
                INNER JOIN Venta V
                    ON PR.VentaID = V.VentaID
                WHERE V.Fecha BETWEEN @desde AND @hasta
                GROUP BY P.Nombre
                ORDER BY CantidadVendida DESC
            `);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    ingresosPorFecha,
    mensualidadesReporte,
    estudiantesMorosos,
    productosMasVendidos
};