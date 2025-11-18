// backend/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');

// 1. Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
    // Dónde guardar los archivos
    destination(req, file, cb) {
        cb(null, 'uploads/'); // Asegúrate que esta carpeta exista
    },
    // Cómo nombrar los archivos
    filename(req, file, cb) {
        // Genera un nombre único: campoOriginal-timestamp.extension
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// 2. Filtro de archivos (para aceptar solo imágenes)
function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('¡Solo se permiten imágenes (jpg, jpeg, png)!'));
    }
}

// 3. Inicializar 'upload' con la configuración
const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
});

// 4. Definir la ruta de carga
// @route   POST /api/upload
// @desc    Subir un archivo de imagen
// @access  Privado (Protegido)
router.post('/', protect, upload.single('image'), (req, res) => {
    // 'upload.single('image')' busca un archivo en el campo 'image' del FormData
    
    if (!req.file) {
        return res.status(400).json({ msg: 'No se subió ningún archivo.' });
    }

    // Devolvemos la ruta donde se guardó el archivo
    // Importante: Reemplazamos 'backend/' para que la ruta sea relativa a la URL
    // y usamos / (barra normal) para compatibilidad web.
    const filePath = req.file.path.replace(/\\/g, '/'); // ej: "uploads/image-123.jpg"
    res.status(201).json({
        msg: 'Imagen subida con éxito',
        filePath: filePath // ej: "uploads/image-1678886400000.jpg"
    });
});

module.exports = router;