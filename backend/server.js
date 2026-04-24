const express = require('express');
const cors = require('cors');
const { conectar } = require('./db/conexion');
const estudiantesRoutes = require('./routes/estudiantes.routes');
const categoriasRoutes = require('./routes/categorias.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Definición de Rutas (Ordenadas)
app.use('/estudiantes', estudiantesRoutes);
app.use('/categorias', categoriasRoutes);

// Ruta de prueba rápida
app.get('/ping', (req, res) => res.send("Servidor Activo 🥋"));

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