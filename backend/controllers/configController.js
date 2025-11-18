// backend/controllers/configController.js
const GlobalConfig = require('../models/GlobalConfig');

// @desc    Obtener la configuración global (PÚBLICO)
// @route   GET /api/config
exports.getGlobalConfig = async (req, res) => {
    try {
        // Busca el primer documento que encuentre (o crea uno si no existe)
        let config = await GlobalConfig.findOne();
        if (!config) {
            config = await GlobalConfig.create({});
        }
        res.json(config);
    } catch (err) {
        res.status(500).send('Error del servidor: ' + err.message);
    }
};

// @desc    Actualizar la configuración global (PROTEGIDO)
// @route   PUT /api/config
exports.updateGlobalConfig = async (req, res) => {
    try {
        // Busca el primer doc y lo actualiza, o lo crea si no existe (upsert: true)
        const updatedConfig = await GlobalConfig.findOneAndUpdate(
            {}, // Filtro vacío (encuentra el primero)
            req.body, // Los datos a actualizar
            { new: true, upsert: true, runValidators: true } // Opciones
        );
        res.json(updatedConfig);
    } catch (err) {
        res.status(400).json({ msg: 'Error al actualizar: ' + err.message });
    }
};