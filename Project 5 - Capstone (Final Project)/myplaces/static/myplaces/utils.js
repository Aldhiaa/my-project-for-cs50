// The following function is copied from - Purpose, provide a CsrfToken
// https://docs.djangoproject.com/en/dev/ref/csrf/#ajax
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Function to get all of the checkboxes that are checked. It returns an array.
function getCheckedBoxes() {
    let checkboxes = document.querySelectorAll('.form-check-input')
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


// Function to reset the input field for the image if, for example, 
// we did a mistake when choosing an image or just want to upload something else.
function resetFile() {
    const file = document.querySelector('.imageFile');
    file.value = '';
}

function redirectToMyPlaces(){
    window.location.replace("http://127.0.0.1:8000/myplaces");
}

// These functions are called in our map.js file and index.js file. They enable us to create a delete Pop up Modal
// Which wiill ask us if we are sure if we want to delete

// This function simply trigger the opening of the modal which is not visible at the beginning.
function deletePath(event){

    let button = event.target;
    let id = button.getAttribute("id");

    document.querySelector(`#delete-modal-${id}`).click()

}

// This is the modal that will be displayed if we click on The button delete on a Pop Up for a location
function DeleteModalIndexPage(place){
return `
<button style="visibility:hidden;" id="delete-modal-${place.id}" type="button" class="btn btn-danger btn-sm" data-toggle="modal" data-target="#deleteModal-${place.id}">
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
            <button type="button" id="closeModalDeleteOnMap-${place.id}" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
            <button onclick="deletePlaceOnMap(${place.id})" type="button" class="btn btn-danger btn-sm">Yes Delete</button>
        </div>
        </div>
    </div>
</div>
`
}

// This is the function to delete the place selected.
function deletePlaceOnMap(id){
    let csrftoken = getCookie('csrftoken');

    fetch(`deletePlace/${id}`, {
        method: "DELETE",
        headers: { "X-CSRFToken": csrftoken},
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.message){
            alert('Place deleted successfully !');
            window['marker'+id].remove()
            document.querySelector(`#closeModalDeleteOnMap-${id}`).click();
        } 
        else if (data.error){
            alert(data.error);
        }
    })
}



