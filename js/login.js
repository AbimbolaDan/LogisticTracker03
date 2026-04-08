// 1. Select Elements
const form = document.getElementById('form');
const emailInput = document.querySelector('.inputForm input[type="text"]');
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('toggle-password');


if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
  
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        
        this.style.fill = type === 'text' ? 'var(--primary-blue)' : 'currentColor';
        this.style.opacity = type === 'text' ? '1' : '0.7';
    });
}


form.addEventListener('submit', function(e) {
    e.preventDefault();

 
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    const adminEmail = "admin@gsil.com";
    const adminPass = "gsil2026";

    if (email === "" || password === "") {
        alert("Please fill in all fields.");
        return;
    }

    if (email === adminEmail && password === adminPass) {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'Admin.html';
    } else {
        alert('Invalid Email or Password. Please check your credentials and try again.');
        passwordInput.value = "";
    }
});