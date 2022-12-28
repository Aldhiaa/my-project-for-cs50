const MapboxKey = ''
const GoogleApi = ''

mapboxgl.accessToken = MapboxKey;
const map = new mapboxgl.Map({
    container: "map", // container ID
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: "mapbox://styles/mapbox/streets-v11", // style URL
    center: [-24, 42], // starting center in [lng, lat]
    zoom: 1, // starting zoom
    projection: "globe", // display map as a 3D globe
});

// Design the atmosphere, stars, spaces colors etc.
map.on('style.load', () => {
    map.setFog({
        color: 'rgb(186, 210, 235)', // Lower atmosphere
        'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
        'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
        'space-color': 'rgb(11, 11, 25)', // Background color
        'star-intensity': 0.6 // Background star brightness (default 0.35 at low zoooms )
    });
});


// Adding any locations created on load to the map - If any existing locations.
map.on('load', () => {
    let csrftoken = getCookie('csrftoken');

    fetch(`getUserLocations`, {
        method: "GET",
        headers: { "X-CSRFToken": csrftoken },
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.message) {
            console.log(data)
            data.Places.map( place => {

                // This add a delete Modal for each place -> enables us to delete a place on the map directly
                document.querySelector('.delete-modals').innerHTML+= DeleteModalIndexPage(place)

                let id = place.id;

                // Window object: This basically creates a global variable with dynamic name “marker+id” for each iteration of places and assigns a value of 'id' to it. 
                // Later these variables can be accessed in the script anywhere as they become global variables. As we can only remove a marker on the map by refering to the name 
                // of its variable with mapbox. We need to differenciate each marker in order to make sure to target the right one when we want to delete a place directly on the map and its marker with it.
                // Link -> https://www.geeksforgeeks.org/how-to-use-dynamic-variable-names-in-javascript/
                window['marker'+id] = new mapboxgl.Marker()
                .setLngLat([place.longitude, place.latitude])
                .setPopup(new mapboxgl.Popup()
                .setHTML(`
                <div>
                    <img style="max-width:180px; max-height:165px; margin-top:15px; border-radius: 3px;" src="${place.image}" alt="${place.title}">
                    <br>
                    <h6 style="margin-top:10px;" >${place.title}</h6>
                    <p>${place.description}</p>
                <button onclick="redirectToMyPlaces()" class="btn btn-primary btn-sm redirect-myplaces">See Details</button>
                <button id="${place.id}" onclick="deletePath(event)" class="btn btn-danger btn-sm redirect-myplaces">Delete</button>
                </div>
                `)) // add popup
                .addTo(map);
            })
        } else if (data.error) {
            console.log(data.error);
        }
    })
});


// Add zoom and rotation controls to the map.
const nav = new mapboxgl.NavigationControl({
visualizePitch: true
});
map.addControl(nav, 'bottom-right');


// Add location finder control to the map
let geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true,
    },
    // When active the map will receive updates to the device's location as it changes.
    trackUserLocation: false,
    // Draw an arrow next to the location dot to indicate which direction the device is heading.
    showUserHeading: true,
});
// Add the locate button to the map.
map.addControl(geolocate, 'bottom-right');
geolocate.on("geolocate", locateUser);

// On Geolocate, we launch this function which will fill in our form automatically in case we would like to save this place.
function locateUser(e) {
    console.log("A geolocate event has occurred.");
    // console.log("lng:" + e.coords.longitude + ", lat:" + e.coords.latitude);
    document.querySelector('#Longitude-name').value = e.coords.longitude;
    document.querySelector('#Latitude-name').value = e.coords.latitude;

    // Here, we will fetch the google API by using their reverse geocoding service. In the params, we pass the Lgn & Lat received from mapbox.
    // This will, if an address is found, fill in the field named address in the modal form, in case we need to save that location.
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${e.coords.latitude},${e.coords.longitude}&key=${GoogleApi}`)
    .then((response) => response.json())
    .then((data) => { 
        // console.log(data);
        if (data.results[0]?.formatted_address){
            // console.log(data.results[0].formatted_address)
            document.querySelector('#Address-name').value = data.results[0].formatted_address;
        } else{
            console.log(data)
        }
    })
}