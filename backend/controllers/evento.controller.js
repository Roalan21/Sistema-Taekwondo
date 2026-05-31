// controllers/evento.controller.js
const { sql } = require('../db/conexion');

// LISTAR TODOS
const obtenerEventos = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query(`
            SELECT * FROM Evento ORDER BY Fecha DESC
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error("Error en obtenerEventos:", error);
        res.status(500).json({ error: error.message });
    }
};

// OBTENER POR ID
const obtenerEventoPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('EventoID', sql.Int, id)
            .query(`SELECT * FROM Evento WHERE EventoID = @EventoID`);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Evento no encontrado" });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        console.error("Error en obtenerEventoPorId:", error);
        res.status(500).json({ error: error.message });
    }
};

const crearEvento = async (req, res) => {
    const { Nombre, Lugar, Fecha, Descripcion, Precio, PagoID, Estado } = req.body;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('Nombre', sql.VarChar, Nombre)
            .input('Lugar', sql.VarChar, Lugar)
            .input('Fecha', sql.Date, Fecha)
            .input('Descripcion', sql.VarChar, Descripcion || '')
            .input('Precio', sql.Decimal(10,2), Precio)
            .input('Estado', sql.Bit, Estado || 1)
            .query(`
                INSERT INTO Evento (Nombre, Lugar, Fecha, Descripcion, Precio, Estado)
                VALUES (@Nombre, @Lugar, @Fecha, @Descripcion, @Precio, @Estado)
            `);
        res.json({ message: "Evento creado" });
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
// ACTUALIZAR
const actualizarEvento = async (req, res) => {
    const { id } = req.params;
    const { Nombre, Lugar, Fecha, Descripcion, Precio } = req.body;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('EventoID', sql.Int, id)
            .input('Nombre', sql.VarChar, Nombre)
            .input('Lugar', sql.VarChar, Lugar)
            .input('Fecha', sql.Date, Fecha)
            .input('Descripcion', sql.VarChar, Descripcion || '')
            .input('Precio', sql.Decimal(10,2), Precio)
            .query(`
                UPDATE Evento 
                SET Nombre = @Nombre, Lugar = @Lugar, Fecha = @Fecha, 
                    Descripcion = @Descripcion, Precio = @Precio
                WHERE EventoID = @EventoID
            `);
        res.json({ message: "Evento actualizado" });
    } catch (error) {
        console.error("Error en actualizarEvento:", error);
        res.status(500).json({ error: error.message });
    }
};

// ELIMINAR
const eliminarEvento = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect();
        
        // Primero eliminar participaciones asociadas
        await pool.request()
            .input('EventoID', sql.Int, id)
            .query(`DELETE FROM Participa WHERE EventoID = @EventoID`);
        
        // Luego eliminar el evento
        await pool.request()
            .input('EventoID', sql.Int, id)
            .query(`DELETE FROM Evento WHERE EventoID = @EventoID`);
        
        res.json({ message: "Evento eliminado" });
    } catch (error) {
        console.error("Error en eliminarEvento:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerEventos, obtenerEventoPorId, crearEvento, actualizarEvento, eliminarEvento };