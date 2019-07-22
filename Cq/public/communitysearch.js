var data;0
$(document).ready(function() {
  
  var request = new XMLHttpRequest()
  request.open('GET','/freeCommunities');
  request.send();
  request.onload = function()
  {
    data = JSON.parse(request.responseText);
    console.log(data);
    for(var i in data)
    addtoDOM(data[i]);
  }
})

function addtoDOM(obj)
{
  console.log(obj);
  var div = '<div class="container" style="padding:0" id="'+obj._id+'"><div class="panel community-show-item panel-default allSidesSoft" style="style=" padding:0;background:white;"=""><div class="panel-body" style="padding:0;padding-top:20px">  <div class="col-sm-2 col-xs-3 col-lg-1 col-md-2">    <a href="#"><img src='+obj.communityimage+' class="allSides" style="height:70px;width:70px;border:3px solid rgb(235, 235, 235)">    </a>  </div>  <div class="col-sm-8 col-xs-6 col-lg-8 col-md-8 community-name"> <a href="/communityprofile" class="community-name">'+obj.communityname+'</a>  </div>  <div class="col-sm-2 col-xs-3 col-lg-3 col-md-2" style="padding:15px 10px 0 10px"><div id="joinBtns5cbf18d7f54a481812074358"><button class="btn btn-primary btn-sm pull-right" id="ccs" onclick=join("'+obj._id+'","'+obj.communitymembershiprule+'") data-id="0">'
  if(obj.communitymembershiprule=='Direct')
  div = div + 'Join';
  else {
    div = div + 'Ask To Join';
  }
  div = div + '</button></div>  </div></div><div class="panel-body" style="padding:10px 0 10px 0;">  <div class="col-sm-12 col-xs-12 col-lg-12 col-md-12"><p class="totalUsers">'+obj.requestedMembers.length+'</p>  </div>  <div class="col-sm-12 col-xs-12 col-lg-12 col-md-12 community-description" style="font-size:16px"><div id="less5cbf18d7f54a481812074358" class="community-description">'+obj.communitydescription+'</div><div id="" class="community-description community-description-full"></div></div></div></div></div>'

    $("#community-lists").append(div);
}

function join(_id,rule)
{
  console.log(_id);
  console.log(rule);
  var obj = Object();
  obj._id = _id;
  var request = new XMLHttpRequest();
  if(rule=='Direct')
  {
    console.log("Direct mai hai");
    request.open('POST','/djoin')
  }
  else {
    console.log("Permission mai hai ")
    request.open('POST','/pjoin')
  }
  request.setRequestHeader("content-Type","application/JSON");
  request.send(JSON.stringify(obj));
  request.onload = function()
  {
      var p = document.getElementById(_id.toString());
      p.parentNode.removeChild(p);
  }
}
document.getElementById('search').onkeyup=function()
{
  document.getElementById('community-lists').innerHTML=""
  var val=document.getElementById('search').value;
  console.log(val)
  for(j in data)
  {     
      if((data[j].communityname).includes(val)) 
      {
            console.log("seacrh mai")
          // console.log(commArr[j])
          addtoDOM(data[j]);
      }
  }
}