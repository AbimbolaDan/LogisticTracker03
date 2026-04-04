const track_btn = document.getElementById('track-btn');
const track_form = document.getElementById('track-form');
const input = document.getElementById('Number');
const tracking_result = document.getElementById('tracking-results');

// Clear results and map when input is emptied
input.addEventListener('input', () => {
    if (input.value.trim() === "") {
        tracking_result.classList.add('hidden');
        const mapHero = document.getElementById('map-hero');
        if (mapHero) mapHero.classList.add('hidden');
    }
});

track_form.addEventListener('submit', (e) => {
    e.preventDefault();
    const mapHero = document.getElementById('map-hero');
    const inputvalue = input.value.trim();

    if (inputvalue === "") {
        alert('Please input a Shipment ID');
        tracking_result.innerHTML = "";
        tracking_result.classList.add('hidden');
        if (mapHero) mapHero.classList.add('hidden');
        return;
    }

    // UPDATED: 'Delivered' is now set to true
    const details = [
        {
            status: 'Shipment Created',
            location: 'Guangzhou, China',
            Date: '24th April 2026',
            time: '11:00AM',
            remarks: 'Tracking ID Generated, Shipment details received',
            done: true
        },
        {
            status: 'Departure Origin',
            location: 'Guangzhou, China',
            Date: '25th April 2026',
            time: '02:00PM',
            remarks: 'Handed over to international carrier',
            done: true
        },
        {
            status: 'In Transit',
            location: 'Lagos, Nigeria',
            Date: '28th April 2026',
            time: '09:00AM',
            remarks: 'Arrived at Lagos International Hub',
            done: true
        },
        {
            status: 'Out for Delivery',
            location: 'Lagos, Nigeria',
            Date: '29th April 2026',
            time: '08:30AM',
            remarks: 'Shipment is with the courier for local delivery',
            done: false
        },
        {
            status: 'Delivered',
            location: 'Lagos, Nigeria',
            Date: '29th April 2026',
            time: '02:15PM',
            remarks: 'Shipment successfully delivered and signed for by recipient',
            done: false // Set to true to show as final status
        }
    ];

    const currentStatusItem = details.filter(item => item.done).pop() || details[0];

    // Determine Status Color
    let currentColor = 'var(--primary-blue)';
    const sLower = currentStatusItem.status.toLowerCase();
    if (sLower.includes('out for delivery')) currentColor = 'var(--primary-red)';
    else if (sLower.includes('in transit')) currentColor = 'var(--primary-yellow)';
    else if (sLower.includes('delivered')) currentColor = 'var(--primary-green)';

    // Build Timeline HTML
    const timelineHTML = details.map((item) => {
        let dotClass = '';
        const s = item.status.toLowerCase();
        if (s.includes('out for delivery')) dotClass = 'dot-red';
        else if (s.includes('in transit')) dotClass = 'dot-yellow';
        else if (s.includes('delivered')) dotClass = 'dot-green';

        return `
            <div class="timeline-item ${item.done ? 'done' : 'pending'}">
                <div class="timeline-dot ${dotClass}"></div>
                <div class="timeline-content">
                    <h4>${item.status}</h4>
                    <p class="timeline-meta">${item.location} ${item.time !== 'pending' ? '— ' + item.time : ''}</p>
                    <p class="timeline-remark">"${item.remarks}"</p>
                </div>
            </div>
        `;
    }).join('');

    // Construct the Result Card
    const cardElement = `
        <div class="trackingcard">
            <h2 style="color: var(--text-dark); margin-bottom: 20px; font-weight: 800">
                <span class='GS'>GSIL</span> Shipment Timeline
            </h2>
            <div class="result-box">
                <div class="timeline-container" style="flex: 2;">${timelineHTML}</div>
                <div class="status_container">
                    <h3 style="border-bottom: 2px solid var(--primary-yellow); padding-bottom: 8px; margin-bottom: 15px;">Current Status</h3>
                    <h4 style="color: ${currentColor}; font-size: 1.3rem;">${currentStatusItem.status}</h4>
                    <p style="font-weight: 600;">${currentStatusItem.location}</p>
                    <div style="background: white; padding: 12px; border-radius: 8px; margin-top: 10px;">
                        <p style="font-size: 0.85rem; font-style: italic;">${currentStatusItem.remarks}</p>
                    </div>
                    <div style="margin-top: 20px;">
                        <p style="font-size: 0.8rem; color: var(--text-muted);">Last Updated:</p>
                        <p style="font-weight: bold; color: var(--primary-blue); font-size: 1.1rem;">
                            ${currentStatusItem.Date}
                        </p>
                    </div>
                </div>
            </div>
            
            <footer class="foot">
                &copy;Designed by Webixon
            </footer>
        </div>
    `;

    tracking_result.innerHTML = cardElement;
    tracking_result.classList.remove('hidden');
    mapHero.classList.remove('hidden');

    // Trigger the global map
    initGlobalMap(details[0].location, currentStatusItem.location, currentStatusItem.status);
});

// Global Map Function
async function initGlobalMap(originName, destinationName, currentStatus) {
    try {
        const status = currentStatus.toLowerCase();
        
        // Show destination only if In Transit, Out for Delivery, or Delivered
        const showDestinationOnly = status.includes('in transit') || 
                                     status.includes('out for delivery') || 
                                     status.includes('delivered');

        const container = L.DomUtil.get('map-hero');
        if (container != null) { container._leaflet_id = null; }

        if (showDestinationOnly) {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationName)}`);
            const data = await res.json();
            if (data.length === 0) return;

            const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            const map = L.map('map-hero').setView(coords, 12); 

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
            L.marker(coords).addTo(map).bindPopup(`<b>Current Location:</b> ${destinationName}`).openPopup();
        } else {
            const [originRes, destRes] = await Promise.all([
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(originName)}`),
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationName)}`)
            ]);

            const originData = await originRes.json();
            const destData = await destRes.json();
            if (originData.length === 0 || destData.length === 0) return;

            const originCoords = [parseFloat(originData[0].lat), parseFloat(originData[0].lon)];
            const destCoords = [parseFloat(destData[0].lat), parseFloat(destData[0].lon)];

            const map = L.map('map-hero').setView(destCoords, 3);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);

            L.marker(originCoords).addTo(map).bindPopup(`Origin: ${originName}`);
            L.marker(destCoords).addTo(map).bindPopup(`Current: ${destinationName}`).openPopup();

            const polyline = L.polyline([originCoords, destCoords], {
                color: 'var(--primary-red)',
                weight: 3,
                dashArray: '10, 10'
            }).addTo(map);

            map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
        }
    } catch (error) {
        console.error("Map Error:", error);
    }
}

track_form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputvalue = input.value.trim();

    // 1. Fetch data from the "Database"
    const allShipments = JSON.parse(localStorage.getItem('gsil_shipments')) || [];
    
    // 2. Find the specific shipment
    const foundShipment = allShipments.find(s => s.id === inputvalue);

    if (!foundShipment) {
        alert('Invalid Shipment ID. Please check and try again.');
        return;
    }

    // 3. Use the found data to fill your timeline and map
    const details = foundShipment.history; 
    const currentStatusItem = foundShipment; // Use the latest status from Admin

    // ... The rest of your rendering code (cardElement, etc.) ...
    
    // Trigger Map
    initGlobalMap(details[0].location, foundShipment.currentLocation, foundShipment.currentStatus);
});