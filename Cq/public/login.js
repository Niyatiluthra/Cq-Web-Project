var login = document.getElementById("submit")
login.addEventListener("click",function()
{
  var email = document.getElementById("email")
  var password = document.getElementById("password")
    console.log("hello");
    var obj = new Object();
    obj.email = email.value;
    obj.password = password.value;
    
    console.log(obj);
    var request = new XMLHttpRequest();
    request.open('POST','/login');
    request.setRequestHeader("Content-Type","application/json");
    request.send(JSON.stringify(obj));
    request.onload = () =>
    {
        if(request.responseText=="0000")
        {
          window.location = '/notactive'
        }
        if(request.responseText=='0')
        {
          document.getElementById("wrong").style.display = "block"
        }
        else
        {
          var obj = new Object;
          obj = JSON.parse(request.responseText);
          console.log(obj[0].status)
          if(obj[0].status=='confirmed')
          {
            console.log("confirmed");
            window.location = '/home'
          }
          else if(obj[0].status=='pending')
          {
            console.log("pending");
            window.location = '/editpagenew';
          }
        }
    }
})


/*
var Git = document.getElementById("submitGit");

Git.addEventListener("click",function()
{
  var email = document.getElementById("email")
  var password = document.getElementById("password")
  console.log("hello");
  var obj = new Object();
  obj.email = email.value;
  obj.password = password.value;
  console.log(obj);
  window.location = '/githublogin'

})
*/