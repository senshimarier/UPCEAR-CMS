// Funcionalidad del menú hamburguesa
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mainNav = document.getElementById('main-nav');
    const header = document.getElementById('main-header');
    
    // Menú hamburguesa
    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', function() {
            this.classList.toggle('open');
            mainNav.classList.toggle('active');
            
            if (mainNav.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        });

        // Cerrar menú al hacer clic en un enlace
        const navLinks = document.querySelectorAll('#main-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburgerBtn.classList.remove('open');
                mainNav.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
    }

    // Header oculto con scroll
    if (header) {
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                if (window.scrollY > lastScrollY) {
                    header.classList.add('hidden');
                } else {
                    header.classList.remove('hidden');
                }
            } else {
                header.classList.remove('hidden');
            }
            lastScrollY = window.scrollY;
        });
    }

    // Función de redirección
    window.redireccionar = function(url) {
        window.location.href = url;
    };

    // ---- Contador funcional (ACTUALIZADO CON TODOS LOS CAMPOS) ----
    const contadorEl = document.getElementById('contador');

    async function iniciarContadorYContenido() {
        try {
            const response = await fetch('https://upcear-cms.onrender.com/api/config');
            if (!response.ok) throw new Error('No se cargó la config');
            
            const config = await response.json();

            // --- 1. Aplicar Títulos ---
            const mainTitleElement = document.getElementById('main-title-h1');
            if (mainTitleElement) {
                mainTitleElement.textContent = config.mainTitle || 'Bierland';
            }
            
            const sectionInfoTitle = document.getElementById('section-info-title');
            if (sectionInfoTitle) {
                sectionInfoTitle.textContent = config.sectionInfo_Title || 'Oktoberfest & Bierland 2025';
            }
            
            const infoBox1Title = document.getElementById('infobox1-title');
            if (infoBox1Title) {
                infoBox1Title.textContent = config.infoBox1_Title || 'El Oktoberfest';
            }
            
            const infoBox1Text = document.getElementById('infobox1-text');
            if (infoBox1Text) {
                infoBox1Text.textContent = config.infoBox1_Text || 'El Oktoberfest es una gran fiesta anual de la cerveza en Múnich que celebra la tradición bávara, la convivencia y la alegría, originada en 1810 para conmemorar el matrimonio del príncipe Ludwig y la princesa Teresa.';
            }
            
            const infoBox2Title = document.getElementById('infobox2-title');
            if (infoBox2Title) {
                infoBox2Title.textContent = config.infoBox2_Title || 'Evento Bierland';
            }
            
            const infoBox2Text = document.getElementById('infobox2-text');
            if (infoBox2Text) {
                infoBox2Text.textContent = config.infoBox2_Text || 'Este año, Bierland trae nuevas cervezas, concursos, música en vivo y experiencias únicas para todos los asistentes. ¡No te lo pierdas!';
            }

            // --- 2. Aplicar Colores ---
            if (config.bodyBgColor) {
                document.body.style.backgroundColor = config.bodyBgColor;
            }
            if (config.bodyTextColor) {
                document.body.style.color = config.bodyTextColor;
            }
            
            // Color del Header
            if (config.headerBgColor && header) {
                header.style.backgroundColor = config.headerBgColor;
            }
            
            // Colores de las cajas de información
            const infoBox1 = document.getElementById('infobox1');
            if (infoBox1 && config.infoBox1_Bg) {
                infoBox1.style.backgroundColor = config.infoBox1_Bg;
            }
            if (infoBox1 && config.infoBox1_Color) {
                infoBox1.style.color = config.infoBox1_Color;
            }
            
            const infoBox2 = document.getElementById('infobox2');
            if (infoBox2 && config.infoBox2_Bg) {
                infoBox2.style.backgroundColor = config.infoBox2_Bg;
            }
            if (infoBox2 && config.infoBox2_Color) {
                infoBox2.style.color = config.infoBox2_Color;
            }

            // --- 3. Actualizar Imagen Principal ---
            const mainImage = document.getElementById('main-cover-image');
            if (mainImage && config.mainImagePath) {
                let imgPath = config.mainImagePath;
                if (imgPath.startsWith('uploads/')) {
                    mainImage.src = `https://upcear-cms.onrender.com/${imgPath}`;
                } else {
                    mainImage.src = imgPath;
                }
            }

            // --- 4. Iniciar Contador ---
            if (contadorEl && config.countdownTarget) {
                const fechaObjetivo = new Date(config.countdownTarget);

                function actualizarContador() {
                    const ahora = new Date();
                    const diferencia = fechaObjetivo - ahora;

                    if (diferencia <= 0) {
                        contadorEl.textContent = "¡Tiempo terminado, el ganador ha sido anunciado. Gracias por esperar!";
                        clearInterval(intervalo);
                        return;
                    }

                    // CÁLCULO CORREGIDO - Incluye días completos
                    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
                    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
                    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

                    // Mostrar días solo si es mayor a 0
                    if (dias > 0) {
                        contadorEl.textContent = `${dias}d ${horas}h ${minutos}m ${segundos}s`;
                    } else {
                        contadorEl.textContent = `${horas}h ${minutos}m ${segundos}s`;
                    }
                }

                actualizarContador();
                const intervalo = setInterval(actualizarContador, 1000);
            } else if (contadorEl) {
                contadorEl.textContent = "Próximamente...";
            }

        } catch (error) {
            console.error('Error al iniciar contenido:', error);
            if (contadorEl) {
                contadorEl.textContent = "Error al cargar contador.";
            }
        }
    }

    // --- CÓDIGO NUEVO PARA CARGAR FRANQUICIAS DINÁMICAMENTE ---
    
    const API_BASE_URL = 'https://upcear-cms.onrender.com/api/franquicias';
    const franquiciasContainer = document.getElementById('franquicias-container');

    async function cargarFranquicias() {
        // Asegurarnos de que el contenedor existe antes de hacer la llamada
        if (!franquiciasContainer) {
            console.warn('Contenedor de franquicias no encontrado en esta página.');
            return;
        }

        try {
            const response = await fetch(API_BASE_URL); // Llama a GET /api/franquicias
            if (!response.ok) {
                throw new Error('No se pudo conectar a la API de franquicias');
            }
            const franquicias = await response.json();

            // Guardamos el último elemento (el de "próximamente")
            const proximoElemento = franquiciasContainer.querySelector('.proximamente');
            // Limpiamos el contenedor (quitando el "próximamente" temporalmente)
            franquiciasContainer.innerHTML = '';

            // Iteramos sobre los datos de la API y creamos el HTML
            franquicias.forEach(franquicia => {
                const divFranquicia = document.createElement('div');
                divFranquicia.className = 'franquicia';
                
                // Usamos el 'slug' de la API para construir la URL de redirección
                divFranquicia.setAttribute('onclick', `redireccionar('redirect/franquicia.html?slug=${franquicia.slug}')`);

                // --- Lógica de Ruta de Imagen ---
                let logoPath = '';
                if (franquicia.logo_path && franquicia.logo_path.startsWith('uploads/')) {
                    // Es una imagen subida, la sirve el backend
                    logoPath = `https://upcear-cms.onrender.com/${franquicia.logo_path}`;
                } else if (franquicia.logo_path) {
                    // Es una imagen estática (ej. src/chelab_logo.png)
                    logoPath = `${franquicia.logo_path}`; // index.html está en la raíz, no necesita ../
                } else {
                    // Si no hay logo_path, usar imagen por defecto
                    logoPath = 'src/proximamente.png';
                }
                // --------------------------------

                divFranquicia.innerHTML = `
                    <img src="${logoPath}" alt="${franquicia.nombre}">
                    <span>${franquicia.nombre}</span>
                `;
                
                franquiciasContainer.appendChild(divFranquicia);
            });

            // Volvemos a añadir el elemento "próximamente" al final
            if (proximoElemento) {
                franquiciasContainer.appendChild(proximoElemento);
            }

        } catch (error) {
            console.error('Error al cargar franquicias:', error);
            franquiciasContainer.innerHTML = '<p style="color: white; text-align: center;">Error al cargar la selección de cervecerías.</p>';
        }
    }

    // Inicia el contador Y la carga de la imagen principal
    iniciarContadorYContenido();
    
    // Llamamos a la nueva función para que se ejecute al cargar la página
    cargarFranquicias();

}); // <-- Asegúrate de que este es el cierre final del DOMContentLoaded
