const signupForm = document.getElementById('signup-form');
const loadingOverlay = document.getElementById('loading-overlay');
const API_BASE_URL = "https://logistics-tracker-sxg2.onrender.com/api";

// --- NEW: TOGGLE PASSWORD LOGIC ---
const togglePassword = document.getElementById('toggle-password');
const passwordInput = document.getElementById('password');

if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
        // Toggle the type attribute
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Optional: Change opacity to indicate active state
        this.style.opacity = type === 'text' ? '1' : '0.5';
    });
}

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // FIXED: Using 'FullName' (case sensitive) to match your HTML ID
    const name = document.getElementById('FullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value.trim();

    loadingOverlay.classList.remove('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Account created successfully! You can now log in.");
            window.location.href = 'index.html'; // Redirect to Login
        } else {
            loadingOverlay.classList.add('hidden');
            alert(data.message || "Registration failed. Email might already exist.");
        }
    } catch (error) {
        loadingOverlay.classList.add('hidden');
        console.error("Signup Error:", error);
        alert("Server connection failed.");
    }
});