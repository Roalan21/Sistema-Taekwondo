const sql = require('mssql/msnodesqlv8');

const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=Taekwondo;Trusted_Connection=yes;'
};

async function conectar() {
    try {
        await sql.connect(config);
        console.log("Conexión exitosa a la base de datos de Taekwondo 🥋");
    } catch (err) {
        console.error("Error al conectar:", err.message);
    }
}

module.exports = { conectar, sql };