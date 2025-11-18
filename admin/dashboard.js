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

        franquicias.forEach(franquicia => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // --- Lógica de Ruta de Imagen ---
            let logoPath = '';
            if (franquicia.logo_path && franquicia.logo_path.startsWith('uploads/')) {
                // Es una imagen subida, la sirve el backend
                logoPath = `https://upcear-cms.onrender.com/${franquicia.logo_path}`;
            } else if (franquicia.logo_path) {
                // Es una imagen estática (ej. src/chelab_logo.png)
                logoPath = `../frontend/${franquicia.logo_path}`;
            } else {
                // Si no hay logo_path, usar una imagen por defecto o placeholder
                logoPath = '../frontend/src/proximamente.png'; // Imagen por defecto
            }
            // --------------------------------
            
            card.innerHTML = `
                <img src="${logoPath}" alt="${franquicia.nombre}" class="card-logo">
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
                // Redirigir a la página de edición pasando el 'slug' en la URL
                window.location.href = `edit.html?slug=${franquicia.slug}`;
            });

            // --- Listener para el botón ELIMINAR ---
            card.querySelector('.btn-delete').addEventListener('click', async (e) => {
                const slug = e.target.dataset.slug;
                
                // Pedir confirmación
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

                    if (!response.ok) {
                        const err = await response.json();
                        throw new Error(err.msg || 'Error al eliminar');
                    }
                    
                    const result = await response.json();
                    alert(result.msg || 'Franquicia eliminada correctamente.');
                    card.remove(); // Elimina la tarjeta del DOM sin recargar
                
                } catch (error) {
                    console.error('Error eliminando:', error);
                    alert(`Error: ${error.message}`);
                }
            });

            franquiciasContainer.appendChild(card);
        });
    }

    // --- Iniciar la carga de datos al abrir la página ---
    cargarFranquicias();
});
