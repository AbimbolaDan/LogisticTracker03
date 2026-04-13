// --- API CONFIGURATION ---
const API_BASE_URL = "https://logistics-tracker-sxg2.onrender.com/api";

const form = document.getElementById('form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('toggle-password');
const submitBtn = document.getElementById('submit-btn');
const loadingOverlay = document.getElementById('loading-overlay');

// 1. Password Visibility Toggle (Kept your original logic)
if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.style.opacity = type === 'text' ? '1' : '0.5';
    });
}

// 2. Form Submission with 5-Second Timeout
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    // --- 5-SECOND TIMEOUT LOGIC ---
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); 

    // ACTIVATE LOADING SCREEN
    loadingOverlay.classList.remove('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            signal: controller.signal // Attach the timeout signal here
        });

        clearTimeout(timeoutId); // Cancel the timer if we get a response in time

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('isLoggedIn', 'true');
            if (data.token) {
                localStorage.setItem('adminToken', data.token);
            }
            window.location.href = 'Admin.html';
        } else {
            loadingOverlay.classList.add('hidden');
            alert(data.message || "Invalid credentials. Please try again.");
        }
    } catch (error) {
        loadingOverlay.classList.add('hidden');
        
        if (error.name === 'AbortError') {
            alert("Authentication timed out (5s limit). The GSIL server might be starting up—please try again in a few seconds.");
        } else {
            console.error("Login Error:", error);
            alert("Unable to connect to GSIL server. Check your connection.");
        }
    }
});