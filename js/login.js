// 1. Select Elements
const togglePassword = document.querySelector('#toggle-password');
const passwordInput = document.querySelector('#password');
const loginForm = document.getElementById('login-form');


if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
        
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
      
        this.style.color = type === 'text' ? 'var(--primary-blue)' : 'var(--text-muted)';
    });
}


loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

   
    const adminEmail = "admin@gsil.com";
    const adminPass = "gsil2026";

    if (email === adminEmail && password === adminPass) {
       
        localStorage.setItem('isLoggedIn', 'true');
        
       
        window.location.href = 'admin.html';
    } else {
     
        alert('Invalid Email or Password. Please check your credentials and try again.');
    }
});
