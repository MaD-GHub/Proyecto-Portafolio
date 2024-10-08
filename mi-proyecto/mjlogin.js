document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Aquí deberías realizar la verificación con tu backend
    if (username === 'admin' && password === 'password123') {
        alert('Inicio de sesión exitoso');
        // Redirigir a la página de administración
        window.location.href = 'admin.html';
    } else {
        alert('Usuario o contraseña incorrectos');
    }
});
