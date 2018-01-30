// create the query url for the API

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// perform get request on the query url

d3.json(queryUrl, function(data){
    // take the response and send it to a features function
    console.log(data)
    createFeatures(data.features);
});


// create the colors for the different magnitudes
function getValue(x) {
	return x > 7 ? "#800026" :
	       x > 6.5 ? "#BD0026" :
	       x > 6 ? "#E31A1C" :
	       x > 5.5 ? "#FC4E2A" :
	       x > 5 ? "#FD8D3C" :
	       x > 4.5 ? "#FEB24C" :
	       x > 4 ? "#FED976" :
		       "#FFEDA0";
}

// style the markers
function style(feature) {
	return {
		"color": getValue(feature.properties.mag),
        "stroke": false,
        "radius": feature.properties.mag* 3
	};
}

function createFeatures(earthquakeData){
    // run through features array, create popups describing the quake
    
    function onEachFeature(feature, layer){
        layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature
    });

    var marker = L.geoJson(earthquakeData, {
        pointToLayer: function (feature, latlng) {    
            return L.circleMarker(latlng, style(feature)).bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
        }
    });

    createMap(earthquakes, marker);
}

function createMap(earthquakes, quakeMarker) {
    // define layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ");

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ");

    // Define baseMaps to hold base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    // create overlay object
    var overlayMaps = {
        QuakeMarker: quakeMarker,
        Earthquakes: earthquakes 
    };

    // create the map
    var myMap = L.map("map", {
        center: [ 37.09, -95.71],
        zoom: 5,
        layers: [darkmap, quakeMarker]
    });

    

    // create layer control passing in base and overlay maps, add it to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}