// backend/routes/franquiciaRoutes.js
const express = require('express');
const router = express.Router();
const { 
    getFranquicias, 
    getFranquiciaBySlug, 
    createFranquicia, 
    updateFranquicia,
    updateCerveza,
    addCerveza,
    deleteCerveza,
    deleteFranquicia // <--- ¡AÑADE ESTA IMPORTACIÓN!
} = require('../controllers/franquiciaController');

// Importa el middleware de protección
const { protect } = require('../middleware/authMiddleware');

// --- Rutas Públicas (Cualquiera puede verlas) ---
router.get('/', getFranquicias); 
router.get('/:slug', getFranquiciaBySlug); 

// --- Rutas Protegidas (CMS - Solo para usuarios con token) ---
// (Simplemente añadimos 'protect' antes del controlador)

// Protege la creación de franquicias
router.post('/', protect, createFranquicia);

// Protege la actualización de campos de la franquicia
router.put('/:slug', protect, updateFranquicia);

// Protege la eliminación de franquicias
router.delete('/:slug', protect, deleteFranquicia); // <--- ¡AÑADE ESTA RUTA!

// Rutas de Cervezas
router.put('/:slug/cerveza/:data_key', protect, updateCerveza);
router.post('/:slug/cerveza', protect, addCerveza);
router.delete('/:slug/cerveza/:data_key', protect, deleteCerveza);

module.exports = router;