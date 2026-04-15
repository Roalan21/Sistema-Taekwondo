const express = require('express');
const cors = require('cors');
const { conectar } = require('./db/conexion');
const estudiantesRoutes = require('./routes/estudiantes.routes');

const app = express();
app.use(cors());
app.use(express.json());

conectar(); // Conexión a DB

app.use('/estudiantes', estudiantesRoutes);

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));