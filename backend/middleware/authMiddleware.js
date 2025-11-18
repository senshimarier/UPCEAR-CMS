const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    // 1. Revisar si el token viene en los 'headers' de la petición
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Obtener el token
            token = req.headers.authorization.split(' ')[1];

            // 3. Verificar el token
            const JWT_SECRET = ''; 
            const decoded = jwt.verify(token, JWT_SECRET);

            // 4. Obtener el usuario del token y adjuntarlo a 'req'
            // Quién está haciendo la petición
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
