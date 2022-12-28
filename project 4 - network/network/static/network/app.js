// Edit Post Functions
function hideEditField(event) {
    let button = event.target;
    let post_id = button.getAttribute("post_id");

    // Hiding the editing fields
    document.querySelector(`#disappear_${post_id}`).style.display = "block";
    document.querySelector(`#new_text_${post_id}`).style.display = "none";
    document.querySelector(`#edit_${post_id}`).style.display = "inline";
}

function editPost(event) {
    let button = event.target;
    let post_id = button.getAttribute("post_id");

    // Showing the editing fields
    let actual_text = document.querySelector(`#text_${post_id}`).innerHTML;
    document.querySelector(`#textarea_${post_id}`).innerHTML = actual_text;

    document.querySelector(`#disappear_${post_id}`).style.display = "none";
    document.querySelector(`#edit_${post_id}`).style.display = "none";
    document.querySelector(`#new_text_${post_id}`).style.display = "block";
}

function saveEdit(event) {
    let button = event.target;
    let post_id = button.getAttribute("post_id");
    let edited_post = document.querySelector(`#textarea_${post_id}`).value

    // Making sure the user don't submit an empty post
    if (edited_post == "" ){
        alert("WARNING: You can't submit an empty post!")
        return false;
      }
    let body = JSON.stringify({
        newEdit: edited_post,
    });

    fetch(`/edit/${post_id}`, {
        method: "PUT",
        body: body,
    })
        .then((response) => response.json())
        .then((data) => {
            document.querySelector(`#text_${post_id}`).innerHTML = data;
            
        });
        document.querySelector(`#disappear_${post_id}`).style.display = "block";
        document.querySelector(`#new_text_${post_id}`).style.display = "none";
        document.querySelector(`#edit_${post_id}`).style.display = "inline";
}

// Likes Functions
function like(event) {
    let csrftoken = getCookie('csrftoken');
    let button = event.target;
    let post_id = button.getAttribute("post_id");
    let likes_count = parseInt(document.querySelector(`#count_likes_${post_id}`).innerHTML)
    
    fetch(`/like/${post_id}`, {
        method: "POST",
        headers: { "X-CSRFToken": csrftoken },
    })
    .then((response) => {
        let created = response.status==201 ? true : false;
        let incr = created==true ? 1 : -1;
        document.querySelector(`#heart_full_${post_id}`).classList.toggle('d-none');
        document.querySelector(`#heart_empty_${post_id}`).classList.toggle('d-none');
        document.querySelector(`#count_likes_${post_id}`).innerHTML = likes_count + incr;
    })
}

// Delete post function
function deletePost(event){
    let csrftoken = getCookie('csrftoken');
    let button = event.target;
    let post_id = button.getAttribute("post_id");

    fetch(`/delete/${post_id}`, {
        method: "DELETE",
        headers: { "X-CSRFToken": csrftoken },
    })
    .then((response) => {
        myMove(post_id)

        // Giving a class display none to that post to make it disappear when deleted
        document.querySelector(`#post_div_${post_id}`).classList.toggle('hide');
        let element = document.querySelector(`#post_div_${post_id}`);
        element.style.animationPlayState = 'running';
        element.addEventListener('animationend', () =>  {
            element.remove();
        });
    })
}

// This function helps to shrink the post when it is deleted, it's a support to my transition in CSS to make it smoother
function myMove(post_id) {
    let id = null;
    const elem = document.querySelector(`#post_div_${post_id}`) 
    let pos = elem.offsetHeight;
    clearInterval(id);
    id = setInterval(frame, 1);
    function frame() {
      if (pos == 0) {
          elem.remove()
            clearInterval(id);
      } else {
        pos--; 
        elem.style.maxHeight = pos + "px"; 
      }
    }
  }

// Edit Profile Function - to edit bio and profile image
function profile(event){
    let csrftoken = getCookie('csrftoken');
    let button = event.target;
    let profile_id = button.getAttribute("profile_id");

    // Making the fields to modify the profile appear
    let current_bio = document.querySelector(`.empty_bio_${profile_id}`).innerHTML;
    document.querySelector(`#textarea_${profile_id}`).value = current_bio;
    document.querySelector(`#new_text_${profile_id}`).style.display = "block";
    document.querySelector(`.empty_bio_${profile_id}`).style.display = "none";
    document.querySelector(`#edit_profile_${profile_id}`).style.display = "none";

  }

function hideEditProfileField(event){
    let button = event.target;
    let profile_id = button.getAttribute("profile_id");
    // Making the fields to modify the profile disappear
    document.querySelector(`#new_text_${profile_id}`).style.display = "none";
    document.querySelector(`.empty_bio_${profile_id}`).style.display = "block";
    document.querySelector(`#edit_profile_${profile_id}`).style.display = "block";
}

function saveEditProfile(event){
    let csrftoken = getCookie('csrftoken');
    let button = event.target;
    let profile_id = button.getAttribute("profile_id");
    let new_file = document.querySelector(`#newfile_${profile_id}`).files
    let new_bio = document.querySelector(`#textarea_${profile_id}`).value

    // Saving the data into a formdata to send it to our api in our POST fetch
    let formData = new FormData();
    formData.append('image', new_file[0])
    formData.append('newBio', new_bio)

    fetch(`/editProfile/${profile_id}`, {
        method: "POST",
        body: formData,
        headers: { "X-CSRFToken": csrftoken},
    })
        .then((response) => response.json())
        .then((data) => {

            if (data.bio == null){
                document.querySelector(`.empty_bio_${profile_id}`).innerHTML = "No Bio";
            }
            else{
                document.querySelector(`.empty_bio_${profile_id}`).innerHTML = data.bio;
            }
            document.querySelector(`.empty_bio_${profile_id}`).style.display = "block";
            document.querySelector(`#edit_profile_${profile_id}`).style.display = "block";
            document.querySelector(`#new_text_${profile_id}`).style.display = "none";
            document.querySelector(`#profile_img_${profile_id}`).src  = data.profile_image;
            document.querySelector(`.profileImagePost`).src  = data.profile_image;

        });
}

// Create Post Function
function createPost(event){
    let csrftoken = getCookie('csrftoken');
    event.preventDefault();
    let list = document.querySelector('#post-list')
    
    let content  = document.querySelector('#textarea-post').value;
    let body = JSON.stringify({
        content: content,
    });

    fetch(`/newPost/`, {
        method: "POST",
        body: body,
        headers: { "X-CSRFToken": csrftoken },
    })
    .then((response) => response.json())
    .then((data) => {
        let formatedGhost = ghostDiv;
        formatedGhost = formatedGhost.replaceAll('{{post.author.profile_image.url}}', data.author.profile_image);
        formatedGhost = formatedGhost.replaceAll('{{post.id}}', data.id);
        formatedGhost = formatedGhost.replaceAll('{{post.author}}', data.author.username);
        formatedGhost = formatedGhost.replaceAll('{{post.content}}', data.content);
        formatedGhost = formatedGhost.replaceAll('{{post.date}}', data.date);
        formatedGhost = formatedGhost.replaceAll("{% url 'profile' id=post.author.id %}", `/profile/${data.author.id}`);
        document.querySelector('#textarea-post').value = "";
        list.innerHTML = formatedGhost + list.innerHTML;
    });
}

let ghostDiv = 
`
<div id="post_div_{{post.id}}" class="card">
            <div class="card-body">
                <div>
                    <img src="{{post.author.profile_image.url}}" alt="" class="profileImagePost item" >
                    <a href="{% url 'profile' id=post.author.id %}"  class="item"  ><h3>@{{post.author}}</h3></a>
                </div>
                
                <!-- Div to make disappear when we edit a post -->
                <div id="disappear_{{post.id}}">
                    <p id="text_{{post.id}}" style="margin-top:20px;">{{post.content}}</p>
                    <div id="date_post"><i>Posted on <span>{{post.date}}</span> </i></div>
                </div>


                <!-- Hidden Block with a text area that appear when we edit a post -->
                <div style="display:none;" id="new_text_{{post.id}}">
                    <textarea id="textarea_{{post.id}}"  name="textarea-post" class ="textarea" id="textarea" rows="3" required="True"></textarea>
                    <button onclick="hideEditField(event)" post_id="{{post.id}}" type="submit" class="btn btn-danger my-2 item">Cancel</button>
                    <button  onclick="saveEdit(event)" post_id="{{post.id}}" type="submit" class="btn btn-success my-2 item">Save</button>

                </div>

                    <span onclick="editPost(event)" button_action="edit_post" id="edit_{{post.id}}" post_id="{{post.id}}" class="edit_button">Edit</span> 
                    <span onclick="deletePost(event)" button_action="delete_post" post_id="{{post.id}}" class="edit_button">Delete</span> 

    


                    <div>
                        <span onclick="like(event)"  post_id="{{post.id}}"  id="heart_full_{{post.id}}" class="item heart d-none" style="color:red;" >&#9829;</span>
                        <span onclick="like(event)" post_id="{{post.id}}" id="heart_empty_{{post.id}}" class="item heart " style="color:red;">&#9825;</span>
                        <p id="count_likes_{{post.id}}" class="item like_count" >0</p>
                    </div>

            </div>
        </div>
`

// The following function is copied from 
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