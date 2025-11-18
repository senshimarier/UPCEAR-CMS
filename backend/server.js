// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path'); // <-- AÑADE ESTA LÍNEA (Módulo nativo de Node)

// Cargar variables de entorno y conectar DB
dotenv.config();
connectDB();

const app = express();

// --- CONFIGURACIÓN DE CORS ACTUALIZADA ---
const whiteList = [
    'https://upcear-cms.netlify.app', 
    'https://upcear-cms-admin.netlify.app'
];
app.use(cors({
    origin: function (origin, callback) {
        if (whiteList.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    }
}));
// -----------------------------

// Middlewares
app.use(express.json());

// --- AÑADE ESTAS LÍNEAS ---
// Hacemos "pública" la carpeta 'uploads'
// Esto permite que http://localhost:5000/uploads/imagen.jpg funcione
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// -----------------------------

// Rutas de la API
app.use('/api/franquicias', require('./routes/franquiciaRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/config', require('./routes/configRoutes')); // <--- AÑADE ESTA LÍNEA
app.use('/api/upload', require('./routes/uploadRoutes')); // <--- AÑADE ESTA LÍNEA

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
