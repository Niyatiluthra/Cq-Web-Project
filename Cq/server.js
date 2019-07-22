var express = require('express');
var path = require('path');
var app = express();
var ejs = require('ejs');
var session = require('express-session');
var nodemailer = require('nodemailer');
var multer = require('multer');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname,'public')))
app.use(express.static(path.join(__dirname,'public/uploads')));

app.use(express.urlencoded({extended: true}));   // ensures that we can use nested objects now
app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());

app.use(session({
  secret: "xYzUCAchitkara",
  resave: false,
  saveUnintialized: true,
}))

var mongoose = require('mongoose');
var admindb = 'mongodb://localhost/cq';

mongoose.connect(admindb);

mongoose.connection.on('error',(err) => {
  console.log('DB connection Error');
})

mongoose.connection.on('connected',(err) => {
  console.log('DB connected');
})

                                            /* Schema of the database */
var productSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    gender: String,
    city: String,
    phone: String,
    role: String,
    dob : String,
    status : String,
    state: String,
    interests: String,
    journey: String,
    expectations: String,
    switch: String,
    photoname: {type :String, default: "/dp.png"},
    flag: Number,
    githubid: String,
    owned: Array,
    join: Array,
    request: Array
})

var product = mongoose.model('admins', productSchema);

                                            /*community schema */
var communitySchema = new mongoose.Schema({
  communityname : String,
  communitylocation : {type : String, default:'Not Added'},
  communitymembershiprule : String,
  communityowner : String,
  communityownerid : String,
  communitycreatedate : String,
  communitydescription : String,
  communityimage : { type: String, default: '/defaultCommunity.jpg' },
  communityconfirm : { type : String, default: 'N' },
  requestedMembers : Array,
  joinedMembers : Array
})

var community = mongoose.model('communities', communitySchema);
/*
                                           // community member Schema //
var cmSchema = new mongoose.Schema({
  communityid : String,
  ownerid : String,
  requestedMembers : Array,
  joinedMembers : Array
})

var cm = mongoose.model('communityMember',cmSchema);
            
                                          //member community Schema//                                      
var mcSchema = new mongoose.Schema({
  memberid: String,
  ownedCommunities: Array,
  requestedCommunities: Array,
  joinedCommunities: Array
})

var mc = mongoose.model('memberCommunity',mcSchema);
*/
                                         /* login page javascript*/

app.post('/login',function (request,response)
{
    product.find({
      email: request.body.email,
      password: request.body.password
    })
    .then(data =>
      {
        if(data.length>0)
        {
          if(data[0].state =="deactive")
          {
            response.send("0000");
          }
          else
          {
            request.session.isLogin = 1;
            var obj = Object();
            obj.isLogin = 1;
            obj.email = data[0].email ;
            obj.password = data[0].password;
            obj.dob = data[0].dob;
            obj.city=data[0].city;
            obj.gender=data[0].gender;
            obj.phone=data[0].phone;
            obj.role=data[0].role;
            obj.name=data[0].name;
            obj.status=data[0].status;
            obj.state=data[0].state;
            obj._id=data[0]._id;
            obj.switch = data[0].switch;
            obj.photoname = data[0].photoname;
            obj.githubid = data[0].githubid;
            request.session.data=obj;
            response.send(data)
          }
        }
        else
        {
          response.send("0");
        }
    })
    .catch(err => {
      response.send(err)
    })
})

app.get('/notactive',function(request,response)
{
    response.render('notactive');
})

                                        // home page javascript//

app.get('/home',function(request,response)
{
    if(request.session.data.role=='admin')
    {
      if(request.session.data.switch=='user') {
        response.render('switcheditpage',{obj : request.session.data});
      }
      else {
        response.render('profile',{obj : request.session.data});
      }
    }
    else {
      response.render('userprofile',{obj : request.session.data});
    }
})

                                         // edit page javascript //
app.get('/editpagenew',function(request,response)
{
  response.render('editpagenew',{obj : request.session.data});
})

app.get('/editpage',function(request,response)
{
  if(request.session.data.switch=="admin")
    response.render('editpage', { obj : request.session.data });
    else {
      response.render('switcheditpage', { obj : request.session.data });
    }
})

                                            // edit info javascript//

app.get('/editinfo',function(request,response)
{
  if(request.session.data.role=='admin')
  {
      if(request.session.data.switch=="admin")
      response.render('editinfo' , { obj : request.session.data } );
      else {
        response.render('switcheditinfo' , { obj : request.session.data } );
      }
  }
  else {
    response.render('usereditinfo' , { obj : request.session.data } );
  }
})

                                              // add user javascript //

app.get('/adduser',function(request,response)
{
  response.render('adduser',{obj : request.session.data});
})

app.post('/adduser',function(request,response)
{
  var obj = request.body;
  if(request.body.role=='user')
  obj.status='pending'
  else {
    obj.status='confirmed'
  }
  product.create(obj,function(error,result)
  {
    if(error)
    throw error;
    else
    {
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'niyati227@gmail.com',
          pass: 'Niyati@4422'
        }
      });
      
      var mailOptions = {
        from: 'niyati227@gmail.com',
        to: request.body.email,
        subject: 'Welcome to CQ!',
        html: '<h5>You have been infornmed that you are now successfuly added to CQ community! </h5><p> Your credentials are: <br>Email : <strong>'+request.body.email+'</strong><br>Password: <strong>'+request.body.password+'</strong></p>'
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    }
  })
  response.render('profile',{obj : request.session.data});    
})

app.post('/sendmail',function(request,response)
{
  console.log(request.body);
  sendmail(request.body);
})

function sendmail(obj)
{
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'niyati227@gmail.com',
      pass: 'Niyati@4422'
    }
  });
  
  var mailOptions = {
    from: 'niyati227@gmail.com',
    to: obj.email,
    subject: obj.subject,
    html: obj.mail
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

                                              /* change password */

app.get('/changepassword',function(request,response)
{
  if(request.session.data.role=='admin')
  {
    if(request.session.data.switch=="admin")
      response.render('changepassword',{obj : request.session.data});
      else {
        response.render('switchchangepassword',{obj : request.session.data});
      }
  }
    else {
      response.render('userchangepassword',{obj : request.session.data});
    }

})

app.post('/changepassword',function (request,response)
{
      password = request.body;
      if(password.old_password!=request.session.data.password)
      response.send("0")
      else
      {
          product.updateOne( { "_id" : request.session.data._id } , { $set: { "password" : password.new_password } } , function(error,result)
          {
              if(error)
              throw error;
              else
                request.session.data.password = password.new_password;
          })
            response.send("1")
      }
})

                                              /* userlist javascript */

app.get('/userslist',function(request,response)
{
  console.log(request.body);
    response.render('userslist',{obj : request.session.data});
})
/*                             //purana js without sorting and searching//
app.post('/ul' , function(req, res) {

product.count(function(e,count){
  var start=parseInt(req.body.start);
  var len=parseInt(req.body.length);

  product.find({}).skip(start).limit(len)
.then(data=> {
  res.send({"recordsTotal": count, "recordsFiltered" : count, data})
  })
  .catch(err => {
  res.send(err)
  })
});
})*/
                                    //new js with sorting and searching// 
app.post('/ul',function (req, res) {
  // console.log(req.body);
  // console.log(req.body.order[0].column);
  console.log("req aayi");
  var count;

  if(req.body.order[0].column==0)
  {
    if(req.body.order[0].dir=="asc")
    getdata("email",1);
    else
    getdata("email",-1);
  }
  else if(req.body.order[0].column==1)
  {
    if(req.body.order[0].dir=="asc")
    getdata("phone",1);
    else
    getdata("phone",-1);
  }
  else if(req.body.order[0].column==2)
  {
    if(req.body.order[0].dir=="asc")
    getdata("city",1);
    else
    getdata("city",-1);
  }
  else if(req.body.order[0].column==3)
  {
    if(req.body.order[0].dir=="asc")
    getdata("status",1);
    else
    getdata("status",-1);
  }
  else if(req.body.order[0].column==4)
  {
    if(req.body.order[0].dir=="asc")
    getdata("role",1);
    else
    getdata("role",-1);
  }
  else {
    getdata("email",1);
  }

  function getdata(colname,sortorder)
  {
    product.countDocuments(function(e,count){
    var start=parseInt(req.body.start);
    var len=parseInt(req.body.length);
    var role=req.body.role;
    var status=req.body.status;
    var search=req.body.search.value;
    var getcount=10;
    console.log(req.body.search.value.length);

    var findobj={};
    console.log(role,status);
    if(role!="all")
        { findobj.role=role;}
    else{
        delete findobj["role"];
    }
    if(status!="all")
        {findobj.status=status;}
    else{
        delete findobj["status"];
    }
    if(search!='')
        findobj["$or"]= [{
        "email":  { '$regex' : search, '$options' : 'i' }
    }, {
        "phone":{ '$regex' : search, '$options' : 'i' }
    },{
        "city": { '$regex' : search, '$options' : 'i' }
    }
    ,{
        "status":  { '$regex' : search, '$options' : 'i' }
    }
    ,{
        "role": { '$regex' : search, '$options' : 'i' }
    }]
    else{
        delete findobj["$or"];
    }

    product.find(findobj).countDocuments(function(e,coun){
    getcount=coun;
    }).catch(err => {
      console.error(err)
      res.send(error)
    })

    product.find(findobj).skip(start).limit(len).sort({[colname] : sortorder})
    .then(data => {
        res.send({"recordsTotal" : count,"recordsFiltered" :getcount,data})
      })
      .catch(err => {
        console.error(err)
      //  res.send(error)
      })
    });
  }
})
                                                    /*update user*/

app.post('/updateuser',function(request,response)
{
  console.log(request.body._id);
  product.updateOne({"_id":request.body._id},{ $set : request.body} ,function(error,result)
  {
    if(error)
      throw error
    else
      response.send("DATA UPDATED SUCCESFULLY")
  })
})


app.post('/edituserinfo',function(request,response)
{
  var obj = request.body;
  product.updateOne({ "_id" : request.session.data._id } , { $set : { "name" : obj.name , "dob" : obj.dob , "gender" : obj.gender , "phone" : obj.phone , "city" : obj.city ,"status" : "confirmed", "interests" : obj.interests , "journey" : obj.journey , "expectations" : obj.expectations  } }  ,function(error,result)
  {
    if(error)
    throw error
    else
    {
      request.session.data.name = obj.name
      request.session.data.dob = obj.dob
      request.session.data.gender = obj.gender
      request.session.data.phone = obj.phone
      request.session.data.city = obj.city
      request.session.data.status = "confirmed"
      if(request.session.data.role=='admin')
      {
        if(request.session.data.switch=="admin")
          response.render('editpage', { obj : request.session.data });
          else {
            response.render('switcheditpage', { obj : request.session.data });
          }
      }
      else {
        response.render('userprofile', { obj : request.session.data });
      }
    }
  })
})

                                               /*upload photo*/

var photoName ;

var storage = multer.diskStorage({
  destination : './public/uploads/',
  filename : function(req, file, callback)
  {
    photoName='/'+file.fieldname + '-' + Date.now() + '@' +path.extname(file.originalname)
    callback(null,photoName);
  }
})

var upload = multer({
  storage : storage,
   limits : { fileSize : 100000},
}).single('myImage');

app.post('/upload',(req,res) => {
  upload(req,res,(err)=>{
    if(err)
    {
      console.log("File is too large !! ");
       res.send("File is too large !! Upload another.");
       
    }
    else
    {
      console.log(req.file);
      console.log(photoName);
      console.log(req.session.data._id);
      product.updateOne({ "_id" : req.session.data._id } , { $set : { "photoname" : photoName } }  ,function(error,result)
      {
        console.log(result);
        if(error)
          {
            console.log("error vale mai");
            throw error;
          }
        else
        {
          console.log("update vale mai");
          req.session.data.photoname = photoName;
          console.log(req.session.data);
          console.log(req.session.data.photoname);
          if(req.session.data.role=='admin'){
            res.render('profile', { obj : req.session.data });
            }
            else
              res.render('userprofile',{obj : req.session.data});
        }
      })
    }
  })
});

app.post('/uploadnew',(req,res) => {
  upload(req,res,(err)=>{
    if(err)
    {
      console.log("File is too large !! ");
      // res.render('profile', { obj : req.session.data });
       res.send("File is too large !! Upload another.");
      // res.redirect('/profile');
       
    }
    else{
      console.log(req.file);
      console.log(photoName);
      console.log(req.session.data._id);
      product.updateOne({ "_id" : req.session.data._id } , { $set : { "photoname" : photoName } }  ,function(error,result)
      {
        console.log(result);
        if(error)
          {
            console.log("error vale mai");
            throw error;
          }
        else
        {
          console.log("update vale mai");
          req.session.data.photoname = photoName;
          console.log(req.session.data);
          console.log(req.session.data.photoname);{
          res.render('userprofile', { obj : req.session.data });}
        }
      })
  }
})
});

                                   //switch vale ki javascript */
app.get('/changeswitch',function(request,response)
{
  request.session.data.switch = 'admin'
  product.updateOne({ "_id" : request.session.data._id } , { $set : { "switch" : "admin" } } ,function(error,result)
  {
    if(error)
    throw error;
    else
    response.render('profile' , { obj: request.session.data })
  })
})

app.get('/switchcommunityhome',function(request,response)
{
  if(request.session.data.role!='community builder')
  {
    request.session.data.switch = 'user'
    product.updateOne({ "_id" : request.session.data._id } , { $set : { "switch" : "user" } } ,function(error,result)
    {
      if(error)
      throw error;
      else
      {
          response.render('switchcommunityhome' , { obj: request.session.data })
      }
    })
  }
  else
   response.render('communityBuilder' , { obj: request.session.data })
})

                                              /*Create community*/

app.get('/switchcreatecommunity',function(request,response)
{
  if(request.session.data.role=='admin')
  response.render('switchcreatecommunity',{ obj : request.session.data })
  else {
    response.render('communityCreate',{ obj:request.session.data });
  }
})
/*
app.get('/createcommunitymain',function(request,response)
{
  response.render('communityCreate',{ obj : request.session.data })
})

app.post('/createcommunitybuilder',function(req,res)
{
  console.log(req.body);
  if(req.body.myImage)
  {
    createcommunity(req)
  }
  else {
    createcommunity(req)
  }
  res.render('communityCreate',{ obj : req.session.data });
})
*/
app.post('/createcommunity',function(request,response)
{
  console.log(request.body);
  if(request.body.myImage)
  {
    createcommunity(request)
  }
  else {
    createcommunity(request)
  }
  if(request.session.data.role=='admin')
  response.render('switchcreatecommunity',{ obj : request.session.data })
  else {
    response.render('communityCreate',{ obj:request.session.data });
  }})

function createcommunity(req)
{
  var obj = req.body;
  console.log(obj);
  var today = new Date()
  var dd = today.getDate();
  var mm = getMonths(today.getMonth());
  var yyyy = today.getFullYear();
  obj.communitycreatedate = dd + "-" + mm + "-" + yyyy
  obj.communityowner = req.session.data.name;
  obj.communityownerid = req.session.data._id;
  obj.communitylocation = "Not Added"
  community.create(obj,function(err,result)
  {
      if(err)
      throw err;
      else {
        console.log("created SUCCESFULLY");
        cid =  result._id ;
        product.updateOne(  { "_id" : req.session.data._id } , { $push : { owned : cid } } , function(err,result)
        {
          if(err)
          throw err;
          else {
            console.log(result);
          }
        })
      }
  })
}

function getMonths(monthno)
{
  var month=["Jan","Feb","Mar","Apr","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return month[monthno];
}
                                                   //cancel pending request/
app.post('/cancelRequest',function(req,res)
{
  console.log("aagya");
  community.update({ "_id" : req.body._id },{ $pull : { communityrequest : { $in : [req.session.data._id]}}} ,function(error,result){
    if(error)
      throw error;
    else {
      product.update({ "_id" : req.session.data._id },{ $pull : { request : { $in : [req.body._id] } } }, function(error,result){
        if(error)
        throw error;
        else {
          res.send("jfkd");
        }
      })
    }
  })
  res.end();
})
 ////////////////////////////////////////////////////////////////////////////////
app.get('/communityList',function(request,response)
{
  response.render('communitylist',{ obj : request.session.data })
})
app.post('/clmain',function (req, res) {
  console.log("req aayi");
  var count;
  console.log(req.body);

  if(req.body.order[0].column==0)
  {
    if(req.body.order[0].dir=="asc")
    getdata("communityname",1);
    else
    getdata("communityname",-1);
  }
  else if(req.body.order[0].column==1)
  {
    if(req.body.order[0].dir=="asc")
    getdata("communitymembershiprule",1);
    else
    getdata("communitymembershiprule",-1);
  }
  else if(req.body.order[0].column==2)
  {
    if(req.body.order[0].dir=="asc")
    getdata("communitylocation",1);
    else
    getdata("communitylocation",-1);
  }
  else if(req.body.order[0].column==3)
  {
    if(req.body.order[0].dir=="asc")
    getdata("communityowner",1);
    else
    getdata("communityowner",-1);
  }
  else if(req.body.order[0].column==4)
  {
    if(req.body.order[0].dir=="asc")
    getdata("communitycreatedate",1);
    else
    getdata("communitycreatedate",-1);
  }

  else {
    getdata("communityname",1);
  }


  function getdata(colname,sortorder)
  {
    community.countDocuments(function(e,count){
    var start=parseInt(req.body.start);
    var len=parseInt(req.body.length);
    var mrule=req.body.communitymembershiprule;
    var search=req.body.search.value;
    var getcount=10;
    console.log(req.body.search.value.length);

    var findobj={};
      console.log(mrule);
      if(mrule!="all")
          { findobj.communitymembershiprule=mrule;}
      else{
          delete findobj["communitymembershiprule"];
      }
      if(search!='')
          findobj["$or"] = [{
          "communityname":  { '$regex' : search, '$options' : 'i' }
      }, {
          "communitymembershiprule":{ '$regex' : search, '$options' : 'i' }
      },{
          "communitylocation": { '$regex' : search, '$options' : 'i' }
      }
      ,{
          "communityowner":  { '$regex' : search, '$options' : 'i' }
      }
      ,{
          "communitycreatedate": { '$regex' : search, '$options' : 'i' }
      }]
      else
        delete findobj["$or"];

      community.find(findobj).countDocuments(function(e,coun){
      getcount=coun;
    }).catch(err => {
      console.error(err)
      res.send(error)
    })

      community.find(findobj).skip(start).limit(len).sort({[colname] : sortorder})
      .then(data => {
          res.send({"recordsTotal" : count,"recordsFiltered" :getcount,data})
        })
        .catch(err => {
          console.error(err)
        //  res.send(error)
        })
      })
    }
  })

                                          /*Community list ki javascript*/

app.get('/ownedCommunities',function(req,res)
{
    community.find( { $or : [{ communityownerid : req.session.data._id },{ joinedMembers : { $in : [req.session.data._id] } },{ requestedMembers : { $in : [req.session.data._id] } }] } ).exec(function(error,result) {
      {
        if(error)
        throw error;
        else {
          console.log(result);
          res.send(result);
        }
      }
    })
})
app.get('/communities',function(request,response)
{
  console.log(request.body);
  response.render('communityUser',{obj : request.session.data});
})

app.get('/communitiesBuilder',function(request,response)
{
  console.log(request.body);
  response.render('communityBuilder',{obj : request.session.data});
})

app.get('/searchcommunity',function(req,res)
{
    // console.log("i =dssssssssssssc");
    res.render('communitysearch',{ obj : req.session.data });
})

app.get('/freeCommunities',function(req,res)
{
      community.find( { $and : [{ communityownerid : { $not : { $eq : req.session.data._id } } },{ joinedMembers : { $nin : [req.session.data._id] } },{ requestedMembers : { $nin : [req.session.data._id] } }] } ).exec(function(error,result) {
    {
      if(error)
      throw error;
      else {
        res.send(result);
      }
    }
})
})

app.post('/djoin',function(req,res)
{
  product.updateOne( { "_id" : req.session.data._id } , { $push : { join : req.body._id } } , function(error,result)
  {
      if(error)
      throw error;
      else {
        community.updateOne( { "_id" : req.body._id } , { $push : { joinedMembers : req.session.data._id } } , function(error,result)
        {
          if(error)
          throw error;
          else {
            console.log("hogya");
            res.end();
          }
        })
      }
  })
})

app.post('/pjoin',function(req,res)
{
  product.updateOne( { "_id" : req.session.data._id } , { $push : { request : req.body._id } } , function(error,result)
  {
    if(error)
    throw error;
    else {
      community.updateOne( { "_id" : req.body._id } , { $push : { requestedMembers : req.session.data._id } } , function(error,result)
      {
        if(error)
        throw error;
        else {
          console.log("hogya");
          res.end();
        }
      })
    }
  })
})

                                        // community profile ki javascript //
app.get('/communityprofile/:pro',function(req,res)
{
  console.log(".");
  //console.log(pro)
  var id = req.params.pro;
  community.findOne( { "_id" : id } , function(error,result)
  {
      if(error)
      throw error;
      else {
        console.log(id)
        res.render('communityProfile',{ obj: req.session.data, commobj: result });
      }
  })
})                                       
                                         /*passport sorted here*/

var gituid;

passport.serializeUser(function(user,done){
  done(null,user);
});

passport.deserializeUser(function(user,done){
  done(null,user);
});

passport.use(
    new GitHubStrategy({
    clientID: 'ec95f439402705f44129',
    clientSecret: 'f573031cae7146629dc9458f2e7d923dfdfcad88',
    callbackURL: "/auth/github/callback",
    session:true
    },function(accessToken, refreshToken, profile, cb) {
        console.log('###############################');
        console.log('passport callback function fired');
        // console.log(profile);
        console.log("-----------profile ka khtm---------------");
        return cb(null,profile);

    })
);

app.get('/auth/github',passport.authenticate('github'));

app.get('/auth/github/callback',passport.authenticate('github', { failureRedirect: 'login.html' }), function (req, res)
{
  console.log("githubsignin succesful");
  product.find({
    githubid : req.session.passport.user._json.id
  })
  .then(data =>
  {
    if(data.length>0)
    {
      console.log("######Found %git get mai% ######");
      console.log(data);
      req.session.islogin = 1;
      var obj = Object();
      obj.isLogin = 1;
      obj.email = data[0].email ;
      obj.city=data[0].city;
      obj.role=data[0].role;
      obj.name=data[0].name;
      obj.status=data[0].status;
      obj.state=data[0].state;
      obj.githubid = data[0].githubid;
      obj.photoname= data[0].photoname;
      if(data[0].gender)
      {
        obj.gender = data[0].gender;
        obj.phone = data[0].phone;
        obj.dob = data[0].dob;
      }
      obj._id=data[0]._id;
      req.session.data=obj;
      console.log('github login successful')
      console.log(obj)
      console.log("#########added %git mai% #########");
      res.redirect('/home');
    }
    else
    {
      console.log("###########not found %git mai%######");
      var obj = {
      name : req.session.passport.user._json.name,
      email : req.session.passport.user._json.email,
      city : req.session.passport.user._json.location,
      status : "pending",
      role : "user",
      githubid : req.session.passport.user._json.id,
      photoname : "dp.png",
      state : "active",
      }
      product.create(obj,function(error,result)
      {
        if(error)
        throw error;
        else {
          console.log("else mai");
          req.session.data = obj;
          product.find({
              githubid : req.session.passport.user._json.id
          })
          .then(data =>
          {
            req.session.data._id = data[0]._id;
            console.log("89456123168645312658645312\n"+req.session.data);
          })
          .catch(err =>
          {
            console.log("error mai");
            throw err;
          })
          res.redirect('/home');
        }
      })
    }
  })
  .catch(err =>
  {
    res.send(err)
  })
})


                                                /*logout javascript*/
app.get('/logout',function(req,res)
{
  req.session.isLogin = 0;
  req.session.destroy();
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  res.render('login');
})
                                          
app.post('/users' , function (req , res)
{
  if(req.body.role === 'All' && req.body.status === 'All')
  {
      Login.find({} , {} , {skip : parseInt(req.body.start) , limit : parseInt(req.body.length) } , function (err , data)
      {
          if(err)
          {
              console.log(err);
              return;
          }
          else
              console.log(data);
              Login.countDocuments(function(err , count)
              {
                  if(err)
                  {
                      console.log(err);
                  }
                  else
                  {
                      if (req.body.search.value)
                      {
                          data = data.filter((value) => {
                              return value.email.includes(req.body.search.value)
                          })
                      }
                      res.send({"recordsTotal": count, "recordsFiltered": data.length, data});
                  }
              });
      })
  }
  else if(req.body.role === 'All' && req.body.status !== 'All')
  {
      Login.find({status: req.body.status} , {} , {skip : parseInt(req.body.start) , limit : parseInt(req.body.length) } , function (err , data)
      {
          if(err)
          {
              console.log(err);
              return;
          }
          else
              console.log(data);
          Login.countDocuments(function(err , count)
          {
              if(err)
              {
                  console.log(err);
              }
              else
              {
                  if (req.body.search.value)
                  {
                      data = data.filter((value) => {
                          return value.email.includes(req.body.search.value)
                      })
                  }
                  res.send({"recordsTotal": count, "recordsFiltered": data.length, data});
              }
          });
      })
  }
  else if(req.body.role !== 'All' && req.body.status === 'All')
  {
      Login.find({adminType: req.body.role} , {} , {skip : parseInt(req.body.start) , limit : parseInt(req.body.length) } , function (err , data)
      {
          if(err)
          {
              console.log(err);
              return;
          }
          else
              console.log(data);
          Login.countDocuments(function(err , count)
          {
              if(err)
              {
                  console.log(err);
              }
              else
              {
                  if (req.body.search.value)
                  {
                      data = data.filter((value) => {
                          return value.email.includes(req.body.search.value)
                      })
                  }
                  res.send({"recordsTotal": count, "recordsFiltered": data.length, data});
              }
          });
      })
  }
  else
  {
      Login.find({adminType: req.body.role, status: req.body.status} , {} , {skip : parseInt(req.body.start) ,
          limit : parseInt(req.body.length) } , function (err , data)
      {
          if(err)
          {
              console.log(err);
              return;
          }
          else
              console.log(data);
          Login.countDocuments(function(err , count)
          {
              if(err)
              {
                  console.log(err);
              }
              else
              {
                  if (req.body.search.value)
                  {
                      data = data.filter((value) => {
                          return value.email.includes(req.body.search.value)
                      })
                  }
                  res.send({"recordsTotal": count, "recordsFiltered": data.length, data});
              }
          });
      })
  }
});

app.get('/',function(req,res)
{
    res.redirect('login.html');
})

console.log("Running on port 3000");
app.listen(3000) 