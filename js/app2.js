const track_form = document.getElementById('track-form');
const input = document.getElementById('Number');
const tracking_result = document.getElementById('tracking-results');
const mapHero = document.getElementById('map-hero');

// 1. Clear results when input is emptied
input.addEventListener('input', () => {
    if (input.value.trim() === "") {
        tracking_result.classList.add('hidden');
        if (mapHero) mapHero.classList.add('hidden');
    }
});

// 2. Main Tracking Logic
track_form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputvalue = input.value.trim();

    if (inputvalue === "") {
        alert('Please input a Shipment ID');
        return;
    }

    // --- DATA RETRIEVAL ---
    const allShipments = JSON.parse(localStorage.getItem('gsil_shipments')) || [];
    const foundShipment = allShipments.find(s => s.id === inputvalue);

    if (!foundShipment) {
        alert('Invalid Shipment ID. Please check your Admin Dashboard.');
        return;
    }

    // --- TIMELINE LOGIC ---
    // We take the history array from Admin and reverse it 
    // so the latest update is at the top of the list.
    const details = [...foundShipment.history];
    const currentStatusItem = foundShipment; 

    // --- UI COLOR LOGIC ---
    let currentColor = 'var(--primary-blue)';
    const sLower = (currentStatusItem.status || "").toLowerCase();
    
    if (sLower.includes('out for delivery')) {
        currentColor = 'var(--primary-red)';
    } else if (sLower.includes('in transit')) {
        currentColor = 'var(--primary-yellow)';
    } else if (sLower.includes('delivered')) {
        currentColor = 'var(--primary-green)';
    }

    // --- GENERATE TIMELINE HTML ---
    const timelineHTML = details.map((item) => {
        let dotClass = 'dot-blue';
        const itemStatus = (item.status || "").toLowerCase();
        
        if (itemStatus.includes('delivered')) dotClass = 'dot-green';
        else if (itemStatus.includes('in transit')) dotClass = 'dot-yellow';
        else if (itemStatus.includes('out for delivery')) dotClass = 'dot-red';

        return `
            <div class="timeline-item done">
                <div class="timeline-dot ${dotClass}"></div>
                <div class="timeline-content">
                    <h4>${item.status}</h4>
                    <p class="timeline-meta">${item.location} ${item.time ? '— ' + item.time : ''}</p>
                    <p class="timeline-remark">"${item.remarks || ''}"</p>
                </div>
            </div>
        `;
    }).join('');

    // --- RENDER CARD ---
    tracking_result.innerHTML = `
        <div class="trackingcard">
            <h2 style="margin-bottom: 20px; font-weight: 800;"><span class='GS'>GSIL</span> Shipment Timeline</h2>
            <div class="result-box">
                <div class="timeline-container" style="flex: 2;">
                    ${timelineHTML}
                </div>
                <div class="status_container">
                    <h3 style="border-bottom: 2px solid var(--primary-yellow); padding-bottom: 8px; margin-bottom: 15px;">Current Status</h3>
                    
                    <p style="font-size: 0.8rem; color: var(--text-muted);">Status:</p>
                    <h4 style="color: ${currentColor}; margin-bottom: 15px; font-size: 1.3rem;">
                        ${currentStatusItem.status}
                    </h4>

                    <p style="font-size: 0.8rem; color: var(--text-muted);">Current Location:</p>
                    <p style="font-weight: 600; margin-bottom: 15px;">${currentStatusItem.location}</p>

                    <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid var(--primary-yellow);">
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">Remarks:</p>
                        <p style="font-size: 0.85rem; font-style: italic;">${currentStatusItem.remarks || 'In transit to destination.'}</p>
                    </div>

                    <div style="margin-top: 20px;">
                        <p style="font-size: 0.8rem; color: var(--text-muted);">Date Updated:</p>
                        <p style="font-weight: bold; color: var(--primary-blue); font-size: 1.1rem;">
                            ${currentStatusItem.date || 'Processing...'}
                        </p>
                    </div>
                </div>
            </div>
            <div class="link-back">
        <a href="#" class="back">Go to Home</a>
    </div>
            <footer class="foot">
                &copy; Designed by Webixon
            </footer>
        </div>
    `;

    tracking_result.classList.remove('hidden');
    tracking_result.classList.add('reveal');
    mapHero.classList.remove('hidden');

    // Trigger Map
    initGlobalMap(foundShipment.history[0].location, currentStatusItem.location, currentStatusItem.status);
});

// 3. GLOBAL MAP FUNCTION
async function initGlobalMap(originName, destinationName, currentStatus) {
    try {
        const status = (currentStatus || "").toLowerCase();
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

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
                attribution: '© OpenStreetMap contributors' 
            }).addTo(map);

            L.marker(coords).addTo(map).bindPopup(`<b>Currently at:</b> ${destinationName}`).openPopup();
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
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
                attribution: '© OpenStreetMap contributors' 
            }).addTo(map);

            L.marker(originCoords).addTo(map).bindPopup(`<b>Origin:</b> ${originName}`);
            L.marker(destCoords).addTo(map).bindPopup(`<b>Destination:</b> ${destinationName}`).openPopup();

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