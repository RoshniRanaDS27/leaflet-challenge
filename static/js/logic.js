// Initialize the map and set its view to a default location
const map = L.map('map').setView([20, 0], 2);

// Define base layers
const baseLayers = {
    "Satellite": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }),
    "Grayscale": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
    }),
    "Outdoors": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://opentopomap.org/copyright">OpenTopoMap</a> contributors'
    })
};

// Add default base layer to the map
baseLayers["Satellite"].addTo(map);

const earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Fetch the earthquake data
d3.json(earthquakeUrl).then(data => {
    // Function to determine marker size based on earthquake magnitude
    function markerSize(magnitude) {
        return magnitude * 4;
    }

    // Function to determine marker color based on earthquake depth
    function markerColor(depth) {
        if (depth > 90) return "#A93226";
        else if (depth > 70) return "#FF4500";
        else if (depth > 50) return "#FF8C00";
        else if (depth > 30) return "#5DADE2";
        else if (depth > 10) return "#ADFF2F";
        else return "#00FF00";
    }

    // Function to create markers
    function createMarkers(feature) {
        return L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            radius: markerSize(feature.properties.mag),
            fillColor: markerColor(feature.geometry.coordinates[2]),
            color: "#000000",
            weight: 0.5,
            opacity: 1,
            fillOpacity: 0.8
        }).bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
    }

    // Create a GeoJSON layer for earthquakes
    const earthquakes = L.geoJson(data, {
        pointToLayer: (feature, latlng) => createMarkers(feature)
    });

    // Add earthquake data to the map
    earthquakes.addTo(map);

    // Create a legend
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = function() {
        const div = L.DomUtil.create("div", "legend");
        const grades = [0, 10, 30, 50, 70, 90];
        const colors = ["#00FF00", "#ADFF2F", "#5DADE2", "#FF8C00", "#FF4500", "#A93226"];

        div.innerHTML = "<h4>Depth (km)</h4>";

        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors[i] + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(map);

    // Fetch the tectonic plates data
    d3.json(tectonicPlatesUrl).then(plateData => {
        const tectonicPlates = L.geoJson(plateData, {
            style: {
                color: "#FF6347",
                weight: 2
            }
        });

        // Add tectonic plates data to the map
        tectonicPlates.addTo(map);

        // Create layer controls
        const overlayLayers = {
            "Earthquakes": earthquakes,
            "Tectonic Plates": tectonicPlates
        };

        L.control.layers(baseLayers, overlayLayers, { collapsed: false }).addTo(map);
    });
});


