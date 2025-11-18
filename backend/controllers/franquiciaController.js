// backend/controllers/franquiciaController.js
const Franquicia = require('../models/Franquicia');

// @desc    Obtener TODAS las franquicias (Página principal)
// @route   GET /api/franquicias
exports.getFranquicias = async (req, res) => {
    try {
        // Se puede optimizar para obtener solo el slug, nombre y logo
        const franquicias = await Franquicia.find().select('slug nombre color logo_path');
        res.json(franquicias);
    } catch (err) {
        res.status(500).send('Error del servidor: ' + err.message);
    }
};

// @desc    Obtener una franquicia por su slug (Página de catálogo)
// @route   GET /api/franquicias/:slug
exports.getFranquiciaBySlug = async (req, res) => {
    try {
        const franquicia = await Franquicia.findOne({ slug: req.params.slug });
        if (!franquicia) {
            return res.status(404).json({ msg: 'Franquicia no encontrada' });
        }
        res.json(franquicia);
    } catch (err) {
        res.status(500).send('Error del servidor: ' + err.message);
    }
};

// --- RUTAS DEL CMS (Permiten la edición) ---

// @desc    Crear una nueva franquicia
// @route   POST /api/franquicias
exports.createFranquicia = async (req, res) => {
    // Obtenemos los datos del formulario del admin
    const { nombre, slug, color, logo_path } = req.body;

    try {
        // 1. Validar si ya existe
        const slugExists = await Franquicia.findOne({ slug });
        if (slugExists) {
            return res.status(400).json({ msg: 'Error: El "slug" (URL) ya existe.' });
        }

        // 2. Crear el objeto de la nueva franquicia
        const nuevaFranquicia = new Franquicia({
            nombre,
            slug,
            color,
            logo_path,
            // 3. ¡IMPORTANTE! Añadimos el "Nosotros" por defecto
            cervezas: [
                {
                    data_key: "Nosotros",
                    nombre: "¿Quiénes Somos?",
                    imagen: logo_path, // Usa el mismo logo
                    descripcion: "Escribe aquí la descripción de la cervecería.",
                    es_nosotros: true
                }
            ]
        });

        // 4. Guardar en la BD
        await nuevaFranquicia.save();
        res.status(201).json(nuevaFranquicia);

    } catch (err) {
        res.status(400).json({ msg: 'Error al crear: ' + err.message });
    }
};

// @desc    Actualizar una franquicia por su slug
// @route   PUT /api/franquicias/:slug
exports.updateFranquicia = async (req, res) => {
    try {
        const franquicia = await Franquicia.findOneAndUpdate(
            { slug: req.params.slug },
            req.body,
            { new: true, runValidators: true } 
        );

        if (!franquicia) {
            return res.status(404).json({ msg: 'Franquicia no encontrada' });
        }
        res.json(franquicia);
    } catch (err) {
        res.status(400).json({ msg: 'Error al actualizar: ' + err.message });
    }
};

// @desc    Actualizar una cerveza específica dentro de una franquicia
// @route   PUT /api/franquicias/:slug/cerveza/:data_key
exports.updateCerveza = async (req, res) => {
    const { slug, data_key } = req.params;
    const { descripcion, caracteristicas, especificaciones, imagen, nombre } = req.body;
    
    // Construye el objeto de actualización ($set)
    const updateData = {};
    if (descripcion !== undefined) updateData['cervezas.$.descripcion'] = descripcion;
    if (caracteristicas !== undefined) updateData['cervezas.$.caracteristicas'] = caracteristicas;
    if (especificaciones !== undefined) updateData['cervezas.$.especificaciones'] = especificaciones;
    if (imagen !== undefined) updateData['cervezas.$.imagen'] = imagen;
    if (nombre !== undefined) updateData['cervezas.$.nombre'] = nombre;

    try {
        const franquicia = await Franquicia.findOneAndUpdate(
            { 
                slug: slug, 
                "cervezas.data_key": data_key // Condición para encontrar la cerveza dentro del array
            },
            { $set: updateData }, // Usa $set para actualizar solo los campos especificados
            { new: true } // Devuelve el documento actualizado
        );

        if (!franquicia) {
            return res.status(404).json({ msg: 'Franquicia o cerveza no encontrada' });
        }
        
        // Devuelve solo la cerveza actualizada para confirmar
        const cervezaActualizada = franquicia.cervezas.find(c => c.data_key === data_key);
        res.json(cervezaActualizada);

    } catch (err) {
        // El error 400 es adecuado para fallos de validación o lógica.
        res.status(400).json({ msg: 'Error al actualizar la cerveza: ' + err.message });
    }
};

// @desc    Añadir una nueva cerveza a una franquicia
// @route   POST /api/franquicias/:slug/cerveza
exports.addCerveza = async (req, res) => {
    const { slug } = req.params;
    const newCervezaData = req.body;

    // Validación simple: data_key y nombre son cruciales
    if (!newCervezaData.data_key || !newCervezaData.nombre) {
        return res.status(400).json({ msg: 'Error: El "data_key" y el "nombre" son obligatorios.' });
    }

    try {
        // 1. Buscar la franquicia
        const franquicia = await Franquicia.findOne({ slug });
        if (!franquicia) {
            return res.status(404).json({ msg: 'Franquicia no encontrada' });
        }

        // 2. Verificar que el data_key no esté duplicado
        const beerExists = franquicia.cervezas.some(c => c.data_key === newCervezaData.data_key);
        if (beerExists) {
            return res.status(400).json({ msg: 'Error: El "data_key" (ID de URL) ya existe en esta franquicia.' });
        }

        // 3. Añadir la cerveza al array
        franquicia.cervezas.push(newCervezaData);
        
        // 4. Guardar la franquicia actualizada
        await franquicia.save();
        
        // Devolver la cerveza recién creada
        res.status(201).json(franquicia.cervezas[franquicia.cervezas.length - 1]);

    } catch (err) {
        res.status(400).json({ msg: 'Error al añadir cerveza: ' + err.message });
    }
};

// @desc    Eliminar una cerveza de una franquicia
// @route   DELETE /api/franquicias/:slug/cerveza/:data_key
exports.deleteCerveza = async (req, res) => {
    const { slug, data_key } = req.params;

    try {
        const franquicia = await Franquicia.findOneAndUpdate(
            { slug },
            { $pull: { cervezas: { data_key: data_key } } }, // $pull elimina el item del array
            { new: true }
        );

        if (!franquicia) {
            return res.status(404).json({ msg: 'Franquicia no encontrada' });
        }

        res.json({ msg: 'Cerveza eliminada' });

    } catch (err) {
        res.status(400).json({ msg: 'Error al eliminar cerveza: ' + err.message });
    }
};

// @desc    Eliminar una franquicia por su slug
// @route   DELETE /api/franquicias/:slug
exports.deleteFranquicia = async (req, res) => {
    try {
        const franquicia = await Franquicia.findOneAndDelete({ slug: req.params.slug });

        if (!franquicia) {
            return res.status(404).json({ msg: 'Franquicia no encontrada' });
        }
        
        // Opcional: Aquí podrías añadir lógica para borrar las imágenes
        // asociadas del servidor (de la carpeta /uploads)

        res.json({ msg: 'Franquicia eliminada correctamente' });
    } catch (err) {
        res.status(500).json({ msg: 'Error del servidor: ' + err.message });
    }
};