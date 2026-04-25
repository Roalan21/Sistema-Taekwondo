const { sql } = require('../db/conexion');

const obtenerProfesores = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query("SELECT * FROM Profesor WHERE Estado = 1");
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const crearProfesor = async (req, res) => {
    const p = req.body;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('PN', sql.VarChar, p.PrimerNombre)
            .input('SN', sql.VarChar, p.SegundoNombre)
            .input('PA', sql.VarChar, p.PrimerApellido)
            .input('SA', sql.VarChar, p.SegundoApellido)
            .input('Estado', sql.Bit, 1)
            .input('FN', sql.Date, p.FechaNacimiento)
            .input('FC', sql.Date, p.FechaContratacion)
            .query(`INSERT INTO Profesor (PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, Estado, FechaNacimiento, FechaContratacion)
                    VALUES (@PN, @SN, @PA, @SA, @Estado, @FN, @FC)`);
        res.json({ message: "Profesor registrado" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const eliminarProfesor = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect();
        await pool.request().input('id', sql.Int, id).query("UPDATE Profesor SET Estado = 0 WHERE ProfesorID = @id");
        res.json({ message: "Profesor inactivado" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const actualizarProfesor = async (req, res) => {
    const { id } = req.params;
    const p = req.body;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, id)
            .input('PN', sql.VarChar, p.PrimerNombre)
            .input('SN', sql.VarChar, p.SegundoNombre)
            .input('PA', sql.VarChar, p.PrimerApellido)
            .input('SA', sql.VarChar, p.SegundoApellido)
            .input('FN', sql.Date, p.FechaNacimiento)
            .query(`UPDATE Profesor SET 
                    PrimerNombre = @PN, SegundoNombre = @SN, 
                    PrimerApellido = @PA, SegundoApellido = @SA, 
                    FechaNacimiento = @FN
                    WHERE ProfesorID = @id`);
        
        res.json({ message: "Profesor actualizado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { obtenerProfesores, crearProfesor, eliminarProfesor, actualizarProfesor };