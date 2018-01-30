// create the query url for the API

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var plateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// perform get request on the query url

d3.json(queryUrl, function(data){
    // take the response and send it to a features function
    d3.json(plateUrl, function(boundData){
        console.log(data)
        createFeatures(data.features, boundData.features);
    })
});


// create the colors for the different magnitudes
function getValue(x) {
	return x > 5 ? "#C70039" :
	       x > 4 ? "#FF5733" :
	       x > 3 ? "#FFC300" :
           x > 2 ? "#DAF7A6" :
           x > 1 ? "#229954" :
		       "#1E8449";
}

// style the markers
function style(feature) {
	return {
		"color": getValue(feature.properties.mag),
        "stroke": false,
        "radius": feature.properties.mag* 3
	};
}

function createFeatures(earthquakeData, boundryData){
    // run through features array, create popups describing the quake
    
    function onEachFeature(feature, layer){
        layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    var boundaries = L.geoJSON(boundryData, {
        onEachFeature: onEachFeature
    });

    var marker = L.geoJson(earthquakeData, {
        pointToLayer: function (feature, latlng) {    
            return L.circleMarker(latlng, style(feature)).bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
        }
    });

    createMap(boundaries, marker);
}

function createMap(boundry, quakeMarker) {
    // define layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiYmxhc2VyMjIiLCJhIjoiY2pjc2F3NXBmMHBzNjJxbnE2MjkzZWhmOCJ9.PGCeud8Kd0hTJ4Eh-w6nFg");

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiYmxhc2VyMjIiLCJhIjoiY2pjc2F3NXBmMHBzNjJxbnE2MjkzZWhmOCJ9.PGCeud8Kd0hTJ4Eh-w6nFg");

    var satmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiYmxhc2VyMjIiLCJhIjoiY2pjc2F3NXBmMHBzNjJxbnE2MjkzZWhmOCJ9.PGCeud8Kd0hTJ4Eh-w6nFg");

    // Define baseMaps to hold base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap,
        "Satellite Map": satmap
    };

    // create overlay object
    var overlayMaps = {
        QuakeMarker: quakeMarker,
        Boundries: boundry 
    };

    // create the map
    var myMap = L.map("map", {
        center: [ 37.09, -95.71],
        zoom: 5,
        layers: [satmap, quakeMarker]
    });

    var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (myMap) {

            var div = L.DomUtil.create('div', 'info legend'),
                mag = [0, 1, 2, 3, 4, 5],
                labels = [];

            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < mag.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getValue(mag[i] + 1) + '"></i> ' +
                    mag[i] + (mag[i + 1] ? '&ndash;' + mag[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);
    

    // create layer control passing in base and overlay maps, add it to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}