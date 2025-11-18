// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Función para generar un Token JWT
const generateToken = (id) => {

    const JWT_SECRET = ''; 
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '1d' // El token expira en 1 día
    });
};

// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ msg: 'El usuario ya existe' });
        }

        const user = await User.create({
            email,
            password
        });

        res.status(201).json({
            _id: user._id,
            email: user.email,
            token: generateToken(user._id) // Opcional: auto-login al registrarse
        });

    } catch (err) {
        res.status(500).json({ msg: 'Error del servidor: ' + err.message });
    }
};

// @desc    Iniciar sesión (Login)
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar al usuario y traer la contraseña (que oculta con 'select: false')
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ msg: 'Credenciales inválidas (Email)' });
        }

        // 2. Comparar contraseñas
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ msg: 'Credenciales inválidas (Contraseña)' });
        }

        // 3. Enviar el Token
        res.json({
            _id: user._id,
            email: user.email,
            token: generateToken(user._id)
        });

    } catch (err) {
        res.status(500).json({ msg: 'Error del servidor: ' + err.message });
    }
};
