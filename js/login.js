// --- API CONFIGURATION ---
const API_BASE_URL = "https://logistics-tracker-sxg2.onrender.com/api";

const form = document.getElementById('form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('toggle-password');
const submitBtn = document.getElementById('submit-btn');
const loadingOverlay = document.getElementById('loading-overlay');

// 1. Password Visibility Toggle
if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.style.opacity = type === 'text' ? '1' : '0.5';
    });
}

// 2. Form Submission with API & Loading State
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    // ACTIVATE LOADING SCREEN
    loadingOverlay.classList.remove('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // SUCCESS: Setup Session
            localStorage.setItem('isLoggedIn', 'true');
            if (data.token) {
                localStorage.setItem('adminToken', data.token);
            }
            // Redirect will naturally remove the overlay
            window.location.href = 'Admin.html';
        } else {
            // FAILURE: Remove overlay to allow correction
            loadingOverlay.classList.add('hidden');
            alert(data.message || "Invalid credentials. Please try again.");
        }
    } catch (error) {
        // NETWORK ERROR: Hide overlay
        loadingOverlay.classList.add('hidden');
        console.error("Login Error:", error);
        alert("Unable to connect to GSIL server. Check your connection.");
    }
});