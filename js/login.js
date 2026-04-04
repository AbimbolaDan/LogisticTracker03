// 1. Select Elements
const togglePassword = document.querySelector('#toggle-password');
const passwordInput = document.querySelector('#password');
const loginForm = document.getElementById('login-form');

// 2. Password Visibility Toggle Logic
if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
        // Toggle the type attribute
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Change icon color to blue when password is visible
        this.style.color = type === 'text' ? 'var(--primary-blue)' : 'var(--text-muted)';
    });
}

// 3. Login Authentication Logic
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Static Credentials for Staff/Admin
    const adminEmail = "admin@gsil.com";
    const adminPass = "gsil2026";

    if (email === adminEmail && password === adminPass) {
        // Create a login session in the browser
        localStorage.setItem('isLoggedIn', 'true');
        
        // Redirect to the Dashboard
        window.location.href = 'admin.html';
    } else {
        // Show error if credentials don't match
        alert('Invalid Email or Password. Please check your credentials and try again.');
    }
});

// NOTE: DO NOT add the "isLoggedIn" check here. 
// That check only belongs in admin.js to protect the dashboard.