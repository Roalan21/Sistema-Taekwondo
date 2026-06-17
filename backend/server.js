const path = require("path");
const express = require('express');
const cors = require('cors');
const { conectar, sql, config } = require('./db/conexion');
const estudiantesRoutes = require('./routes/estudiantes.routes');
const categoriasRoutes = require('./routes/categorias.routes');
const profesoresRoutes =  require('./routes/profesor.routes');
const turnoRoutes = require('./routes/turno.routes');
const modalidadRoutes = require('./routes/modalidad.routes');
const imparteRoutes = require('./routes/imparte.routes');
const eventoRoutes = require('./routes/evento.routes');
const participaRoutes = require('./routes/participa.routes');
const mensualidadRoutes = require('./routes/mensualidad.routes');
const reciboRoutes = require('./routes/recibo.routes');
const pagoRoutes = require('./routes/pago.routes');
const generaRoutes = require('./routes/genera.routes');
const metodoPagoRoutes = require('./routes/metodoPago.routes');
const examenRoutes = require('./routes/examen.routes');
const tusahRoutes = require('./routes/tusah.routes');
const productoRoutes = require('./routes/producto.routes');
const salidasRoutes = require('./routes/salidas.routes');
const inventarioRoutes = require('./routes/inventario.routes');
const realizaRoutes = require('./routes/realiza.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));
// Definición de Rutas (Ordenadas)
app.use('/estudiantes', estudiantesRoutes);
app.use('/categorias', categoriasRoutes);
app.use('/profesores', profesoresRoutes);
app.use('/turnos', turnoRoutes);
app.use('/modalidades', modalidadRoutes);
app.use('/imparte', imparteRoutes);
app.use('/eventos', eventoRoutes);
app.use('/examenes', examenRoutes);
app.use('/participa', participaRoutes);
app.use('/mensualidades', mensualidadRoutes);
app.use('/recibos', reciboRoutes);
app.use('/pagos', pagoRoutes);
app.use('/genera', generaRoutes);
app.use('/metodos-pago', metodoPagoRoutes);
app.use('/tusah', tusahRoutes);
app.use('/productos', productoRoutes);
app.use('/salidas', salidasRoutes);
app.use('/inventario', inventarioRoutes);
app.use('/realiza', realizaRoutes);
app.use('/dashboard', dashboardRoutes);
app.use("/reportes", require("./routes/reporte.routes"));
// Ruta de prueba rápida
// Ruta principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

async function actualizarMensualidades() {

    try {

        const pool = await sql.connect(config);

        await pool.request()
            .execute("sp_ActualizarMensualidadesVencidas");

        console.log(
            "✅ Mensualidades vencidas actualizadas"
        );

    } catch (error) {

        console.error(
            "Error actualizando mensualidades:",
            error
        );
    }
}



// Función de inicio sincronizada
async function iniciarServidor() {
    try {
        await conectar(); // Primero conectamos a la DB
        await actualizarMensualidades();
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log('---------------------------------------');
            console.log(' SISTEMA TAEKWONDO - UNI 2026');
            console.log('Servidor listo en: http://localhost:3000');
            console.log(`Servidor listo en puerto ${PORT}`);
            console.log('---------------------------------------');
        });
    } catch (error) {
        console.error("No se pudo iniciar el sistema:", error);
    }
}

iniciarServidor();