// --- API CONFIGURATION ---
const API_BASE_URL = "https://logistics-tracker-sxg2.onrender.com/api";

const shipmentForm = document.getElementById('admin-shipment-form');
const shipmentListBody = document.getElementById('shipment-list-body');
const formContainer = document.getElementById('shipment-form-container');
const addNewBtn = document.getElementById('add-new-btn');
const cancelBtn = document.getElementById('cancel-btn');
const saveBtn = document.getElementById('save-btn');

// --- AUTH & SECURITY ---
const token = localStorage.getItem('adminToken');
if (localStorage.getItem('isLoggedIn') !== 'true' || !token) {
    window.location.href = 'index.html';
}

const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
});

let isEditMode = false;

// --- HELPER: AUTO-GENERATE ID ---
// Generates a random ID starting with GS- followed by 5 alphanumeric characters
function generateShipmentID() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; 
    let result = 'GS-';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// --- INITIAL DATA LOAD ---
document.addEventListener('DOMContentLoaded', renderShipments);

// --- SIDEBAR LOGIC ---
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarClose = document.getElementById('sidebar-close');
const sidebarOverlay = document.getElementById('sidebar-overlay');

function openSidebar() {
    sidebar.classList.add('active');
    sidebarOverlay.style.display = 'block';
    if(sidebarToggle) sidebarToggle.style.display = 'none'; 
}

function closeSidebar() {
    sidebar.classList.remove('active');
    sidebarOverlay.style.display = 'none';
    if(sidebarToggle) sidebarToggle.style.display = 'block'; 
}

if(sidebarToggle) sidebarToggle.addEventListener('click', openSidebar);
if(sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
if(sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);


// --- FORM HANDLING ---
addNewBtn.addEventListener('click', () => {
    isEditMode = false;
    formContainer.classList.remove('hidden');
    shipmentForm.reset();
    document.getElementById('admin-track-id').disabled = false;
    document.getElementById('form-title').innerText = "Create New Shipment";
});

cancelBtn.addEventListener('click', () => formContainer.classList.add('hidden'));


// --- CRUD: READ (GET ALL) ---
async function renderShipments() {
    try {
        const response = await fetch(`${API_BASE_URL}/shipments`, { headers: getAuthHeader() });
        const shipments = await response.json();

        shipmentListBody.innerHTML = shipments.map(s => `
            <tr>
                <td><strong>${s.id}</strong></td>
                <td>${s.status}</td>
                <td>${s.location}</td>
                <td>
                    <button class="edit-btn" onclick="editShipment('${s.id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteShipment('${s.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Cloud Fetch Error:", err);
    }
}


// --- CRUD: CREATE & UPDATE (POST / PUT) ---
shipmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveBtn.innerText = "Syncing...";
    saveBtn.disabled = true;

    // Get value and trim whitespace
    let trackID = document.getElementById('admin-track-id').value.trim();

    // --- AUTO-GENERATE LOGIC ---
    if (!isEditMode && !trackID) {
        trackID = generateShipmentID();
    } else if (isEditMode && !trackID) {
        alert("Critical Error: Update requires an ID.");
        saveBtn.innerText = "Save Shipment";
        saveBtn.disabled = false;
        return;
    }

    const shipmentData = {
        id: trackID,
        status: document.getElementById('admin-status').value,
        location: document.getElementById('admin-location').value,
        remarks: document.getElementById('admin-remarks').value,
        date: document.getElementById('date').value,
        estimatedDate: document.getElementById('admin-estimated-date').value,
        destination: document.getElementById('destination').value,
        departure: document.getElementById('departure').value,
        history: [{
            status: document.getElementById('admin-status').value,
            location: document.getElementById('admin-location').value,
            remarks: document.getElementById('admin-remarks').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            done: true
        }]
    };

    try {
        const url = isEditMode ? `${API_BASE_URL}/shipments/${trackID}` : `${API_BASE_URL}/shipments`;
        const method = isEditMode ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: getAuthHeader(),
            body: JSON.stringify(shipmentData)
        });

        if (response.ok) {
            alert(isEditMode ? 'Update Successful!' : `Shipment Created! ID: ${trackID}`);
            formContainer.classList.add('hidden');
            renderShipments();
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (err) {
        alert("Server connection failed.");
    } finally {
        saveBtn.innerText = "Save Shipment";
        saveBtn.disabled = false;
    }
});


window.deleteShipment = async (id) => {
    if (confirm('Permanently remove from database?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/shipments/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            if (response.ok) renderShipments();
        } catch (err) {
            console.error("Delete Error:", err);
        }
    }
};


window.editShipment = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/shipments/${id}`, { headers: getAuthHeader() });
        const s = await response.json();

        isEditMode = true;
        document.getElementById('admin-track-id').value = s.id;
        document.getElementById('admin-track-id').disabled = true;
        document.getElementById('admin-status').value = s.status;
        document.getElementById('admin-location').value = s.location;
        document.getElementById('admin-remarks').value = s.remarks;
        document.getElementById('admin-estimated-date').value = s.estimatedDate || "";
        document.getElementById('destination').value = s.destination || "";
        document.getElementById('departure').value = s.departure || "";
        
        formContainer.classList.remove('hidden');
        document.getElementById('form-title').innerText = "Updating: " + id;
    } catch (err) {
        console.error("Load Error:", err);
    }
};

window.logout = function() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        const loadingText = loadingOverlay.querySelector('.loading-text');
        if (loadingText) loadingText.innerText = "LOGGING OUT...";
        loadingOverlay.classList.remove('hidden');
    }

    localStorage.clear();
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 800);
};