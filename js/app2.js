// SIDEBAR TOGGLE
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebar-toggle');
const closeBtn = document.getElementById('sidebar-close');
const overlay = document.getElementById('sidebar-overlay');

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.add('active');
        overlay.classList.remove('hidden');
        overlay.style.display = "block";
    });
}

if (closeBtn || overlay) {
    const closeMenu = () => {
        sidebar.classList.remove('active');
        overlay.style.display = "none";
    };
    closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
}