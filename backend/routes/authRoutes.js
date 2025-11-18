// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Ruta para registrarse
router.post('/register', registerUser);

// Ruta para iniciar sesión
router.post('/login', loginUser);

module.exports = router;