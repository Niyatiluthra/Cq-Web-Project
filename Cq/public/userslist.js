var role_select = document.getElementById('role-select')
var status_select = document.getElementById('status-select')
var update = document.getElementById("editsubmit")
var tabel = document.getElementById("table-body")

function getdata() {
 $.fn.dataTable.ext.errMode = 'none';
 var table = $('#users-table').DataTable({        // users-table   table ki id hai naa ki tbody ki
   "processing" : true,
   "serverSide" : true,
   "ajax": {
     "url":"/ul",
     "type":"POST",
     "data" : function(d) {
       d.status= $('#status-select').val();
       d.role= $('#role-select').val();
     }
   },
   "columns": [
   {
     "data" : "email"
   },
   {
     "data" : "phone",
     "sorting" : "false"
   },
   {
     "data" : "city"
   },
   {
     "data" : "status",
     "sorting" : "false",
   },
   {
     "data" : "role",
     "sorting" : "false",
   },
   {
     "data" : null,
     "sorting" : "false"
   },
 ],
 "columnDefs": [{
         "targets": -1,

         "render": function (data, type, row, meta) {
             var r = row.role;
             if(r=='superadmin')
             data = '<center><i class="btn btn-primary btn-sm emailbtn actionbtns fa fa-envelope " data-toggle="modal" data-target="#mailModal" onclick=sendMail("'+row.email+'") " style="background:#000; color:#fff;"></i></center>'
             else
             {
                 data = '<center><i class="btn btn-primary btn-sm emailbtn actionbtns fa fa-envelope " data-toggle="modal" data-target="#mailModal" onclick=sendMail("'+row.email+'") " style="background:#000; color:#fff;"></i><i onclick=updateUser("'+row._id+'","'+row.email+'","'+row.phone+'","'+row.city+'","'+row.status+'","'+row.role+'") class="btn btn-primary btn-sm editbtn actionbtns fa fa-edit" data-toggle="modal" data-target="#editModal" ></i>';
                 if(row.state=='active')
                 data = data + '<i class="btn btn-warning btn-sm activebtn actionbtns fa fa-times-circle " data-toggle="modal" data-target="#activatemodal" onclick=deactivate("'+row._id+'","'+row.email+'",event) ></i></center>';
                 else
                 data = data + '<i class="btn btn-success btn-sm activebtn actionbtns fa fa-check-circle " data-toggle="modal" data-target="#activatemodal" onclick=activate("'+row._id+'","'+row.email+'",event) ></i></center>';
                 // if(row.state==='active')
                 // data = data + '<i class="btn btn-warning btn-sm activebtn actionbtns fa fa-times-circle " data-toggle="modal" data-target="#activatemodal" onclick=deactivate("'+row._id+'","'+row.username+'",event) ></i></center>';
                 // else
                 // data = data + '<i class="btn btn-success btn-sm activebtn actionbtns fa fa-check-circle " data-toggle="modal" data-target="#activatemodal" onclick=activate("'+row._id+'","'+row.username+'",event) ></i></center>';
             }
             return data;
         }
     }],
 })

 $('#role-select').on('change', function () {
   table.ajax.reload(null, false);
 });

 $('#status-select').on('change', function () {
     table.ajax.reload(null, false);
 });

 $('#refresh').on('click', function () {
     table.ajax.reload(null, false);
 });

}

$(document).ready(function() {

 console.log("1");
 getdata()

})
var options = {
  debug: 'info',
  modules: {
    toolbar: '#toolbar'
  },
  placeholder: 'Compose an epic...',
  readOnly: true,
  theme: 'snow'
};


function sendMail(email)
{
  console.log(email);
  $('#emailPop').prop('readonly',false);
  $('#emailPop').val(email);
  $('#emailPop').prop('readonly',true);
  $('#subject').val('This Mail is From CQ');

  $('#mailbutton').click(function()
  {
    var obj = Object();
    obj.mail = $('#body').val()
    obj.subject = $('#subject').val()
    obj.email = email
    console.log(obj);
    var request = new XMLHttpRequest();
    request.open('POST','/sendmail')
    request.setRequestHeader("Content-Type","application/json");
    request.send(JSON.stringify(obj));
    request.onload = () =>
    {
        alert("mail sent");
    }
  })

  $.trumbowyg.svgPath="trumbowyg.svg"
  $("#body").trumbowyg();
}


function updateUser(_id,username,phone,city,status,role)
{
  $('#eheading').html("Update " + username);
  $('#eusername').val(username);
  $('#ephone').val(phone);
  $('#ecity').val(city);
  $('#estatus').val(status);
  $('#erole').val(role);
  $('#editsubmit').click(function()
  {
      var obj = {
        _id :  _id,
        username : $("#eusername").val(),
        phone : $("#ephone").val(),
        city : $("#ecity").val(),
        status : $("#estatus").val(),
        role : $("#erole").val()
      }
      console.log(obj);
      // request.open('POST','/updateuser')
      $.ajax({
        url : '/updateuser',
        type : 'post',
        dataType : 'json',
        contentType : 'application/json',
        success : function (err,data) {
          if(err)
          throw err;
          else {
            console.log(data.msg);
          }
        },
        data : JSON.stringify(obj)
      })
  })
}

function activate(_id,username,event)
{
  console.log("1");
  $('#activatemodal-title').html("Activate User?")
  $('#activatemodal-body').html("Are you sure you want to activate " + username)
  var ele = event.target;
  var obj = Object();
  obj._id = _id;
  obj.state = "active";
  $('#activeTrue').click(function()
  {
    //console.log("12");
      var request = new XMLHttpRequest()
      request.open('POST','/updateuser')
      request.setRequestHeader("Content-type","application/json")
      request.send(JSON.stringify(obj))
      request.onload = ()=>
      {
        ele.classList.remove('fa-check-circle')
        ele.classList.add('fa-times-circle')
        ele.classList.remove('btn-success')
        ele.classList.add('btn-warning')
        $("this").attr("onclick",deactivate+"('+_id+',"+"'+username+'"+"'+event+')");
      }
  })
}

function deactivate(_id,username,event)
{
  console.log("2");
  $('#activatemodal-title').html("Deactivate User?")
  $('#activatemodal-body').html("Are you sure you want to deactivate " + username)
  var ele = event.target;
  var obj = Object();
  obj._id = _id;
  obj.state = "notactive";
  $('#activeTrue').click(function()
  {
    //console.log("12");
    var request = new XMLHttpRequest()
    request.open('POST','/updateuser')
    request.setRequestHeader("Content-type","application/json")
    request.send(JSON.stringify(obj))
    request.onload = ()=>
    {
      ele.classList.remove('fa-times-circle')
      ele.classList.add('fa-check-circle')
      ele.classList.remove('btn-warning')
      ele.classList.add('btn-success')
      // $("this").attr("onclick","";
      // $("#id").attr("onclick","activate("'+_id+'","'+username+'","'+event+'")");
      $("this").attr("onclick",activate+"('+_id+',"+"'+username+'"+"'+event+')");
    }
  })
}
/*function stateChange(state,id,email,ev)
{
var event = ev.target;
var obj = new Object;
console.log(id);
if(state=='active')
{
  $('#activatemodal-title').html("Deactivate user?");
  $('#activatemodal-body').html("Are you sure you want to deactivate user " + email + "?");
  obj = {
    _id : id,
    state : "deactive",
  }
}
else
{
  $('#activatemodal-title').html("Activate user?");
  $('#activatemodal-body').html("Are you sure you want to activate user " + email + "?");
  obj = {
    _id : id,
    state : "active",
  }
  console.log("deactive vale mai ");

}
$('#activeTrue').click(function()
{  
  var request = new XMLHttpRequest();
  request.open('POST','/updateuser');
  request.setRequestHeader("Content-Type","application/json");
  request.send(JSON.stringify(obj));
  console.log(obj._id);
request.onload = () =>
{
  if(event.classList.contains('fa-times-circle'))
  {
    //console.log("Yes in times");
    event.classList.remove('fa-times-circle');
    event.classList.remove('btn-warning');
    event.classList.add('fa-check-circle');
    event.classList.add('btn-success');
  }
  else
  {
    //console.log("in check");
    event.classList.remove('fa-check-circle');
    event.classList.add('fa-times-circle');
    event.classList.remove('btn-success');
    event.classList.add('btn-warning');
  }
}
})
}
*/


// var editor = document.getElementById("editor");
// var editor = new Quill('editor', options);

   $(document).ready(function(){
      $.trumbowyg.svgPath="trumbowyg.svg"
      $("#body").trumbowyg();
   })