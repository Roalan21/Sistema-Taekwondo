const express = require('express');
const cors = require('cors');
const { conectar } = require('./db/conexion');
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

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Definición de Rutas (Ordenadas)
app.use('/estudiantes', estudiantesRoutes);
app.use('/categorias', categoriasRoutes);
app.use('/profesores', profesoresRoutes);
app.use('/turnos', turnoRoutes);
app.use('/modalidades', modalidadRoutes);
app.use('/imparte', imparteRoutes);
app.use('/eventos', eventoRoutes);
app.use('/participa', participaRoutes);
app.use('/mensualidades', mensualidadRoutes);
app.use('/recibos', reciboRoutes);
app.use('/pagos', pagoRoutes);
app.use('/genera', generaRoutes);
app.use('/metodos-pago', metodoPagoRoutes);

// Ruta de prueba rápida
app.get('/', (req, res) => res.send("Servidor Activo 🥋"));

// Función de inicio sincronizada
async function iniciarServidor() {
    try {
        await conectar(); // Primero conectamos a la DB
        app.listen(3000, () => {
            console.log('---------------------------------------');
            console.log(' SISTEMA TAEKWONDO - UNI 2026');
            console.log('Servidor listo en: http://localhost:3000');
            console.log('---------------------------------------');
        });
    } catch (error) {
        console.error("No se pudo iniciar el sistema:", error);
    }
}

iniciarServidor();