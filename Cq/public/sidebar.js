var div = document.getElementById("sidebar")
function showsidebar()
{
  var element = document.getElementById("viewscreen");
  element.classList.toggle("toggle-pc");

  var element = document.getElementById("sidebar");
  element.classList.toggle("sidebar-width");


  var element = document.getElementById("rightview");
  element.classList.toggle("set-rightview");
}

function open_home_page()
{
  window.location = '/home'
}

function open_adduser_page()
{
  window.location = '/adduser'
}

function open_userlist_page()
{
    window.location = '/userslist'
}

function open_switchmodel_page()
{
  console.log("infunction");
  document.getElementById("switchmodel-title").innerHTML="Switch as User"
  document.getElementById("yes-switch").onclick = function()
  {
      window.location = '/switchcommunityhome'
  }
} 

function open_tag_page()
{
  window.location = '/tagpanel'
}

function open_changepassword_page()
{
  window.location = '/changepassword'
}

function openLogoutPage()
{
  $.confirm({
    title: 'Confirm Logout!',
    content: 'Do you want to logout?',
    buttons: {
      Yes: {
        btnClass: 'btn-success',
        action: function(){
          window.location.replace("/logout");
        }
      },
      No: {
        btnClass: 'btn-danger'
      }
    },
    theme: 'supervan'
  });
}

function open_communitylist_page()
{
  window.location = '/communityList'
}

/*
function switchState(e){
$.confirm({
    title: e,
    content: "Do you really want switch state...",
    buttons: {
        'Yes': {
            btnClass: 'btn-success',
            action: function () {
              window.location.replace("/switchasuser");
            }
        },
        'No': {btnClass: 'btn-danger',}
    }
});
}
*/
