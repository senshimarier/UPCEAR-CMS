// backend/models/GlobalConfig.js
const mongoose = require('mongoose');

const GlobalConfigSchema = new mongoose.Schema({
    // --- Campos Antiguos ---
    mainImagePath: { type: String, default: 'src/principal.jpg' },
    countdownTarget: { type: Date, default: new Date('2025-10-18T20:00:00') },
    
    // --- Títulos (Rojos) ---
    mainTitle: { type: String, default: 'Bierland Oktober Fest 2025' },
    sectionInfo_Title: { type: String, default: 'Oktoberfest & Bierland 2025' },

    // --- Colores (Verde y Rojo) ---
    headerBgColor: { type: String, default: '#0A295F' }, // Color del header (Verde)
    bodyBgColor: { type: String, default: '#0070C6' }, // Color del body
    bodyTextColor: { type: String, default: '#fff' }, // Color del texto general
    
    // --- Caja Info 1 (Roja) ---
    infoBox1_Title: { type: String, default: 'El Oktoberfest' },
    infoBox1_Text: { type: String, default: 'El Oktoberfest es una gran fiesta anual de la cerveza en Múnich...' },
    infoBox1_Bg: { type: String, default: '#0A295F' }, // Fondo de la caja
    infoBox1_Color: { type: String, default: '#fff' }, // Color del texto de la caja

    // --- Caja Info 2 (Roja) ---
    infoBox2_Title: { type: String, default: 'Evento Bierland' },
    infoBox2_Text: { type: String, default: 'Este año, Bierland trae nuevas cervezas, concursos, música en vivo...' },
    infoBox2_Bg: { type: String, default: '#0A295F' },
    infoBox2_Color: { type: String, default: '#fff' }
});

module.exports = mongoose.model('GlobalConfig', GlobalConfigSchema);