const shipmentForm = document.getElementById('admin-shipment-form');
const shipmentListBody = document.getElementById('shipment-list-body');
const formContainer = document.getElementById('shipment-form-container');
const addNewBtn = document.getElementById('add-new-btn');
const cancelBtn = document.getElementById('cancel-btn');


if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

let shipments = JSON.parse(localStorage.getItem('gsil_shipments')) || [];


addNewBtn.addEventListener('click', () => {
    formContainer.classList.remove('hidden');
    shipmentForm.reset();
    document.getElementById('form-title').innerText = "Create Tracking Item";
    document.getElementById('admin-track-id').disabled = false;
});

cancelBtn.addEventListener('click', () => {
    formContainer.classList.add('hidden');
});


shipmentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const trackID = document.getElementById('admin-track-id').value || 'GS' + Math.floor(100000 + Math.random() * 900000);
    const currentStatus = document.getElementById('admin-status').value;
    const currentLocation = document.getElementById('admin-location').value;
    const currentRemarks = document.getElementById('admin-remarks').value;
    const currentDate = document.getElementById('date').value;
    const currentTime = document.getElementById('time').value;
    const destination = document.getElementById('destination').value;
    const departure = document.getElementById('departure').value;

   
    const index = shipments.findIndex(s => s.id === trackID);

    if (index > -1) {
        shipments[index].status = currentStatus;
        shipments[index].location = currentLocation;
        shipments[index].remarks = currentRemarks;
        shipments[index].date = currentDate;
        shipments[index].updatedAt = new Date().toLocaleString();

        
        shipments[index].history.push({
            status: currentStatus,
            location: currentLocation,
            remarks: currentRemarks,
            date: currentDate,
            time: currentTime,
            done: true
        });
    } else {
        const newShipment = {
            id: trackID,
            status: currentStatus,
            location: currentLocation,
            remarks: currentRemarks,
            date: currentDate,
            destination: destination,
            departure: departure,
            updatedAt: new Date().toLocaleString(),
            history: [
                {
                    status: 'Departure Origin',
                    location: departure || 'Origin Facility',
                    remarks: 'Shipment handed over to carrier',
                    date: currentDate,
                    time: '09:00 AM',
                    done: true
                },
                {
                    status: currentStatus,
                    location: currentLocation,
                    remarks: currentRemarks,
                    date: currentDate,
                    time: currentTime,
                    done: true
                }
            ]
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
    document.getElementById('admin-track-id').disabled = true; // Don't allow ID change during edit
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
    if (confirm('Are you sure you want to delete this shipment? This cannot be undone.')) {
        shipments = shipments.filter(s => s.id !== id);
        localStorage.setItem('gsil_shipments', JSON.stringify(shipments));
        renderShipments();
    }
};


renderShipments();