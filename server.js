'use strict';

const debug = require('debug')('sigfox-callback:app');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
var busboy = require('connect-busboy'); //middleware for form/file upload
var fs = require('fs-extra');  
const fileUpload = require('express-fileupload');

const app = express();
//const app = require("https-localhost")()
const port = process.env.PORT || 34000;
const server = http.createServer(app);
const db = require('./modules/db');
const requestLogger = require('./middlewares/requestLogger');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:false}));
app.locals.moment = require('moment');

app.use(fileUpload());

db.connect();
server.listen(port);

var admin = require('firebase-admin')
//var serviceAccount = require('./test-nodejs-400b8-firebase-adminsdk-sjan6-daa9ef4537.json')
var serviceAccount = require('./core-incentive-306610-firebase-adminsdk-v3b83-e9f9a2be0c')

// connect to Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://core-incentive-306610-default-rtdb.firebaseio.com/"
})
var database = admin.database()

// express router
var router = express.Router()

router.get('/', (req, res) => {
        
      debug('enter /');
    
      res.format({
        html: function() {
          res.render('menu')
        }
      })
})

router.get('/room', (req, res) => {
    
      debug('enter room!')
      res.format({
        html: function() {
          res.render('Room')
        }
      })
})

router.get('/signIn', (req, res) => {
        
      debug('enter Signin');
    
      res.format({
        html: function() {
          res.render('SignIn')
        }
      })
})

var mainFunc = function(roomNUM) {
  return new Promise((resolve, reject) => {
    var ref = database.ref('Room/'+roomNUM)
    ref.once('value').then((snapshot) => {
      var data = snapshot.val()
      var keys = (Object.keys(snapshot.val()))
      debug('user is: '+data.userid)
      resolve(data.userid)
    })
  })
}

router.get('/mainPage/:room', (req, res) => {
      // retrieve data of the room from firebase
      var roomID = req.params.room;
      mainFunc(roomID).then((val) => {
        var user = val;
        var d = Object();
        d.room = roomID;
        d.user = user;
        
        res.format({
          html: function() {
            res.render('mainPage', {data: d})
          }
        })

      });
})
app.post('/loginWithGoogle', (req, res) => {
    debug(req.body)
    
    var userObj = (JSON.parse(Object.keys(req.body)))
    console.log(userObj.Id)
    userObj.hasRoom = false;
    userObj.music = 0
    userObj.picture = 0;
    userObj.account = userObj.Id
    var contentRef = database.ref('User/'+userObj.account)
    contentRef.set(userObj).then(() => {
    if (userObj === undefined) {
      console.log("not logged in!");
      res.format({
        html: function() {
          res.render('SignIn')
        }
      })
    }
    else {
      console.log("sign in!")
      res.format({
        html: function() {
          res.render('Room', {userdata: userObj})
        }
      })
    }

    })
})

app.post('/login', (req, res) => {
  
  var userObj = Object()
  userObj.account = req.body.account
  userObj.password = req.body.password
  userObj.hasRoom = false;
  userObj.music = 0
  userObj.picture = 0;
      
  var contentRef = database.ref('User/'+userObj.account)
  contentRef.set(userObj).then(() => {
    if (userObj.account === '') {
      console.log("not logged in!");
      res.format({
        html: function() {
          res.render('SignIn')
        }
      })
    }
    else {
      res.format({
        html: function() {
          res.render('Room', {userdata: userObj})
        }
      })
    }
  })
})
function getRandomString(length) {
  var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for ( var i = 0; i < length; i++ ) {
    result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}
app.post('/createRoom', (req, res) => {
  console.log(req.body)
  if (req.body !== undefined) {
    var userObj = (JSON.parse(Object.keys(req.body)));
    userObj.hasRoom = true;
    var newObj = Object();
    newObj.userid = userObj.account;
    var roomNum = getRandomString(6);
    var contentRef = database.ref('Room/'+roomNum)
    contentRef.set(newObj)
    database.ref('User/'+userObj.account).set(userObj)
    res.send({room:roomNum})

  }
})

app.post('/upload', function(req, res) {
  let sampleFile;
  let uploadPath;
  
  console.log(req.body);
  
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  sampleFile = req.files.sampleFile;
  if (req.body.type === '0')
    uploadPath = __dirname + '/public/assets/audio/' + req.body.id + '.mp3';
  else if (req.body.type === '1')
    uploadPath = __dirname + '/public/assets/image/' + req.body.id + '.png';
  
  console.log(uploadPath)
  
  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(uploadPath, function(err) {
    if (err)
      return res.status(500).send(err);
    
    res.status(204).send();
  });
});

app.post('/removeFile', function(req, res) {
  console.log(req.body);
  var filenameObj = (JSON.parse(Object.keys(req.body)));
  console.log(filenameObj);
  if (filenameObj.type === 0) 
    var fileName = __dirname +'/public/assets/audio/' + filenameObj.n + '.mp3'
  else if (filenameObj.type === 1)
    var fileName = __dirname +'/public/assets/image/' + filenameObj.n + '.png'
  
  fs.unlink(fileName,function(err){
    if(err) return console.log(err);
    console.log('removed ' + fileName + ' successfully!');
  });  
  
  res.status(204).send();
})

app.use('/', router)

server.on('error', function(err){
    debug('ERROR %s', err);
});
server.on('listening', function(){
 debug('Server listening on port %s', port);
});

