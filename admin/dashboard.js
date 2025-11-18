// admin/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://upcear-cms.onrender.com/api';
    const token = localStorage.getItem('authToken');
    const franquiciasContainer = document.getElementById('franquicias-list');
    const logoutButton = document.getElementById('logout-btn');

    // --- 1. Seguridad: Proteger la página ---
    if (!token) {
        // Si no hay token, no hay acceso. Redirigir al login.
        window.location.href = 'login.html';
        return; // Detener la ejecución
    }

    // --- 2. Botón de Cerrar Sesión ---
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('authToken'); // Borra la llave
        window.location.href = 'login.html'; // Envía al login
    });

    // --- 3. Cargar las franquicias ---
    async function cargarFranquicias() {
        try {
            // Esta ruta es pública (GET), no necesita el token, pero la usaremos
            // para mostrar la lista de items a editar.
            const response = await fetch(`${API_URL}/franquicias`);
            if (!response.ok) {
                throw new Error('Error al cargar las franquicias');
            }
            const franquicias = await response.json();
            renderFranquicias(franquicias);

        } catch (error) {
            console.error('Error:', error);
            franquiciasContainer.innerHTML = '<p class="error-text">No se pudieron cargar las franquicias.</p>';
        }
    }

    // --- 4. Renderizar (dibujar) las franquicias en el HTML ---
    function renderFranquicias(franquicias) {
        franquiciasContainer.innerHTML = ''; // Limpiar el contenedor

        // URLs de tus sitios desplegados
        const apiURL = 'https://upcear-cms.onrender.com';
        const publicSiteURL = 'https://upcear-cms.netlify.app';

        franquicias.forEach(franquicia => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // --- ¡NUEVA LÓGICA DE IMAGEN! ---
            let logoPath = '';
            if (!franquicia.logo_path) {
                // No hay imagen
                logoPath = `${publicSiteURL}/src/proximamente.png`;
            } else if (franquicia.logo_path.startsWith('uploads/')) {
                // 1. Es una imagen SUBIDA (ej: "uploads/image.jpg")
                logoPath = `${apiURL}/${franquicia.logo_path}`;
            } else if (franquicia.logo_path.startsWith('src/')) {
                // 2. Es una ruta estática LIMPIA (ej: "src/logo.png")
                logoPath = `${publicSiteURL}/${franquicia.logo_path}`;
            } else {
                // 3. Es una ruta "sucia" o desconocida (ej: "../src/logo.png")
                // Se asume que es estática y se intenta limpiar
                const cleanPath = franquicia.logo_path.replace('../', '').replace('../', '');
                logoPath = `${publicSiteURL}/${cleanPath}`;
            }
            // --------------------------------

            card.innerHTML = `
                <img src="${logoPath}" alt="${franquicia.nombre}" class="card-logo" style="background: white; padding: 5px;">
                <div class="card-content">
                    <h3>${franquicia.nombre}</h3>
                    <p>Slug: ${franquicia.slug}</p>
                </div>
                <div class="card-actions">
                    <button class="btn btn-edit" data-slug="${franquicia.slug}">Editar</button>
                    <button class="btn btn-delete" data-slug="${franquicia.slug}" style="margin-left: 0.5rem; background: #dc3545;">Eliminar</button>
                </div>
            `;

            // --- Listener para el botón EDITAR ---
            card.querySelector('.btn-edit').addEventListener('click', () => {
                window.location.href = `edit.html?slug=${franquicia.slug}`;
            });

            // --- Listener para el botón ELIMINAR ---
            card.querySelector('.btn-delete').addEventListener('click', async (e) => {
                const slug = e.target.dataset.slug;
                
                if (!confirm(`¿Estás seguro de que quieres eliminar la franquicia "${franquicia.nombre}" (${slug})?\n\n¡ESTA ACCIÓN NO SE PUEDE DESHACER!\nSe borrarán todas las cervezas asociadas.`)) {
                    return;
                }

                try {
                    const response = await fetch(`${API_URL}/franquicias/${slug}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    // IMPORTANTE: Cambiamos cómo leemos la respuesta
                    if (!response.ok) {
                        // Si falla, intenta leer JSON
                        let errorMsg = 'Error al eliminar';
                        try {
                            const err = await response.json();
                            errorMsg = err.msg;
                        } catch (e) {
                            // Si falla el JSON (ej. error 500 HTML), usa el texto de estado
                            errorMsg = response.statusText;
                        }
                        throw new Error(errorMsg);
                    }
                    
                    const result = await response.json();
                    alert(result.msg || 'Franquicia eliminada correctamente.');
                    card.remove(); // Elimina la tarjeta del DOM sin recargar
                
                } catch (error) {
                    // Este 'error.message' ahora mostrará el error correcto
                    console.error('Error eliminando:', error);
                    alert(`Error: ${error.message}`);
                }
            });

            franquiciasContainer.appendChild(card);
        });
    } // <-- Fin de renderFranquicias

    // --- Iniciar la carga de datos al abrir la página ---
    cargarFranquicias();
});
