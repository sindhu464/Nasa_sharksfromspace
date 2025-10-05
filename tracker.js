document.addEventListener('DOMContentLoaded', () => {
    // Initialize the map
    const map = L.map('map-container').setView([25, -45], 4); // Centered on the Atlantic
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    // Get UI elements
    const listViewPanel = document.getElementById('list-view-panel');
    const mapViewBtn = document.getElementById('map-view-btn');
    const listViewBtn = document.getElementById('list-view-btn');
    const speciesFilter = document.getElementById('species-filter');
    const sharkList = document.getElementById('shark-list');

    const species = {
        'white': { name: 'Great White' },
        'tiger': { name: 'Tiger Shark' },
        'whale': { name: 'Humpback Whale' }
    };

    const markers = L.markerClusterGroup({
        iconCreateFunction: function(cluster) {
            let count = cluster.getChildCount();
            let size = 'small';
            if (count > 10) { size = 'medium'; }
            if (count > 25) { size = 'large'; }
            return L.divIcon({
                html: '<b>' + count + '</b>',
                className: 'marker-cluster marker-cluster-' + size,
                iconSize: null
            });
        },
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true
    });
    
    const allAnimalData = [
        // Great Whites (5)
        { id: 1, species: 'white', name: 'Great White #1', location: [34.0, -76.5], pingedAt: '5 minutes ago' },
        { id: 2, species: 'white', name: 'Great White #2', location: [42.5, -60.0], pingedAt: '12 minutes ago' },
        { id: 3, species: 'white', name: 'Great White #3', location: [25.8, -78.1], pingedAt: '25 minutes ago' },
        { id: 4, species: 'white', name: 'Great White #4', location: [29.1, -118.2], pingedAt: '45 minutes ago' },
        { id: 5, species: 'white', name: 'Great White #5', location: [39.8, -72.3], pingedAt: '58 minutes ago' },
        // Tiger Sharks (5)
        { id: 6, species: 'tiger', name: 'Tiger Shark #1', location: [26.5, -77.0], pingedAt: '8 minutes ago' },
        { id: 7, species: 'tiger', name: 'Tiger Shark #2', location: [24.1, -81.5], pingedAt: '15 minutes ago' },
        { id: 8, species: 'tiger', name: 'Tiger Shark #3', location: [19.5, -65.9], pingedAt: '33 minutes ago' },
        { id: 9, species: 'tiger', name: 'Tiger Shark #4', location: [27.9, -83.5], pingedAt: '39 minutes ago' },
        { id: 10, species: 'tiger', name: 'Tiger Shark #5', location: [32.3, -64.7], pingedAt: '55 minutes ago' },
        // Whale (1)
        { id: 11, species: 'whale', name: 'Humpback Whale #1', location: [44.2, -68.3], pingedAt: '20 minutes ago' }
    ];

    const populateMapAndList = (filter = 'all') => {
        markers.clearLayers();
        sharkList.innerHTML = '';
        const filteredData = (filter === 'all') 
            ? allAnimalData 
            : allAnimalData.filter(s => s.species === filter);

        filteredData.forEach(animal => {
            const isWhale = animal.species === 'whale';
            const iconLetter = isWhale ? 'W' : 'S';
            const iconClass = `animal-marker-icon ${isWhale ? 'whale-icon' : ''}`;

            const animalIcon = L.divIcon({
                className: iconClass,
                html: `<b>${iconLetter}</b>`,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });
            const marker = L.marker(animal.location, { icon: animalIcon });
            
            const lat = animal.location[0].toFixed(4);
            const lng = animal.location[1].toFixed(4);
            
            let modelId = '';
            if (animal.species === 'white') {
                modelId = 'great_white';
            } else if (animal.species === 'tiger') {
                modelId = 'tiger_shark';
            } else if (animal.species === 'whale') {
                modelId = 'blue_whale';
            }

            let modelButtonHtml = '';
            if (modelId) {
                modelButtonHtml = `
                <a href="3d-viewer.html?model=${modelId}&name=${encodeURIComponent(animal.name)}" class="popup-button">
                    <i class="fas fa-cube"></i>
                    <span>Profile</span>
                </a>`;
            }

            // --- THIS IS THE ONLY SECTION THAT HAS CHANGED ---
            // Determine the correct analysis page based on the species
            const analysisPage = isWhale ? 'whale.html' : 'backend.html';

            const popupContent = `
                <div class="popup-title">${animal.name}</div>
                <div class="popup-location">
                    <span>Lat: ${lat}</span>
                    <span>Lon: ${lng}</span>
                </div>
                <div class="popup-actions">
                    <a href="${analysisPage}" class="popup-button">
                        <i class="fas fa-calculator"></i>
                        <span>Analysis</span>
                    </a>
                    ${modelButtonHtml}
                </div>
            `;
            // --- END OF CHANGES ---

            marker.bindPopup(popupContent, { className: 'choice-popup' });
            
            markers.addLayer(marker);

            const listItem = document.createElement('li');
            listItem.className = 'shark-list-item';
            listItem.innerHTML = `<div class="shark-list-item-icon">${iconLetter}</div><div><h4>${animal.name}</h4><p>${animal.pingedAt}</p></div>`;
            listItem.addEventListener('click', () => { 
                listViewPanel.classList.remove('is-visible'); 
                mapViewBtn.classList.add('active'); 
                listViewBtn.classList.remove('active'); 
                map.flyTo(animal.location, 10); 
                marker.openPopup(); 
            });
            sharkList.appendChild(listItem);
        });
        map.addLayer(markers);
    };

    // View switching and filter logic
    listViewBtn.addEventListener('click', () => { listViewPanel.classList.add('is-visible'); listViewBtn.classList.add('active'); mapViewBtn.classList.remove('active'); });
    mapViewBtn.addEventListener('click', () => { listViewPanel.classList.remove('is-visible'); mapViewBtn.classList.add('active'); listViewBtn.classList.remove('active'); });
    speciesFilter.addEventListener('change', (e) => populateMapAndList(e.target.value));

    // Initial load
    populateMapAndList();
});