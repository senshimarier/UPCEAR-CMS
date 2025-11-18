
document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://upcear-cms.onrender.com/api';
    const token = localStorage.getItem('authToken');
    
    // Elementos del formulario General
    const formNombre = document.getElementById('franquicia-nombre');
    const formSlug = document.getElementById('franquicia-slug');
    const formColor = document.getElementById('franquicia-color');
    const formLogo = document.getElementById('franquicia-logo');
    const saveGeneralBtn = document.getElementById('save-general-btn');
    const cervezasListContainer = document.getElementById('cervezas-editor-list');
    
    let currentSlug = ''; // Guardará el slug de la franquicia que se está editando

    // --- 1. Seguridad y Carga de Datos ---
    (async function init() {
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // Obtener el 'slug' de la URL (ej. ?slug=chelab)
        const urlParams = new URLSearchParams(window.location.search);
        currentSlug = urlParams.get('slug');
        if (!currentSlug) {
            alert('Slug de franquicia no encontrado en la URL');
            window.location.href = 'dashboard.html';
            return;
        }

        await cargarDatosFranquicia();
    })();

    // --- 2. Cargar los datos de la Franquicia desde la API ---
    async function cargarDatosFranquicia() {
        try {
            const response = await fetch(`${API_URL}/franquicias/${currentSlug}`);
            if (!response.ok) throw new Error('No se pudo cargar la franquicia');
            
            const franquicia = await response.json();

            // Rellenar el formulario de Datos Generales
            formNombre.value = franquicia.nombre;
            formSlug.value = franquicia.slug;
            formColor.value = franquicia.color;
            formLogo.value = franquicia.logo_path;

            // Renderizar el editor para cada cerveza
            renderCervezasEditor(franquicia.cervezas);

        } catch (error) {
            console.error('Error cargando datos:', error);
            alert('Error al cargar los datos de la franquicia.');
        }
    }

    // --- 3. Renderizar los formularios de las Cervezas ---
    function renderCervezasEditor(cervezas) {
        cervezasListContainer.innerHTML = ''; // Limpiar

        cervezas.forEach(cerveza => {
            const cervezaEditor = document.createElement('div');
            cervezaEditor.className = 'cerveza-card form-grid full-width';
            cervezaEditor.innerHTML = `
                <h4>Editando: ${cerveza.nombre} (data_key: ${cerveza.data_key})</h4>
                
                <div class="form-group">
                    <label>Nombre</label>
                    <input type="text" value="${cerveza.nombre}" data-field="nombre">
                </div>
                <div class="form-group">
                    <label>Ruta Imagen</label>
                    
                    <input type="text" value="${cerveza.imagen}" data-field="imagen" readonly>
                    
                    <input type="file" data-field="file-input" id="file-input-${cerveza.data_key}" style="margin-top: 0.5rem;" accept=".jpg,.jpeg,.png">
                    
                    <button type="button" class="btn upload-btn" data-key="${cerveza.data_key}" id="upload-btn-${cerveza.data_key}" style="margin-top: 0.5rem; background: #555;">Subir Imagen</button>
                    <small data-field="upload-status" style="color: green;"></small>
                </div>
                <div class="form-group full-width">
                    <label>Descripción</label>
                    <textarea rows="4" data-field="descripcion">${cerveza.descripcion || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Características (una por línea)</label>
                    <textarea rows="3" data-field="caracteristicas">${(cerveza.caracteristicas || []).map(c => c.key).join('\n')}</textarea>
                </div>
                <div class="form-group">
                    <label>Especificaciones (una por línea)</label>
                    <textarea rows="3" data-field="especificaciones">${(cerveza.especificaciones || []).map(e => e.key).join('\n')}</textarea>
                </div>
                <div class="card-actions" style="text-align: right; grid-column: 1 / -1;">
                    <button type="button" class="btn btn-save" data-key="${cerveza.data_key}">Guardar Cerveza</button>
                    <button type="button" class="btn btn-delete" data-key="${cerveza.data_key}" style="margin-left: 0.5rem;">Eliminar</button>
                </div>
            `;

            // --- 4. Lógica de Guardado (Botón de Cerveza) ---
            cervezaEditor.querySelector('.btn-save').addEventListener('click', async (e) => {
                const dataKey = e.target.dataset.key;
                const parentCard = e.target.closest('.cerveza-card');

                // Convertir texto de textareas a arrays de objetos (como los necesita la API)
                const caractText = parentCard.querySelector('[data-field="caracteristicas"]').value;
                const especText = parentCard.querySelector('[data-field="especificaciones"]').value;
                
                const caracteristicasArray = caractText.split('\n').filter(Boolean).map(item => ({ key: item }));
                const especificacionesArray = especText.split('\n').filter(Boolean).map(item => ({ key: item }));

                // Recolectar todos los datos del formulario de esta cerveza
                const cervezaData = {
                    nombre: parentCard.querySelector('[data-field="nombre"]').value,
                    imagen: parentCard.querySelector('[data-field="imagen"]').value,
                    descripcion: parentCard.querySelector('[data-field="descripcion"]').value,
                    caracteristicas: caracteristicasArray,
                    especificaciones: especificacionesArray
                };

                // Llamada a la API protegida
                await guardarCerveza(currentSlug, dataKey, cervezaData);
            });

            // --- Listener para el botón ELIMINAR ---
            cervezaEditor.querySelector('.btn-delete').addEventListener('click', async (e) => {
                const dataKey = e.target.dataset.key;
                
                if (!confirm(`¿Estás seguro de que quieres eliminar la cerveza "${dataKey}"? Esta acción no se puede deshacer.`)) {
                    return;
                }

                try {
                    const response = await fetch(`${API_URL}/franquicias/${currentSlug}/cerveza/${dataKey}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        const err = await response.json();
                        throw new Error(err.msg || 'Error al eliminar');
                    }
                    
                    alert('Cerveza eliminada.');
                    location.reload(); // Recarga la página para ver la lista actualizada
                
                } catch (error) {
                    console.error('Error eliminando:', error);
                    alert(`Error: ${error.message}`);
                }
            });

            // --- Listener para el botón SUBIR IMAGEN (Existente) ---
            const uploadBtn = cervezaEditor.querySelector('.upload-btn');
            const fileInput = cervezaEditor.querySelector('[data-field="file-input"]');
            const statusLabel = cervezaEditor.querySelector('[data-field="upload-status"]');
            const imagenTextInput = cervezaEditor.querySelector('[data-field="imagen"]');

            uploadBtn.addEventListener('click', async () => {
                const file = fileInput.files[0];
                if (!file) {
                    alert('Por favor, selecciona un archivo primero.');
                    return;
                }
                
                statusLabel.textContent = 'Subiendo...';
                const formData = new FormData();
                formData.append('image', file); // 'image' debe coincidir con upload.single('image')

                try {
                    const res = await fetch(`${API_URL}/upload`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                            
                        },
                        body: formData
                    });

                    const data = await res.json();
                    if (!res.ok) throw new Error(data.msg || 'Error al subir');

                    // Éxito. Pone la nueva ruta en el campo de texto
                    imagenTextInput.value = data.filePath;
                    statusLabel.textContent = '¡Subida!';

                } catch (err) {
                    console.error(err);
                    statusLabel.textContent = `Error: ${err.message}`;
                    statusLabel.style.color = 'red';
                }
            });
            
            cervezasListContainer.appendChild(cervezaEditor);
        });
    }

    // --- 5. Lógica de Guardado (Botón General) ---
    saveGeneralBtn.addEventListener('click', async () => {
        const franquiciaData = {
            nombre: formNombre.value,
            color: formColor.value,
            logo_path: formLogo.value
            // No incluimos el slug porque no se puede cambiar
        };

        try {
            const response = await fetch(`${API_URL}/franquicias/${currentSlug}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // La llave
                },
                body: JSON.stringify(franquiciaData)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.msg || 'Error al guardar los datos generales');
            }

            alert('¡Datos generales guardados con éxito!');
            
        } catch (error) {
            console.error('Error guardando:', error);
            alert(`Error: ${error.message}`);
        }
    });

    // --- 6. Función Reutilizable para Guardar Cerveza ---
    async function guardarCerveza(slug, dataKey, data) {
        try {
            const response = await fetch(`${API_URL}/franquicias/${slug}/cerveza/${dataKey}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // La llave
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.msg || `Error al guardar ${data.nombre}`);
            }

            alert(`¡Cerveza "${data.nombre}" guardada con éxito!`);
            
        } catch (error) {
            console.error('Error guardando cerveza:', error);
            alert(`Error: ${error.message}`);
        }
    }

    // --- 7. Lógica del formulario Añadir Cerveza ---
    const addBtn = document.getElementById('add-cerveza-btn');
    const addErrorMessage = document.getElementById('add-error-message');

    addBtn.addEventListener('click', async (e) => { // 'submit' a 'click'
        
        addErrorMessage.style.display = 'none';

        // Recolectar datos del formulario "Añadir"
        const caractText = document.getElementById('add-caracteristicas').value;
        const especText = document.getElementById('add-especificaciones').value;

        // Convertir texto a arrays de objetos
        const caracteristicasArray = caractText.split('\n').filter(Boolean).map(item => ({ key: item }));
        const especificacionesArray = especText.split('\n').filter(Boolean).map(item => ({ key: item }));

        const nuevaCervezaData = {
            data_key: document.getElementById('add-data_key').value,
            nombre: document.getElementById('add-nombre').value,
            imagen: document.getElementById('add-imagen').value,
            descripcion: document.getElementById('add-descripcion').value,
            caracteristicas: caracteristicasArray,
            especificaciones: especificacionesArray
        };

        try {
            const response = await fetch(`${API_URL}/franquicias/${currentSlug}/cerveza`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(nuevaCervezaData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Error al crear la cerveza');
            }

            // Éxito
            alert(`¡Cerveza "${data.nombre}" añadida con éxito!`);
            location.reload(); // Recarga la página para ver la lista actualizada

        } catch (error) {
            console.error('Error añadiendo cerveza:', error);
            addErrorMessage.textContent = error.message;
            addErrorMessage.style.display = 'block';
        }
    });

    // --- 8. Lógica del botón Subir Imágen (Añadir Nuevo) ---
    const addUploadBtn = document.getElementById('add-upload-btn');
    const addFileInput = document.getElementById('add-file-input');
    const addImagenTextInput = document.getElementById('add-imagen');
    const addUploadStatus = document.getElementById('add-upload-status');

    addUploadBtn.addEventListener('click', async () => {
        const file = addFileInput.files[0];
        if (!file) {
            alert('Por favor, selecciona un archivo primero.');
            return;
        }

        addUploadStatus.textContent = 'Subiendo...';
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Error al subir');

            // Éxito. Pone la nueva ruta en el campo de texto de "Añadir"
            addImagenTextInput.value = data.filePath;
            addUploadStatus.textContent = '¡Subida!';
            addUploadStatus.style.color = 'green';

        } catch (err) {
            console.error(err);
            addUploadStatus.textContent = `Error: ${err.message}`;
            addUploadStatus.style.color = 'red';
        }
    });
    
    // Lógica del botón de Logout (copiada de dashboard.js)
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    });
});
