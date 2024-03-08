// your_script.js
import config from './config.js';

// Initialize the map
const map = L.map('map').setView([0, 0], 2);

// Add a base map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Load and visualize the earthquake data
const geoJSONUrl = config.geoJSONUrl;
fetch(geoJSONUrl)
    .then(response => response.json())
    .then(data => {
        // Create a function to determine marker size based on magnitude
        function getMarkerSize(magnitude) {
            return magnitude * 5;
        }

        // Create a function to determine marker color based on depth
        function getMarkerColor(depth) {
            return depth > 70 ? '#d73027' :
                   depth > 30 ? '#4575b4' :
                                '#91bfdb';
        }

        // Loop through the earthquake data and add markers to the map
        L.geoJSON(data.features, {
            pointToLayer: (feature, latlng) => {
                const magnitude = feature.properties.mag;
                const depth = feature.geometry.coordinates[2];
                const markerSize = getMarkerSize(magnitude);
                const markerColor = getMarkerColor(depth);

                // Create a circle marker with popup
                return L.circleMarker(latlng, {
                    radius: markerSize,
                    fillColor: markerColor,
                    color: '#000',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                }).bindPopup(`<strong>Location:</strong> ${feature.properties.place}<br><strong>Magnitude:</strong> ${magnitude}<br><strong>Depth:</strong> ${depth}`);
            }
        }).addTo(map);

        // Create a legend
        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'info legend');
            const depths = [0, 30, 70];
            const labels = [];

            // Loop through depth intervals and generate labels
            for (let i = 0; i < depths.length; i++) {
                const from = depths[i];
                const to = depths[i + 1];
                labels.push(
                    `<i style="background:${getMarkerColor(from + 1)}"></i> ${from + 1}${to ? `&ndash;${to}` : '+'}`
                );
            }

            div.innerHTML = labels.join('<br>');
            return div;
        };
        legend.addTo(map);
    });