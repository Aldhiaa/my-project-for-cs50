document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
 // Function to submit the compose form and fetch the data
  document.querySelector('form').onsubmit = sendEmail;

  // By default, load the inbox
  load_mailbox('inbox');
});



function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#singleEmail-view').style.display = 'none';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


// Loading e-mails
function fetch_emails(mailbox){
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails =>{
    // printing emails
    // console.log(emails)
    emails.forEach(email => displayEmail(email, mailbox));
    });
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#singleEmail-view').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Loading the e-mails
 fetch_emails(mailbox)
}


function sendEmail(event) {
  event.preventDefault();

  let body = JSON.stringify({
    recipients: document.querySelector('#compose-recipients').value,
    subject: document.querySelector('#compose-subject').value,
    body: document.querySelector('#compose-body').value,
  })

  console.log(body)
  fetch ('/emails', {
    method: 'POST',
    body: body
  })
  .then(response => response.json())
  .then(response => {
    if (response.message){
      return load_mailbox('sent')
    }
    throw new Error(response.error)
  })
  .catch(error=> {
    alert(error)
  })
}


function displayEmail(email, mailbox){
  const div_container = document.createElement('div');
  div_container.className = "container";

  const row = document.createElement('div');
  row.className = "row clickable my-4";
  if(email.read) {
    row.style.backgroundColor = "lightgray"
  }
  else {
    row.style.backgroundColor = "white"
  }
  div_container.append(row);

  const recipient = document.createElement('div');
  recipient.className = "col";
  if (mailbox === "inbox") {
    recipient.innerHTML = email.sender;
  }
  else {
    recipient.innerHTML = email.recipients[0];
  }
  row.append(recipient);

  const subject = document.createElement('div');
  subject.className = "col";
  subject.innerHTML = email.subject;
  row.append(subject);

  const timestamp = document.createElement('div');
  timestamp.className = "col";
  timestamp.innerHTML = email.timestamp;
  row.append(timestamp);


  if(mailbox !== "sent") {
    const button = document.createElement('button');
    button.className = "btn btn-primary";
    if (email.archived) {
      button.innerHTML = "Unarchive";
      button.className = "btn btn-danger";
    }
    else {
      button.innerHTML = "Archive";
    }
    row.append(button);

    // Stop propagation prevent the function that activate when clicking on the row if we click on the button that is part of the row
    button.addEventListener('click', (event) => 
    {change_archive_status(email.id, email.archived, button); event.stopPropagation();})
  }
  row.addEventListener('click', (event) => 
  {showSingleEmail(email);event.stopPropagation();})

  document.querySelector("#emails-view").append(div_container);
}


function change_archive_status(id, status, el){
  // Making the row disappear after archiving it to make the User experience better
  el.closest(".row").style.display = "none"
  // As our value is a boolean, we can just convert it to its opposite when switching
  status = !status
  fetch (`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: status,
    })
  })
  .then(res=>{
    if(res.ok) {
      load_mailbox('inbox')
    }
  })
  return false;
}


function change_read_status(id){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true,
    })
  })
  return false;
}


function showSingleEmail(email){

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#singleEmail-view').style.display = 'block';

  console.log(email.read)

  const emailContainer = document.createElement('div');

  const sender = document.createElement('p');
  sender.innerHTML = `<strong>From:</strong> ${email.sender}`;
  emailContainer.append(sender);

  const recipient = document.createElement('p');
  recipient.innerHTML = `<strong>To:</strong> ${email.recipients}`;
  emailContainer.append(recipient);

  const subject = document.createElement('p');
  subject.innerHTML = `<strong>Subject:</strong> ${email.subject}`;
  emailContainer.append(subject);

  const timestamp = document.createElement('p');
  timestamp.innerHTML = `<strong>Timestamp:</strong> ${email.timestamp}`;
  emailContainer.append(timestamp);

  const button = document.createElement('button');
  button.className = "btn btn-primary";
  button.innerHTML = "Reply"
  button.id = "reply"

  const hr = document.createElement('hr');

  const body = document.createElement('pre');
  body.innerHTML = email.body;

  button.addEventListener('click', () => Reply(email));

  // This will display all the html elements created in the right order when we view an email
  document.querySelector("#singleEmail-view").innerHTML = emailContainer.outerHTML
  document.querySelector('#singleEmail-view').append(button)
  document.querySelector('#singleEmail-view').append(hr)
  document.querySelector('#singleEmail-view').append(body)

  // Marking the e-mail as read = True when opened
  change_read_status(email.id)
}



function Reply(email){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#singleEmail-view').style.display = 'none';

  // Checking if the subject has already Re in it
  document.querySelector('#compose-recipients').value = email.sender;
  if (email.subject.slice(0, 4) == "Re: "){
    document.querySelector('#compose-subject').value = email.subject;
  }
  else{
    document.querySelector('#compose-subject').value = "Re: " + email.subject;
  }

  // Elements for the design of the body appearing after clicking on Reply
  const sep = document.createElement('hr');
  const line = "________________________\n"
  const space = "\n\n\n"

  document.querySelector('#compose-body').value = space + line + `On ${email.timestamp} ${email.sender} wrote:` + space + email.body + space;

}