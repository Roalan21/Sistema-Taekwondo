const { sql } = require('../db/conexion');

// Solo profesores ACTIVOS (Estado = 1)
const obtenerProfesores = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query("SELECT * FROM Profesor WHERE Estado = 1 ORDER BY ProfesorID DESC");
        res.json(result.recordset);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

//  NUEVO: TODOS los profesores (activos e inactivos)
const obtenerTodosProfesores = async (req, res) => {
    try {
        const pool = await sql.connect();
        console.log("🔍 Consultando TODOS los profesores...");
        const result = await pool.request().query("SELECT * FROM Profesor ORDER BY ProfesorID DESC");
        console.log(`✅ Encontrados ${result.recordset.length} profesores en total`);
        res.json(result.recordset);
    } catch (err) { 
        console.error("❌ Error en obtenerTodosProfesores:", err);
        res.status(500).json({ error: err.message }); 
    }
};

//  NUEVO: Solo profesores INACTIVOS (Estado = 0)
const obtenerProfesoresInactivos = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query("SELECT * FROM Profesor WHERE Estado = 0 ORDER BY ProfesorID DESC");
        res.json(result.recordset);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

const crearProfesor = async (req, res) => {
    const p = req.body;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('PN', sql.VarChar, p.PrimerNombre)
            .input('SN', sql.VarChar, p.SegundoNombre || null)
            .input('PA', sql.VarChar, p.PrimerApellido)
            .input('SA', sql.VarChar, p.SegundoApellido || null)
            .input('Estado', sql.Bit, 1)
            .input('FN', sql.Date, p.FechaNacimiento)
            .input('FC', sql.Date, p.FechaContratacion)
            .query(`INSERT INTO Profesor (PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, Estado, FechaNacimiento, FechaContratacion)
                    VALUES (@PN, @SN, @PA, @SA, @Estado, @FN, @FC)`);
        res.json({ message: "Profesor registrado" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

const eliminarProfesor = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect();
        await pool.request().input('id', sql.Int, id).query("UPDATE Profesor SET Estado = 0 WHERE ProfesorID = @id");
        res.json({ message: "Profesor inactivado" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

const reactivarProfesor = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect();
        await pool.request().input('id', sql.Int, id).query("UPDATE Profesor SET Estado = 1 WHERE ProfesorID = @id");
        res.json({ message: "Profesor reactivado" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

const actualizarProfesor = async (req, res) => {
    const { id } = req.params;
    const p = req.body;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, id)
            .input('PN', sql.VarChar, p.PrimerNombre)
            .input('SN', sql.VarChar, p.SegundoNombre || null)
            .input('PA', sql.VarChar, p.PrimerApellido)
            .input('SA', sql.VarChar, p.SegundoApellido || null)
            .input('FN', sql.Date, p.FechaNacimiento)
            .query(`UPDATE Profesor SET 
                    PrimerNombre = @PN, 
                    SegundoNombre = @SN, 
                    PrimerApellido = @PA, 
                    SegundoApellido = @SA, 
                    FechaNacimiento = @FN
                    WHERE ProfesorID = @id`);
        
        res.json({ message: "Profesor actualizado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { 
    obtenerProfesores, 
    obtenerTodosProfesores,
    obtenerProfesoresInactivos,
    crearProfesor, 
    eliminarProfesor, 
    reactivarProfesor,
    actualizarProfesor 
};