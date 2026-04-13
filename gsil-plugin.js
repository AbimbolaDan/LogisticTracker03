(function() {
    
    const lcss = document.createElement('link');
    lcss.rel = 'stylesheet';
    lcss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(lcss);


    const style = document.createElement('style');
    style.innerHTML = `
        .gsil-p { font-family: 'Inter', sans-serif; max-width: 500px; margin: 20px auto; padding: 25px; background: #fff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .gsil-h { color: #0066ff; font-weight: 800; margin-bottom: 15px; text-transform: uppercase; font-size: 1.2rem; }
        .gsil-flex { display: flex; gap: 8px; }
        .gsil-in { flex: 1; padding: 12px; border: 2px solid #eee; border-radius: 6px; outline: none; }
        .gsil-btn { background: #0066ff; color: #fff; border: none; padding: 12px 18px; border-radius: 6px; cursor: pointer; font-weight: 600; }
        #gsil-m { height: 300px; width: 100%; margin-top: 15px; border-radius: 8px; display: none; border: 1px solid #ddd; }
        .gsil-res { margin-top: 15px; padding: 15px; background: #f9f9f9; border-left: 4px solid #0066ff; border-radius: 4px; display: none; }
        .gsil-load { color: #0066ff; font-weight: 700; display: none; margin: 10px 0; }
    `;
    document.head.appendChild(style);

    // 3. LOAD LEAFLET JS & INITIALIZE
    const ljs = document.createElement('script');
    ljs.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    document.head.appendChild(ljs);

    ljs.onload = () => {
        const target = document.getElementById('gsil-tracker-plugin') || document.body;
        const root = document.createElement('div');
        root.className = 'gsil-p';
        root.innerHTML = `
            <div class="gsil-h">GSIL Track Shipment</div>
            <form id="gsil-f">
                <div class="gsil-flex">
                    <input type="text" id="gsil-id" class="gsil-in" placeholder="Shipment ID..." required>
                    <button type="submit" class="gsil-btn">Track</button>
                </div>
            </form>
            <div id="gsil-l" class="gsil-load">RETRIEVING...</div>
            <div id="gsil-r" class="gsil-res"></div>
            <div id="gsil-m"></div>
        `;
        target.appendChild(root);

        document.getElementById('gsil-f').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('gsil-id').value.trim();
            const loader = document.getElementById('gsil-l');
            const res = document.getElementById('gsil-r');
            const mapDiv = document.getElementById('gsil-m');

            loader.style.display = 'block';
            res.style.display = 'none';
            mapDiv.style.display = 'none';

            try {
                const r = await fetch(`https://logistics-tracker-sxg2.onrender.com/api/shipments/${id}`);
                if (!r.ok) throw new Error();
                const d = await r.json();

                res.innerHTML = `<p><strong>Status:</strong> ${d.status}</p><p><strong>Location:</strong> ${d.location}</p>`;
                res.style.display = 'block';
                mapDiv.style.display = 'block';

                setTimeout(() => initMap(d.departure, d.location), 200);
            } catch (err) {
                alert("ID not found.");
            } finally {
                loader.style.display = 'none';
            }
        });
    };

    async function initMap(o, d) {
        const m = document.getElementById('gsil-m');
        if (m._leaflet_id) { m._leaflet_id = null; m.innerHTML = ""; }
        const gc = async (q) => {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
            return res.json();
        };
        const [oD, dD] = await Promise.all([gc(o), gc(d)]);
        if (!oD.length || !dD.length) return;
        const map = L.map('gsil-m').setView([oD[0].lat, oD[0].lon], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        L.marker([oD[0].lat, oD[0].lon]).addTo(map);
        L.marker([dD[0].lat, dD[0].lon]).addTo(map).openPopup();
        L.polyline([[oD[0].lat, oD[0].lon], [dD[0].lat, dD[0].lon]], {color: '#0066ff', dashArray: '5,5'}).addTo(map);
        setTimeout(() => { map.invalidateSize(); map.fitBounds([[oD[0].lat, oD[0].lon], [dD[0].lat, dD[0].lon]]); }, 300);
    }
})();
