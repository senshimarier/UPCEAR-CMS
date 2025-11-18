// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    // 1. Revisar si el token viene en los 'headers' de la petición
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Obtener el token (quitando la palabra 'Bearer')
            token = req.headers.authorization.split(' ')[1];

            // 3. Verificar el token
            // (Asegúrate de usar la misma clave secreta que en authController)
            const JWT_SECRET = 'miclavesecreta123'; 
            const decoded = jwt.verify(token, JWT_SECRET);

            // 4. Obtener el usuario del token y adjuntarlo a 'req'
            // (Esto nos permite saber QUIÉN está haciendo la petición)
            req.user = await User.findById(decoded.id).select('-password');

            next(); // ¡Pase autorizado! Sigue al siguiente controlador.

        } catch (error) {
            console.error('Error de autenticación:', error.message);
            res.status(401).json({ msg: 'Token no válido, autorización denegada' });
        }
    }

    if (!token) {
        res.status(401).json({ msg: 'No hay token, autorización denegada' });
    }
};