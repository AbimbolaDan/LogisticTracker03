const shipmentForm = document.getElementById('admin-shipment-form');
const shipmentListBody = document.getElementById('shipment-list-body');
const formContainer = document.getElementById('shipment-form-container');
const addNewBtn = document.getElementById('add-new-btn');
const cancelBtn = document.getElementById('cancel-btn');

// --- PROTECTION ---
if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

let shipments = JSON.parse(localStorage.getItem('gsil_shipments')) || [];

// --- SIDEBAR TOGGLE LOGIC ---
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

// --- FORM VISIBILITY ---
addNewBtn.addEventListener('click', () => {
    formContainer.classList.remove('hidden');
    shipmentForm.reset();
    document.getElementById('form-title').innerText = "Create Tracking Item";
    document.getElementById('admin-track-id').disabled = false;
});

cancelBtn.addEventListener('click', () => {
    formContainer.classList.add('hidden');
});

// --- MAIN SUBMISSION LOGIC ---
shipmentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const trackIDInput = document.getElementById('admin-track-id');
    const trackID = trackIDInput.value || 'GS' + Math.floor(100000 + Math.random() * 900000);
    
    const currentStatus = document.getElementById('admin-status').value;
    const currentLocation = document.getElementById('admin-location').value;
    const currentRemarks = document.getElementById('admin-remarks').value;
    const currentDate = document.getElementById('date').value;
    const currentTime = document.getElementById('time').value;
    const destination = document.getElementById('destination').value;
    const departure = document.getElementById('departure').value;

    const index = shipments.findIndex(s => s.id === trackID);

    if (index > -1) {
        // --- UPDATE MODE ---
        shipments[index].status = currentStatus;
        shipments[index].location = currentLocation;
        shipments[index].remarks = currentRemarks;
        shipments[index].date = currentDate;
        shipments[index].updatedAt = new Date().toLocaleString();

        // Standard push to end of array for updates
        shipments[index].history.push({
            status: currentStatus,
            location: currentLocation,
            remarks: currentRemarks,
            date: currentDate,
            time: currentTime,
            done: true
        });
    } else {
        // --- CREATE MODE ---
        // 1. We manually create the 'Shipment Created' event first.
        const firstPoint = {
            status: 'Shipment Created',
            location: departure || 'Origin Facility',
            remarks: 'Shipment registered in GSIL system',
            date: currentDate,
            time: currentTime,
            done: true
        };

        const newHistory = [firstPoint];

        // 2. We only add the SECOND point if the user didn't select 'Shipment Created' in the dropdown
        if (currentStatus !== 'Shipment Created') {
            newHistory.push({
                status: currentStatus,
                location: currentLocation,
                remarks: currentRemarks,
                date: currentDate,
                time: currentTime,
                done: true
            });
        }

        const newShipment = {
            id: trackID,
            status: currentStatus,
            location: currentLocation,
            remarks: currentRemarks,
            date: currentDate,
            destination: destination,
            departure: departure,
            updatedAt: new Date().toLocaleString(),
            history: newHistory 
        };
        shipments.push(newShipment);
    }

    localStorage.setItem('gsil_shipments', JSON.stringify(shipments));
    renderShipments();
    formContainer.classList.add('hidden');
    alert('Shipment Successfully Saved!');
});

function renderShipments() {
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
}

window.editShipment = (id) => {
    const s = shipments.find(item => item.id === id);
    if (!s) return;

    document.getElementById('admin-track-id').value = s.id;
    document.getElementById('admin-track-id').disabled = true; 
    document.getElementById('admin-status').value = s.status;
    document.getElementById('admin-location').value = s.location;
    document.getElementById('admin-remarks').value = s.remarks;
    document.getElementById('date').value = s.date || "";
    document.getElementById('destination').value = s.destination || "";
    document.getElementById('departure').value = s.departure || "";

    formContainer.classList.remove('hidden');
    document.getElementById('form-title').innerText = "Update Status for " + id;
};

window.deleteShipment = (id) => {
    if (confirm('Are you sure you want to delete this shipment?')) {
        shipments = shipments.filter(s => s.id !== id);
        localStorage.setItem('gsil_shipments', JSON.stringify(shipments));
        renderShipments();
    }
};

window.logout = function() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
};

renderShipments();