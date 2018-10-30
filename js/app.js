
// Global variable
 const GITHUB_API_ENDPOINT = 'https://api.github.com/';

$(document).ready( ()=> {
  localStorage.removeItem('repo');
  localStorage.removeItem('username');
  localStorage.removeItem('access_token');
});

// Handle calls to Github
$('#getUser').click(()=> {
  var username = $('#username').val();
  var password = $('#password').val();
  var search = ($('#gitusername').val()) ? $('#gitusername').val() : username;


  if (username && password) {
    $('.error').removeClass('d-block').addClass('d-none').html('');
    $('#repoUser').html('of ' + username);
    localStorage.setItem('username', username);
    if (!localStorage.getItem('access_token'))
      createToken(username, password, search);
    else
      getUserRepo(search);
  } else {
    $('.error').removeClass('d-none').addClass('d-block').html('Please enter github credentials.');
  }
});

$('#createIssueButton').click(()=> {
  var title = $('#title').val();
  if (title) {
    $('.terror').removeClass('d-block').addClass('d-none').html('');
    createIssue();
  } else {
    $('.terror').removeClass('d-none').addClass('d-block').html('Please enter issue title.');
  }
});

function createToken(username, password, search) {
  // Create Token
  var s = username + ':' + password;
  var tokenName = Math.random().toString(36).substring(2, 15);
  $.ajax({
    url: GITHUB_API_ENDPOINT + 'authorizations',
    type: 'POST',
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + btoa(s));
    },
    data: JSON.stringify({
      scopes: ["repo"],
      note: tokenName
    }),
  }).done(function (response) {
    localStorage.setItem('access_token', 'token ' + response.token);
    getUserRepo(search);
  });

  return false;
}

function getUserRepo(search) {
  $.ajax({
    url: GITHUB_API_ENDPOINT + 'users/' + search + '/repos',
    headers: {
      'Authorization': localStorage.getItem('access_token')
    },
    success: function (response) {
      // Format the data
      var myarray = ['name', 'url'];
      var set = [];
      for (var obj in response) {
        a = [];
        if (response.hasOwnProperty(obj)) {
          for (var prop in response[obj]) {
            if (response[obj].hasOwnProperty(prop) && jQuery.inArray(prop, myarray) !== -1) {
              a.push(response[obj][prop]);
            }
          }
        }
        set.push(a);
      }
      listRepo(set);
    },
    error: function () {
      $('#userRepoList').removeClass('d-block').addClass('d-none');
      console.log('some error occured');
      alert('User not found');
    },
  });
  return false;
}

function createIssue() {
  $('#success').removeClass('d-block').addClass('d-none').html('');
  var title = $('#title').val();
  var body = $('#body').val();
  var repoName = localStorage.getItem('repo');
  var username = localStorage.getItem('username');

  $.ajax({
    type: 'POST',
    url: GITHUB_API_ENDPOINT + 'repos/' + username + '/' + repoName + '/issues',
    headers: {
      'Authorization': localStorage.getItem('access_token')
    },
    data: JSON.stringify({
      title: title,
      body: body
    }),
    success: function (response) {
      $('#title, #body').val('');
      $('#success').removeClass('d-none').addClass('d-block').html('Issue has been created successfully!');
      getUserRepo(username);
    },
    error: function () {
      console.log('some error occured while creating issue');
      alert('Issue not created due to some technical issue.');
    },
  });
  return false;
}

function listRepo(response) {

 

  var table = $('#userRepoList').DataTable({
    data: response,
    retrieve: true,
    responsive: {
      breakpoints: [
        {name: 'bigdesktop', width: Infinity},
        {name: 'meddesktop', width: 1480},
        {name: 'smalldesktop', width: 1280},
        {name: 'medium', width: 1188},
        {name: 'tabletl', width: 1024},
        {name: 'btwtabllandp', width: 848},
        {name: 'tabletp', width: 768},
        {name: 'mobilel', width: 480},
        {name: 'mobilep', width: 320}
      ]
    },
    "searching": false,
    "paging": false,
    "ordering": false,
    "autoWidth": false,
    "columnDefs": [{
      "targets": -1,
      "data": null,
      "defaultContent": '<button class="btn btn-success btn-sm">Create Issue</button>'
    } ],
    columns: [{
        title: "Name"
      
      },
      {
        title: "Url"
       
      },
      {
        title: "Action"
        
      }
    ]
  });

  $('#userRepoList tbody').on('click', 'button', function () {
    var data = table.row($(this).parents('tr')).data();
    localStorage.setItem('repo', data[0]);
    $('.modal-title').html(`Create Issue for ${data[0]}`);
    $('#createIssue').modal('show');
  });

  $('#userRepoList').removeClass('d-none').addClass('d-block');
}