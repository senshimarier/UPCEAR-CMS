document.addEventListener('DOMContentLoaded', function() {
    
    // --- CONFIGURACIÓN ---
    const API_BASE_URL = 'http://localhost:5000/api'; // URL base del backend
    const BACKEND_URL = 'http://localhost:5000';    // URL para imágenes de 'uploads'
    
    // --- ELEMENTOS DEL DOM ---
    const navCervezas = document.getElementById('nav-cervezas');
    const contenedorCerveza = document.getElementById('contenido-cerveza');
    const body = document.body;
    const navBack = document.getElementById('nav-back');
    const navNext = document.getElementById('nav-next');
    const franquiciaTitle = document.getElementById('franquicia-title');

    let datosFranquicia = null;
    let franquiciaSlug = '';

    // --- FUNCIÓN 1: DETECTAR FRANQUICIA DESDE URL ---
    function detectarFranquicia() {
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug'); // Obtiene 'chelab' de '?slug=chelab'
        return slug;
    }

    // --- FUNCIÓN 2: APLICAR ESTILOS ---
    function aplicarEstilos(slug, colorDeAPI) {
        if (colorDeAPI) {
            body.style.background = colorDeAPI;
        }
    }

    // --- FUNCIÓN 3: FUNCIÓN PRINCIPAL DE CARGA ---
    async function cargarDatosFranquicia() {
        franquiciaSlug = detectarFranquicia();
        if (!franquiciaSlug) {
            franquiciaTitle.textContent = "Error";
            contenedorCerveza.innerHTML = "<p>Error: No se especificó una franquicia (slug) en la URL.</p>";
            return;
        }

        try {
            // 1. Llamar a la API (ej: /api/franquicias/chelab)
            const response = await fetch(`${API_BASE_URL}/franquicias/${franquiciaSlug}`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: No se encontraron datos para '${franquiciaSlug}'`);
            }
            datosFranquicia = await response.json();

            // 2. Actualizar Títulos y Estilos
            franquiciaTitle.textContent = datosFranquicia.nombre;
            document.title = `${datosFranquicia.nombre} - Cervezas`;
            aplicarEstilos(franquiciaSlug, datosFranquicia.color);

            // 3. Limpiar contenedores
            navCervezas.innerHTML = '';
            contenedorCerveza.innerHTML = '';

            // 4. Crear botones de cervezas
            if (!datosFranquicia.cervezas || datosFranquicia.cervezas.length === 0) {
                contenedorCerveza.innerHTML = "<p>No hay cervezas registradas para esta franquicia.</p>";
                return;
            }

            datosFranquicia.cervezas.forEach((cerveza, index) => {
                const boton = document.createElement('button');
                boton.className = 'cerveza-btn';
                boton.dataset.cerveza = cerveza.data_key;
                boton.textContent = cerveza.nombre;
                
                if (index === 0 || cerveza.es_nosotros) {
                    boton.classList.add('active');
                }

                boton.addEventListener('click', () => {
                    document.querySelectorAll('#nav-cervezas .cerveza-btn').forEach(b => b.classList.remove('active'));
                    boton.classList.add('active');
                    mostrarContenidoCerveza(cerveza.data_key);
                });
                navCervezas.appendChild(boton);
            });

            // 5. Mostrar primera cerveza
            const primerBotonActivo = navCervezas.querySelector('.cerveza-btn.active');
            if (primerBotonActivo) {
                mostrarContenidoCerveza(primerBotonActivo.dataset.cerveza);
            }
            
            // 6. Configurar navegación (Anterior/Siguiente)
            actualizarNavegacion();

        } catch (error) {
            console.error('Error al cargar datos de la franquicia:', error);
            franquiciaTitle.textContent = "Error";
            contenedorCerveza.innerHTML = `<p style="text-align: center; color: #ffdd57;">⚠️ No se pudo conectar a la API o la franquicia no existe.</p>`;
        }
    }

    // --- FUNCIÓN 4: RENDERIZAR CERVEZA (¡AQUÍ ESTÁ EL ARREGLO!) ---
    function mostrarContenidoCerveza(dataKey) {
        if (!datosFranquicia) return;
        const cerveza = datosFranquicia.cervezas.find(c => c.data_key === dataKey);
        if (!cerveza) {
            contenedorCerveza.innerHTML = "<p>Error: Cerveza no encontrada.</p>";
            return;
        }

        // --- LÓGICA DE IMAGEN MEJORADA ---
        let imgPath = cerveza.imagen;
        
        if (imgPath.startsWith('uploads/')) {
            // 1. Es una imagen SUBIDA (ej: "uploads/image.jpg")
            imgPath = `${BACKEND_URL}/${imgPath}`;
        } else if (imgPath.startsWith('src/')) {
            // 2. Es una ruta estática LIMPIA (ej: "src/logo.png")
            imgPath = `../${imgPath}`;
        } else if (imgPath.startsWith('../src/')) {
            // 3. Es una ruta estática SUCIA (ej: "../src/logo.png")
            // ¡Ya es correcta para este archivo! No se toca.
            // (imgPath = imgPath;)
        } else if (imgPath && !imgPath.startsWith('http')) {
             // 4. Otro caso (ej. 'anuncio.png')
            imgPath = `../${imgPath}`;
        }
        // --- FIN DE LÓGICA DE IMAGEN ---


        // Construir listas
        let listaCaracteristicas = '';
        if (cerveza.caracteristicas && cerveza.caracteristicas.length > 0) {
            listaCaracteristicas = `
                <div class="caracteristicas-container">
                    <h3>Características</h3>
                    <ul class="lista-caracteristicas">${cerveza.caracteristicas.map(i => `<li>${i.key}</li>`).join('')}</ul>
                </div>`;
        }
        let listaEspecificaciones = '';
        if (cerveza.especificaciones && cerveza.especificaciones.length > 0) {
            listaEspecificaciones = `
                <div class="especificaciones-container">
                    <h3>Especificaciones</h3>
                    <ul class="lista-especificaciones">${cerveza.especificaciones.map(i => `<li>${i.key}</li>`).join('')}</ul>
                </div>`;
        }
        
        // Renderizado Final
        contenedorCerveza.innerHTML = `
            <section class="cerveza-section active" data-cerveza-id="${cerveza.data_key}">
                <h2>${cerveza.nombre}</h2>
                <div class="cerveza-info">
                    <img src="${imgPath}" alt="${cerveza.nombre}" />
                    <div class="descripcion">
                        <p>${cerveza.descripcion}</p>
                    </div>
                </div>
                ${listaCaracteristicas}
                ${listaEspecificaciones}
            </section>
        `;
    }

    // --- FUNCIÓN 5: NAVEGACIÓN ANTERIOR/SIGUIENTE ---
    async function actualizarNavegacion() {
        try {
            const response = await fetch(`${API_BASE_URL}/franquicias`); // GET /api/franquicias
            const franquicias = await response.json();
            const slugs = franquicias.map(f => f.slug); 

            const currentIndex = slugs.indexOf(franquiciaSlug);
            if (currentIndex === -1) { // No encontrado
                navBack.style.display = 'none';
                navNext.style.display = 'none';
                return;
            }
            
            // Lógica Circular
            const prevIndex = (currentIndex - 1 + slugs.length) % slugs.length;
            const nextIndex = (currentIndex + 1) % slugs.length;

            navBack.href = `franquicia.html?slug=${slugs[prevIndex]}`;
            navNext.href = `franquicia.html?slug=${slugs[nextIndex]}`;

        } catch (error) {
            console.error("Error al cargar lista de navegación:", error);
            navBack.style.display = 'none';
            navNext.style.display = 'none';
        }
    }

    // --- INICIAR LA CARGA DE DATOS ---
    cargarDatosFranquicia();
});