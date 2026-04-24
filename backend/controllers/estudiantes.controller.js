const { sql } = require('../db/conexion');

const obtenerTodos = async (req, res) => {
    try {
        const pool = await sql.connect(); 
        const result = await pool.request().query(`
            SELECT E.*, C.Nombre AS NombreCategoria,
                   ISNULL(N.TodasLasNacionalidades, 'Nicaragüense') AS TodasLasNacionalidades,
                   ISNULL(T.TodosLosTelefonos, 'Sin teléfono') AS TodosLosTelefonos
            FROM Estudiante E
            LEFT JOIN Categoria C ON E.CategoriaID = C.CategoriaID
            LEFT JOIN (
                SELECT EstudianteID, STRING_AGG(Pais, ', ') AS TodasLasNacionalidades
                FROM Nacionalidad GROUP BY EstudianteID
            ) N ON E.EstudianteID = N.EstudianteID
            LEFT JOIN (
                SELECT EstudianteID, STRING_AGG(Numero, ' / ') AS TodosLosTelefonos
                FROM Telefono GROUP BY EstudianteID
            ) T ON E.EstudianteID = T.EstudianteID
            WHERE E.Estado = 1
            ORDER BY E.FechaDeIngreso DESC;
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
};
//creamos para obetener solo a uno por id y luego usarlo en la parte de editar
const obtenerPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT E.*, 
                ISNULL((SELECT STRING_AGG(Pais, ', ') FROM Nacionalidad WHERE EstudianteID = E.EstudianteID), '') AS TodasLasNacionalidades,
                ISNULL((SELECT STRING_AGG(Numero, ', ') FROM Telefono WHERE EstudianteID = E.EstudianteID), '') AS TodosLosTelefonos
                FROM Estudiante E WHERE E.EstudianteID = @id
            `);
        res.json(result.recordset[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const crearEstudiante = async (req, res) => {
    const d = req.body;
    const pool = await sql.connect();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const resultEst = await transaction.request()
            .input('CategoriaID', sql.Int, d.CategoriaID)
            .input('PrimerNombre', sql.VarChar, d.PrimerNombre)
            .input('SegundoNombre', sql.VarChar, d.SegundoNombre)
            .input('PrimerApellido', sql.VarChar, d.PrimerApellido)
            .input('SegundoApellido', sql.VarChar, d.SegundoApellido)
            .input('FechaDeNacimiento', sql.Date, d.FechaDeNacimiento)
            .input('ComoSupo', sql.VarChar, d.ComoSupo || 'No especificado')
            .input('NomMadreOPadre', sql.VarChar, d.NomMadreOPadre)
            .input('ApellMadreOPadre', sql.VarChar, d.ApellMadreOPadre)
            .input('Ciudad', sql.VarChar, d.Ciudad)
            .input('Barrio', sql.VarChar, d.Barrio || '')
            .input('Distrito', sql.VarChar, d.Distrito || '')
            .input('FechaDeIngreso', sql.Date, d.FechaDeIngreso)
            .input('EnfermedadoAlergia', sql.VarChar, d.EnfermedadoAlergia || 'Ninguna')
            .input('PermiteFoto', sql.Bit, d.PermiteFoto)
            .input('Estado', sql.Bit, 1)
            .input('CintaActual', sql.VarChar, d.CintaActual)
            .input('TelefonoDeEmergencia', sql.VarChar, d.TelefonoDeEmergencia)
            .input('FacebookPadreOMadre', sql.VarChar, d.FacebookPadreOMadre || '')
            .input('Peso', sql.Float, d.Peso || 0)
            .query(`INSERT INTO Estudiante 
                (CategoriaID, PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, FechaDeNacimiento, ComoSupo, NomMadreOPadre, ApellMadreOPadre, Ciudad, Barrio, Distrito, FechaDeIngreso, EnfermedadoAlergia, PermiteFoto, Estado, CintaActual, TelefonoDeEmergencia, FacebookPadreOMadre, Peso)
                OUTPUT INSERTED.EstudianteID
                VALUES 
                (@CategoriaID, @PrimerNombre, @SegundoNombre, @PrimerApellido, @SegundoApellido, @FechaDeNacimiento, @ComoSupo, @NomMadreOPadre, @ApellMadreOPadre, @Ciudad, @Barrio, @Distrito, @FechaDeIngreso, @EnfermedadoAlergia, @PermiteFoto, @Estado, @CintaActual, @TelefonoDeEmergencia, @FacebookPadreOMadre, @Peso)`);

        const nuevoID = resultEst.recordset[0].EstudianteID;

        // INSERTAR NACIONALIDADES AL CREAR
        if (d.NacionalidadesArr && d.NacionalidadesArr.length > 0) {
            for (let nac of d.NacionalidadesArr) {
                await transaction.request().input('id', sql.Int, nuevoID).input('p', sql.VarChar, nac).query("INSERT INTO Nacionalidad (EstudianteID, Pais) VALUES (@id, @p)");
            }
        }

        // INSERTAR TELÉFONOS AL CREAR (Aquí estaba el olvido)
        if (d.TelefonosArr && d.TelefonosArr.length > 0) {
            for (let tel of d.TelefonosArr) {
                await transaction.request().input('id', sql.Int, nuevoID).input('tel', sql.VarChar, tel).query("INSERT INTO Telefono (EstudianteID, Numero) VALUES (@id, @tel)");
            }
        }

        await transaction.commit();
        res.json({ message: "Atleta registrado con éxito" });
    } catch (err) { await transaction.rollback(); res.status(500).json({ error: err.message }); }
};

const actualizarEstudiante = async (req, res) => {
    const { id } = req.params;
    const d = req.body;
    const pool = await sql.connect();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        await transaction.request()
            .input('id', sql.Int, id)
            .input('CategoriaID', sql.Int, d.CategoriaID)
            .input('PrimerNombre', sql.VarChar, d.PrimerNombre)
            .input('SegundoNombre', sql.VarChar, d.SegundoNombre)
            .input('PrimerApellido', sql.VarChar, d.PrimerApellido)
            .input('SegundoApellido', sql.VarChar, d.SegundoApellido)
            .input('FechaDeNacimiento', sql.Date, d.FechaDeNacimiento)
            .input('Peso', sql.Float, d.Peso || 0)
            .input('CintaActual', sql.VarChar, d.CintaActual)
            .input('PermiteFoto', sql.Bit, d.PermiteFoto)
            .input('Ciudad', sql.VarChar, d.Ciudad)
            .input('Barrio', sql.VarChar, d.Barrio || '')
            .input('Distrito', sql.VarChar, d.Distrito || '')
            .input('ComoSupo', sql.VarChar, d.ComoSupo || 'No especificado')
            .input('NomMadreOPadre', sql.VarChar, d.NomMadreOPadre)
            .input('ApellMadreOPadre', sql.VarChar, d.ApellMadreOPadre)
            .input('TelefonoDeEmergencia', sql.VarChar, d.TelefonoDeEmergencia)
            .input('FacebookPadreOMadre', sql.VarChar, d.FacebookPadreOMadre || '')
            .input('EnfermedadoAlergia', sql.VarChar, d.EnfermedadoAlergia || 'Ninguna')
            .query(`UPDATE Estudiante SET 
                    CategoriaID=@CategoriaID, PrimerNombre=@PrimerNombre, SegundoNombre=@SegundoNombre, 
                    PrimerApellido=@PrimerApellido, SegundoApellido=@SegundoApellido,
                    FechaDeNacimiento=@FechaDeNacimiento, Peso=@Peso, CintaActual=@CintaActual, 
                    PermiteFoto=@PermiteFoto, Ciudad=@Ciudad, Barrio=@Barrio, Distrito=@Distrito, 
                    ComoSupo=@ComoSupo, NomMadreOPadre=@NomMadreOPadre, ApellMadreOPadre=@ApellMadreOPadre, 
                    TelefonoDeEmergencia=@TelefonoDeEmergencia, FacebookPadreOMadre=@FacebookPadreOMadre, 
                    EnfermedadoAlergia=@EnfermedadoAlergia
                    WHERE EstudianteID = @id`);
        
        // ACTUALIZAR NACIONALIDADES (Solo si vienen datos nuevos)
        if (d.NacionalidadesArr && d.NacionalidadesArr.length > 0) {
            await transaction.request().input('id', sql.Int, id).query("DELETE FROM Nacionalidad WHERE EstudianteID=@id");
            for (let nac of d.NacionalidadesArr) {
                await transaction.request().input('id', sql.Int, id).input('p', sql.VarChar, nac).query("INSERT INTO Nacionalidad (EstudianteID, Pais) VALUES (@id, @p)");
            }
        }

        // ACTUALIZAR TELÉFONOS (Solo si vienen datos nuevos)
        if (d.TelefonosArr && d.TelefonosArr.length > 0) {
            await transaction.request().input('id', sql.Int, id).query("DELETE FROM Telefono WHERE EstudianteID=@id");
            for (let tel of d.TelefonosArr) {
                await transaction.request().input('id', sql.Int, id).input('tel', sql.VarChar, tel).query("INSERT INTO Telefono (EstudianteID, Numero) VALUES (@id, @tel)");
            }
        }

        await transaction.commit();
        res.json({ message: "Actualizado correctamente" });
    } catch (err) { await transaction.rollback(); res.status(500).json({ error: err.message }); }
};
//no se elimina solo se cambia el estado
const eliminarEstudiante = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect();
        await pool.request().input('id', sql.Int, id).query("UPDATE Estudiante SET Estado = 0 WHERE EstudianteID = @id");
        res.json({ message: "Inactivado" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { obtenerTodos, obtenerPorId, crearEstudiante, actualizarEstudiante, eliminarEstudiante };