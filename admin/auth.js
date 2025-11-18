// admin/auth.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Previene que el formulario se envíe de forma tradicional
        errorMessage.style.display = 'none'; // Oculta errores previos

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                // Si la respuesta no es 200-299, es un error (ej. 401 Credenciales inválidas)
                throw new Error(data.msg || 'Error al iniciar sesión');
            }

            // ¡ÉXITO!
            // Guardamos el token en el almacenamiento local del navegador
            localStorage.setItem('authToken', data.token);
            
            // Redirigimos al cliente al panel principal
            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error('Error de login:', error.message);
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        }
    });
});