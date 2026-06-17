const sql = require('mssql');

const config = {
    user: 'adminTaekwondo',
    password: 'wgwBsiyZ7V3GGg@',
    server: 'taekwondo-server-nazareth.database.windows.net',
    database: 'Taekwondoimportada',
    port: 1433,
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

async function conectar() {
    try {
        await sql.connect(config);
        console.log("Conexión exitosa a Azure SQL 🥋");
    } catch (err) {
        console.error("Error al conectar:", err.message);
    }
}

module.exports = { conectar, sql, config };