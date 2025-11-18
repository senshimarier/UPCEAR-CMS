// backend/routes/configRoutes.js
const express = require('express');
const router = express.Router();
const { getGlobalConfig, updateGlobalConfig } = require('../controllers/configController');
const { protect } = require('../middleware/authMiddleware');

// Ruta pública para que el frontend (Código/) la consuma
router.get('/', getGlobalConfig);

// Ruta protegida para que el admin (admin/) la edite
router.put('/', protect, updateGlobalConfig);

module.exports = router;