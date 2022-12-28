// We listen for the load of the page, once it's loaded, 
// we launch the function LoadAllPlaces which will display all of our places created.
document.addEventListener('DOMContentLoaded', function() {
    loadAllPlaces();
}, false);

// Toggle function to enable the modal forms to appear
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})


// Function loading all of our places when we arrive to this page
function loadAllPlaces() {

    fetch(`getUserLocations`, {
        method: "GET",
    })
    .then((response) => response.json())
    .then((data) => {
        // console.log(data)
        if (data.message) {
            data.Places.map(place => {

                // Creating all the  cards for each place
                document.querySelector('.cards-places').innerHTML+= `
                <div class="col" id="eachcard-${place.id}" title="${place.title}">
                    <div class="card">
                      <img id="card-image-${place.id}" src="${place.image}" height="180px" class="card-img-top" alt="${place.title}">
                            <div class="card-body">
                                <h5 id="card-title-${place.id}" class="card-title">${place.title}</h5>
                                <p id="card-description-${place.id}" style="font-size: 14px;" class="card-text">${place.description}</p>
                                <div class="align-self-end">

                                  <div id="card-categories-${place.id}" class="allCategories">
                                  ${place.categories.map(category => `
                                    <span class="badge badge-info my-2">${category.name}</span>
                                    `).join('')}
                                  </div>

                                  ${seeButton(place, data.allCategories)}
                                  ${deleteButton(place)}


                                </div>
                            </div>
                            <div class="card-footer">
                                <small class="text-muted">Created on: ${place.date}</small>
                            </div>
                    </div>
                </div>
                `  
            })
        } else if (data.error === 'No Locations created for this user yet.') {
            console.log(data.error);
            document.querySelector('.cards-places').innerHTML = '';
            document.querySelector('.error-div').innerHTML = '';
            document.querySelector('.error-div').innerHTML+= 
            `
            <h2 class="not-created-yet" style="text-align: center; margin-top:200px;">You didn't create any locations yet.</h2>
            ` 
        }
    })
}


// Below are all of the "components we include in each card to make it more interactive."

// Blue button on cards named "Details" -> triggers a modal which display the details of the place.
function seeButton(place, allCategories) {
    return `
    <button id="${place.id}" title="${place.title}" description="${place.description}" address="${place.address}" lgn="${place.longitude}" lat="${place.latitude}" 
    type="button" class="btn btn-primary btn-sm" data-toggle="modal" data-target="#exampleModalCenter-${place.id}">
        See Details
    </button>


    <div class="modal fade" id="exampleModalCenter-${place.id}" tabindex="0" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalCenterTitle">My Places</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span onclick="switchToDetails(${place.id})" aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">

                    <div style="display:block;" class="bodyDetails-${place.id}">
                        ${bodyDetails(place, allCategories)}
                    </div>

                    <div style="display:none;" class="bodyEdit-${place.id}">
                        ${bodyEdit(place, allCategories)}
                    </div>
                        
                </div>
            </div>
        </div>
    </div>
    `
} 

// Body of the card which contains the details of the place selected. -> Default display:Block;
function bodyDetails(place){
    return`
    <h3 id="title-details-${place.id}">${place.title}</h3>
    <br>
    <h5 id="description-details-${place.id}" style="color:#686868;" >${place.description}</h5>
    <br>
    <br>
    ${place.address === '' ? '' : `<h8 id="address-details-${place.id}" >&#128205; ${place.address}</h8>`}
    <br>
    <h8 id="coordinates-details-${place.id}">&#128506; Lgn: ${place.longitude} - Lat: ${place.latitude} </h8>
    
    <br>
    <div class="allCategories mt-2" id="categories-details-${place.id}">
        <h7 style="font-weight: bold;">Categories:</h7>
        ${place.categories.map(category => `
        <span class="badge badge-info">${category.name}</span>
        `).join('')}
    </div>
    <br>
    <div class="modal-footer">
        <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
        <button type="submit" class="btn btn-primary btn-sm" onclick="switchToEdit(\'${place.id}'\)">Edit</button>
    </div>

    `
}

// Body of the card which appear if we click on the button Edit. This contains all of the fields prefilled with
// The information's place in order for us to modify it easily and fast. -> Default display: None;
function bodyEdit(place, allCategories){
    let finalList = []
    place.categories.forEach(category => {
        finalList.push(category.name)
    });
    return`
        <form>

            <div id="alert-form-${place.id}" class="alert alert-danger d-none" role="alert">
                <strong><span id="alert-message-${place.id}"></span></strong>
                <button type="button" class="close">
                <span class="close-alert" aria-hidden="true">&times;</span>
                </button>
            </div>


            <div class="form-group">
                <label for="Title-name" class="col-form-label">Title:</label>
                <input type="text" class="form-control" id="title-${place.id}" value="${place.title}">
            </div>
            <div class="form-group">
                <label for="Description-text" class="col-form-label">Description:</label>
                <textarea class="form-control" id="description-${place.id}">${place.description}</textarea>
            </div>

            <div class="form-group">
                <label for="Address-name" class="col-form-label">Address: (Auto-filled - if found)</label>
                <input placeholder="Optional" type="text" class="form-control" id="Address-name-${place.id}" value="${place.address}">
            </div>

            <label for="lat" class="col-form-label">Longitude & Latitude: (Auto-filled)</label>
            <div class="input-group" id="lat">
                <span class="input-group-text">Lgn</span>
                <input type="text" class="form-control" placeholder="Longitude" id="Longitude-name-${place.id}" value="${place.longitude}">
                <span class="input-group-text">Lat</span>
                <input type="text" class="form-control" placeholder="Latitude" id="Latitude-name-${place.id}" value="${place.latitude}">
            </div>


            <div class="form-group">
                <label for="category-name" class="col-form-label">Category:</label>
                <br>
                
                    ${allCategories.map(category => `
                        <div class="form-check form-check-inline">
                            <input class="form-check-input-${place.id}" type="checkbox" 
                            ${finalList.includes(category.name) ? 'checked=true' : '' }
                            id="${category.id}" value="${category.name}">
                            <label class="form-check-label" for="inlineCheckbox1">${category.name}</label>
                        </div>
                    `).join('')}
            </div>

            <div class="form-group">
                <label for="image-name" class="col-form-label">Upload an image of this place! (Optional):</label>
                <br>
                <input type="file" id="newfile-${place.id}" class="imageFile" accept="image/*" (change)="getFile($event)" />
                <button class="btn btn-danger btn-sm" onclick="resetFile()">Reset file</button>
            </div>

            <div class="modal-footer">
                <button type="button" id="closeModal-${place.id}" class="btn btn-secondary btn-sm" data-dismiss="modal" onclick="switchToDetails(${place.id})">Close</button>
                <button type="submit" class="btn btn-primary btn-sm" onclick="submitEditPlace(event, ${place.id})">Update this location</button>
            </div>
        </form>

    `
}




// Modal that appears if we click on the button delete on a card. This will ask us if we are sure to dleete that place.
function deleteButton(place){
    return`
    <button id="${place.id}" title="${place.title}" description="${place.description}" address="${place.address}" lgn="${place.longitude}" lat="${place.latitude} type="button" class="btn btn-danger btn-sm" data-toggle="modal" data-target="#deleteModal-${place.id}">
        Delete
    </button>

    <div class="modal fade" id="deleteModal-${place.id}" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title" id="exampleModalCenterTitle">My Places</h5>
            <button id="modal-dismiss-${place.id}" type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="modal-body">
            <h4>
                Are you sure you want to delete this place ? 
            </h4>
            <br>
            <h6 id="delete-title-${place.id}">
                Title : ${place.title}
            </h6>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
            <button onclick="deletePlace(${place.id})" type="button" class="btn btn-danger btn-sm">Yes Delete</button>
        </div>
        </div>
    </div>
    </div>
    `
}

// Pass the checkbox name to the function
function getCheckedBoxes(id) {
    let checkboxes = document.querySelectorAll(`.form-check-input-${id}`)
    let checkboxesChecked = [];
    // loop over them all
    for (let i=0; i<checkboxes.length; i++) {
        // And stick the checked ones onto an array...
        if (checkboxes[i].checked) {
            checkboxesChecked.push(checkboxes[i].value);
        }
    }
    console.log('Checked Checkboxes: ', checkboxesChecked)
    // Return the array if it is non-empty, or null
    return checkboxesChecked
}

// Function to submit an edition for a place - PUT
function submitEditPlace(event, id){
    event.preventDefault();

    let title = document.querySelector(`#title-${id}`).value;
    let description = document.querySelector(`#description-${id}`).value;
    let address = document.querySelector(`#Address-name-${id}`).value;
    let longitude = document.querySelector(`#Longitude-name-${id}`).value;
    let latitude = document.querySelector(`#Latitude-name-${id}`).value;
    let image = document.querySelector(`#newfile-${id}`).files
    let category = getCheckedBoxes(id)

    const alert = document.querySelector(`#alert-form-${id}`);
    const alertMessage = document.querySelector(`#alert-message-${id}`);

    document.querySelector(`.close-alert`).onclick = () => {
        alert.className = 'alert alert-warning alert-dismissible fade show d-none';
    }

    if (title === '') {
        alertMessage.innerHTML = 'Please, provide a Title.'
        alert.className = 'alert alert-warning alert-dismissible fade show d-block';
        setTimeout(() => {
            alert.className = 'alert alert-warning alert-dismissible fade show d-none';
        }, '3000')
        return;
    }

    if (description === '') {
        alertMessage.innerHTML = 'Please, provide a Description.'
        alert.className = 'alert alert-warning alert-dismissible fade show d-block';
        setTimeout(() => {
            alert.className = 'alert alert-warning alert-dismissible fade show d-none';
        }, '3000')
        return;
    }

    if (longitude === '') {
        alertMessage.innerHTML = 'Please, provide a Longitude.'
        alert.className = 'alert alert-warning alert-dismissible fade show d-block';
        setTimeout(() => {
            alert.className = 'alert alert-warning alert-dismissible fade show d-none';
        }, '3000')
        return;
    }

    if (latitude === '') {
        alertMessage.innerHTML = 'Please, provide a Latitude.'
        alert.className = 'alert alert-warning alert-dismissible fade show d-block';
        setTimeout(() => {
            alert.className = 'alert alert-warning alert-dismissible fade show d-none';
        }, '3000')
        return;
    }

    if (category.length == 0 ) {
        alertMessage.innerHTML = 'Please, select at least one Category.'
        alert.className = 'alert alert-warning alert-dismissible fade show d-block';
        setTimeout(() => {
            alert.className = 'alert alert-warning alert-dismissible fade show d-none';
        }, '3000')
        return;
    }


    // Saving the data into a formdata to send it to our api in our POST fetch
    let formData = new FormData();
    formData.append('id', id)
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

    fetch(`submitEditPlace`, {
        method: "POST",
        body: formData,
        headers: { "X-CSRFToken": csrftoken},
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.message) {
            // console.log(data)
            update = data.update;

            // Updating the informations on the cards displayed
            document.querySelector(`#card-image-${id}`).src = update.image;
            document.querySelector(`#card-title-${id}`).textContent = update.title;
            document.querySelector(`#card-description-${id}`).textContent = update.description;
            document.querySelector(`#card-categories-${id}`).innerHTML = `
            <div class="mb-2 my-2">
            ${update.categories.map(category => `<span class="badge badge-info mr-1">${category.name}</span>`).join('')}
            </div>
            `;

            // Update info in details fields on cards (what appears when we click on see details)
            document.querySelector(`#title-details-${id}`).textContent = update.title;
            document.querySelector(`#description-details-${id}`).textContent = update.description;
            document.querySelector(`#address-details-${id}`).innerHTML = `&#128205; ${update.address}`;
            document.querySelector(`#coordinates-details-${id}`).innerHTML = `&#128506; Lgn: ${update.longitude} - Lat: ${update.latitude}`;
            document.querySelector(`#categories-details-${id}`).innerHTML = `
                <h7 style="font-weight: bold;">Categories:</h7>
                ${update.categories.map(category => `<span class="badge badge-info mr-1">${category.name}</span>`).join('')}`;

            // Updating the alert message
            alertMessage.innerHTML = data.message;
            alert.className = 'alert alert-success alert-dismissible fade show d-block';

            // Updating the delete Modal
            document.querySelector(`#delete-title-${id}`).textContent = `Title: ${update.title}`


            // Closing the form after 4 seconds if nothing happens
            setTimeout(() => {
                document.querySelector(`#closeModal-${id}`).click()
                // Making the alert disappear in the case of the client not closing it before the form gets closed. 
                // We don't want it to be visible if modal form is opened again.
                alert.className = 'alert alert-success alert-dismissible fade show d-none';
            }, '3500')
        } else if (data.error){
            alertMessage.innerHTML = 'Something went wrong, please try again later.';
            alert.className = 'alert alert-danger alert-dismissible fade show d-block';
        }
    });
}



// Functions called in our components when we close some modals or make an edit. 
// To make it simple, this helps us switch between the "see details" mode or "edit" mode. 
function switchToDetails(id){
    setTimeout(() => {
        // Creating a timeOut in order to gibe the impression to the user that everything happens in the background by magic.
        // So he won't notice that we change back to the details mode of the card if he decides to close the modal.
        document.querySelector(`.bodyEdit-${id}`).style.display = 'none';
        document.querySelector(`.bodyDetails-${id}`).style.display = 'block';
      }, "1000")
}

function switchToEdit(id){
    document.querySelector(`.bodyDetails-${id}`).style.display = 'none';
    document.querySelector(`.bodyEdit-${id}`).style.display = 'block';
}


function deletePlace(id){

    let csrftoken = getCookie('csrftoken');

    fetch(`deletePlace/${id}`, {
        method: "DELETE",
        headers: { "X-CSRFToken": csrftoken},
    })
    .then((response) => response.json())
    .then((data) => {
        // console.log(data);
        if (data.message){
            alert('Place deleted successfully !');
            document.querySelector(`#modal-dismiss-${id}`).click();
            document.querySelector(`#eachcard-${id}`).remove();
        } 
        else if (data.error){
            alert(data.error);
        }
    })

}


const inputSearch = document.getElementById('inputSearch');
inputSearch.addEventListener('input', filterBySearch);

function filterBySearch() {
    let filter = inputSearch.value.toUpperCase();
    let cards = document.querySelectorAll('.col');
    cards.forEach(card => {
        if (card.attributes.title.value.toUpperCase().indexOf(filter) > -1) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });

    // console.log(e.target.value);
}


// Creating an event Listener to track any change on the selected value for the Category Filter. 
// Once a category is selected, we launch the function 'getLocationsByCategory()' which returns a list of locations for that category
const select = document.querySelector('#sel')
select.addEventListener('change', function(){
    getLocationsByCategory(select.value)
});




// Function loading places filtered by the category we choose from.
function getLocationsByCategory(category){
    document.querySelector('.cards-places').innerHTML = '';
    document.querySelector('.error-div').innerHTML = '';

    fetch(`getLocationsByCategory/${category}`, {
        method: "GET",
    })
    .then((response) => response.json())
    .then((data) => {
        // console.log(data);
        if (data.message) {
            data.Places.map(place => {

                // Creating all the  cards for each place
                document.querySelector('.cards-places').innerHTML += `
                <div class="col" id="eachcard" title="${place.title}">
                    <div class="card">
                      <img id="card-image-${place.id}" src="${place.image}" height="180px" class="card-img-top" alt="${place.title}">
                            <div class="card-body">
                                <h5 id="card-title-${place.id}" class="card-title">${place.title}</h5>
                                <p id="card-description-${place.id}" style="font-size: 14px;" class="card-text">${place.description}</p>
                                <div class="align-self-end">

                                  <div id="card-categories-${place.id}" class="allCategories">
                                  ${place.categories.map(category => `
                                    <span class="badge badge-info my-2">${category.name}</span>
                                    `).join('')}
                                  </div>

                                  ${seeButton(place, data.allCategories)}
                                  ${deleteButton(place)}

                                </div>
                            </div>
                            <div class="card-footer">
                                <small class="text-muted">Created on: ${place.date}</small>
                            </div>
                    </div>
                </div>
                ` 
            })
        } else if (data.error === 'No Locations created within that category yet.') {
            console.log(data.error);
            document.querySelector('.error-div').innerHTML ='';
            document.querySelector('.cards-places').innerHTML = '';
            document.querySelector('.error-div').innerHTML += 
            `
            <h2 class="not-created-yet" style="text-align: center; margin-top:200px;">You didn't create any locations within that category.</h2>
            ` 
        }
    }); 
}
