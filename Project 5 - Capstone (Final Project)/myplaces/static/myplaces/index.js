// Bootsrap Script for the tooltips to work.
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

// Function to create a new place
function submitNewPlace(event){
    event.preventDefault();

    let title = document.querySelector('#Title-name').value;
    let description = document.querySelector('#Description-text').value;
    let address = document.querySelector('#Address-name').value;
    let longitude = document.querySelector('#Longitude-name').value;
    let latitude = document.querySelector('#Latitude-name').value;
    let image = document.querySelector(`#newfile`).files
    let category = getCheckedBoxes()

    const alert = document.querySelector('#alert-form');
    const alertMessage = document.querySelector('#alert-message');

    document.querySelector('.close-alert').onclick = () => {
        alert.className = 'alert alert-warning alert-dismissible fade show d-none';
    }

    // Preventing the user to submit a new place without giving the necessary informations.

    if (title === '') {
        alertMessage.innerHTML = 'Please, provide a Title.'
        alert.className = 'alert alert-warning alert-dismissible fade show d-block';
        return;
    }

    if (description === '') {
        alertMessage.innerHTML = 'Please, provide a Description.'
        alert.className = 'alert alert-warning alert-dismissible fade show d-block';
        return;
    }

    if (longitude === '') {
        alertMessage.innerHTML = 'Please, provide a Longitude.'
        alert.className = 'alert alert-warning alert-dismissible fade show d-block';
        return;
    }

    if (latitude === '') {
        alertMessage.innerHTML = 'Please, provide a Latitude.'
        alert.className = 'alert alert-warning alert-dismissible fade show d-block';
        return;
    }

    if (category.length == 0 ) {
        alertMessage.innerHTML = 'Please, select at least one Category.'
        alert.className = 'alert alert-warning alert-dismissible fade show d-block';
        return;
    }


    // Saving the data into a formdata to send it to our api in our POST fetch
    let formData = new FormData();
    formData.append('title', title)
    formData.append('description', description)
    formData.append('address', address)
    formData.append('longitude', longitude)
    formData.append('latitude', latitude)
    formData.append('category', category)
    formData.append('image', image[0])

    // // Display the key/value pairs of the formData to check if it's working, uncomment if needed!
    // for (const pair of formData.entries()) {
    //     console.log(pair[0]+ ': ' + pair[1]); 
    // }
    
    let csrftoken = getCookie('csrftoken');

    fetch(`submitNewPlace`, {
        method: "POST",
        body: formData,
        headers: { "X-CSRFToken": csrftoken},
    })
    .then((response) => response.json())
    .then((data) => {
        // console.log(data)
        if (data.message) {
            const place = data.newPlace;

            // This add a delete Modal for each place -> enables us to delete a place on the map directly
            document.querySelector('.delete-modals').innerHTML+= DeleteModalIndexPage(place)
            
            let id = place.id;
            // Adding the new Location to the map
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
                <h6 style="margin-top:10px;">${place.title}</h6>
                <p>${place.description}</p>
                <button onclick="redirectToMyPlaces()" class="btn btn-primary btn-sm redirect-myplaces">See Details</button>
                <button id="${place.id}" onclick="deletePath(event)" class="btn btn-danger btn-sm redirect-myplaces">Delete</button>
            </div>
            `)) // add popup
            .addTo(map);


            alertMessage.innerHTML = data.message;
            alert.className = 'alert alert-success alert-dismissible fade show d-block';

            // Reseting the form after the submission has been successful
            document.querySelector('#Title-name').value = '';
            document.querySelector('#Description-text').value = '';
            document.querySelector('#Address-name').value = '';
            document.querySelector('#Longitude-name').value = '';
            document.querySelector('#Latitude-name').value = '';
            resetFile()
            document.querySelectorAll('input[type=checkbox]').forEach(checkbox =>{
                checkbox.checked = false;
            })

            // Closing the form after 4 seconds if nothing happens
            setTimeout(() => {
                document.querySelector('#close-form').click()
                // Making the alert disappear in the case of the client not closing it before the form gets closed. 
                // We don't want it to be visible if modal form is opened again.
                alert.className = 'alert alert-success alert-dismissible fade show d-none';
            }, '4000')
        } else {
            alertMessage.innerHTML = 'Something went wrong, please try again later.';
            alert.className = 'alert alert-danger alert-dismissible fade show d-block';
        }
    });
}