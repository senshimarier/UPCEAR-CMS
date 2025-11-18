// admin/add-franquicia.js
document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://upcear-cms.onrender.com/api/franquicias';
    const UPLOAD_URL = 'https://upcear-cms.onrender.com/api/upload'; // <-- AÑADIR
    const token = localStorage.getItem('authToken');

    // --- 1. Seguridad ---
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // --- 2. Elementos del Formulario ---
    const form = document.getElementById('add-form');
    const formNombre = document.getElementById('franquicia-nombre');
    const formSlug = document.getElementById('franquicia-slug');
    const formColor = document.getElementById('franquicia-color');
    const formLogo = document.getElementById('franquicia-logo');
    const errorMessage = document.getElementById('error-message');
    
    // --- AÑADIR ESTOS ELEMENTOS ---
    const logoFileInput = document.getElementById('logo-file-input');
    const logoUploadBtn = document.getElementById('logo-upload-btn');
    const logoUploadStatus = document.getElementById('logo-upload-status');
    // ---------------------------------

    // --- 3. Guardar Datos (POST) ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';

        // Recolectar datos
        const dataToSave = {
            nombre: formNombre.value,
            slug: formSlug.value,
            color: formColor.value,
            logo_path: formLogo.value
        };

        try {
            const response = await fetch(API_URL, { // POST a /api/franquicias
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // ¡La llave!
                },
                body: JSON.stringify(dataToSave)
            });

            const data = await response.json();

            if (!response.ok) {
                // Si la API devuelve un error (ej. slug duplicado)
                throw new Error(data.msg || 'Error al crear la franquicia');
            }
            
            // ¡Éxito!
            alert('¡Franquicia creada con éxito!');
            window.location.href = 'dashboard.html'; // Volver al dashboard
        
        } catch (error) {
            console.error('Error guardando:', error);
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        }
    });

    // --- 4. Lógica del Uploader de Logo ---
    logoUploadBtn.addEventListener('click', async () => {
        const file = logoFileInput.files[0];
        if (!file) {
            alert('Por favor, selecciona un archivo primero.');
            return;
        }

        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecciona un archivo de imagen válido.');
            return;
        }

        logoUploadStatus.textContent = 'Subiendo...';
        logoUploadStatus.style.color = 'blue';
        
        const formData = new FormData();
        formData.append('image', file); // 'image' debe coincidir con el backend

        try {
            const res = await fetch(UPLOAD_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Error al subir');

            // ¡Éxito! Pone la nueva ruta en el campo de texto
            formLogo.value = data.filePath;
            logoUploadStatus.textContent = '¡Imagen subida correctamente!';
            logoUploadStatus.style.color = 'green';

        } catch (err) {
            console.error(err);
            logoUploadStatus.textContent = `Error: ${err.message}`;
            logoUploadStatus.style.color = 'red';
        }
    });

    // --- 5. Logout ---
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    });
});
