const mongoose = require('mongoose');

// Sub-esquemas para Características y Especificaciones
const ItemSchema = new mongoose.Schema({
    key: { type: String, required: true }, // e.g., "Aroma: mandarina fresca" o "ABV: 4.6%"
    // El campo 'value' se podría usar para una separación más limpia, pero por simplicidad
    // usa solo 'key' para guardar el string completo.
});

const CervezaSchema = new mongoose.Schema({
    // La clave única que se usará en los botones y URL (e.g., 'Kölch', 'Peanut_Butter_Milk_Stout', 'Nosotros')
    data_key: { type: String, required: true }, 
    nombre: { type: String, required: true },
    imagen: { type: String, required: true }, // Ruta de la imagen (debe coincidir con la ruta del frontend)
    descripcion: { type: String, default: "" },
    
    // El campo 'es_nosotros' ayuda a identificar el perfil de la cervecería
    es_nosotros: { type: Boolean, default: false },

    // Listas de características y especificaciones
    caracteristicas: [ItemSchema], 
    especificaciones: [ItemSchema]
});

const FranquiciaSchema = new mongoose.Schema({
    // Clave para la lógica de la URL y el JS (e.g., 'chelab', 'montiel'). Debe ser única.
    slug: { type: String, required: true, unique: true }, 
    nombre: { type: String, required: true },
    color: { type: String, required: true }, // Almacena el color para el fondo
    logo_path: { type: String, required: false },
    cervezas: [CervezaSchema] // Array de cervezas incrustado
});

module.exports = mongoose.model('Franquicia', FranquiciaSchema);
