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

const server = http.createServer(app);
//const db = require('./modules/db');
//const requestLogger = require('./middlewares/requestLogger');

const process = require('process'); // Required to mock environment variables
const port = process.env.PORT || 34000;
const {format} = require('util');
const Multer = require('multer');
const projectId = 'mystical-ace-308906'
const keyFilename = './sart-bucket-1-serviceaccount.json'
const {Storage} = require('@google-cloud/storage');

const storage = new Storage({projectId, keyFilename});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.locals.moment = require('moment');

app.use(fileUpload());

//db.connect();
server.listen(port);

// Multer is required to process file uploads and make them available via
// req.files.
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});

var RoomNum = "";
var resource_url = "";

var bucket = storage.bucket('sart-bucket-1');

var admin = require('firebase-admin')
var serviceAccount = require('./mystical-ace-308906-firebase-adminsdk-xwo47-ba36a7571f')

// connect to Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mystical-ace-308906-default-rtdb.firebaseio.com/"
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
      console.log(data);
      
      resolve(data)
    })
  })
}

router.get('/mainPage/:room', (req, res) => {
      // retrieve data of the room from firebase
      var roomID = req.params.room;
      // after creating room, create an audio & picture to prevent crash.
 
//      var userObj = Object();
      
//      var contentRef = database.ref('Room/'+roomID+'/audio/-1');
//      userObj.audio_cnt = -1;
//      contentRef.set(userObj);
 
//      var userObj2 = Object();
//      var contentRef2 = database.ref('Room/'+roomID+'/picture/-1');
//      userObj.pic_cnt = -1;
//      contentRef2.set(userObj2);
      mainFunc(roomID).then((val) => {
        //var user = val;
        var d = Object();
        d.room = roomID;
        if (val === null) {
          d.alldata = Object();
          d.alldata.audio = []
          d.alldata.picture = []
        }
        else {
          console.log("val: "+val.picture)
          if (val.audio === undefined)
              val.audio = []
          if (val.picture === undefined)
              val.picture = []
          d.alldata = val;
        }
        
        RoomNum = roomID;
        console.log('alldata: ', d.alldata);
        
        res.format({
          html: function() {
            res.render('mainPage', {data: d});
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
  console.log(req.body)
  console.log(userObj)
      
  var contentRef = database.ref('User/'+userObj.account)
  if (userObj.account === "") return;
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
    var roomNum = getRandomString(6);
    res.send({room:roomNum})
})


app.post('/upload-gstorage', multer.single('file'), (req, res, next) => {
  console.log('req data:',req)
  
  if (!req.files.file) {
    res.status(400).send('No file uploaded.');
    return;
  }
  
  // Create a new blob in the bucket and upload the file data.
  var bucket = storage.bucket('sart-bucket-1');
  var filename = req.files.file.name;
  filename = filename.replace(/\s/g, '');
  const blob = bucket.file(filename);
  const blobStream = blob.createWriteStream();
  
  blobStream.on('error', err => {
    next(err);
  });
  
  blobStream.on('finish', () => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = format(
      `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    );
//    console.log(RoomNum)
    resource_url = publicUrl;
    var response_data = 
    {
      room: RoomNum,
      publicUrl: publicUrl
    }
    //res.status(200).send(response_data);
    
    res.status(204).send();
    //res.status(204).send();
  });
  
  blobStream.end(req.files.file.data);

});

app.post('/getUrl', (req, res) => {
    //console.log("/get Url return %s:" + resource_url);
    console.log(req.body)
    var filenameObj = (JSON.parse(Object.keys(req.body)));
    console.log(filenameObj);
    res.send({publicUrl:resource_url, trackName: filenameObj.trackName})
    var userObj = Object();
    
    if (filenameObj.type === 'audio'){
      var contentRef = database.ref('Room/'+RoomNum+'/audio/'+filenameObj.audio_cnt);
      userObj.trackName = filenameObj.trackName;
      userObj.publicUrl = resource_url;
      userObj.audio_cnt = filenameObj.audio_cnt;
    }
  
    else if (filenameObj.type === 'picture') {
      var contentRef = database.ref('Room/'+RoomNum+'/picture/'+filenameObj.pic_cnt);
      userObj.publicUrl = resource_url;
      userObj.pic_cnt = filenameObj.pic_cnt;
    }
  
    contentRef.set(userObj);
})

//var fireFunc = function(firebaseUrl) {
//  return new Promise((resolve, reject) => {
//    var ref = database.ref(firebaseUrl)
//    ref.once('value').then((snapshot) => {
//      var data = snapshot.val()
//      console.log(data);
//      
//      resolve(data)
//    })
//  })
//}


app.post('/getUrlFromFirebase', (req, res) => {
  //console.log("/get Url return %s:" + resource_url);
  console.log(req.body)
  var filenameObj = (JSON.parse(Object.keys(req.body)));
  console.log(filenameObj);
  //res.send({publicUrl:resource_url})
  var userObj = Object();
  
  if (filenameObj.type === 'audio'){
    var contentRef = database.ref('Room/'+RoomNum+'/audio/'+filenameObj.audio_cnt);
  }
  else if (filenameObj.type === 'picture') {
    var contentRef = database.ref('Room/'+RoomNum+'/picture/'+filenameObj.pic_cnt);
  }
  
  contentRef.once('value').then((snapshot) => {
    var data = snapshot.val();
    console.log(data)
    res.send({publicUrl:data.publicUrl})
  })
})


app.post('/RemoveFromFirebase', (req, res) => {
  //console.log("/get Url return %s:" + resource_url);
  var filenameObj = (JSON.parse(Object.keys(req.body)));
  console.log(filenameObj);
  res.send({publicUrl:resource_url})
  var userObj = Object();
  
  if (filenameObj.type === 'audio'){
    var contentRef = database.ref('Room/'+RoomNum+'/audio/'+filenameObj.audio_cnt);
  }
  else if (filenameObj.type === 'picture') {
    var contentRef = database.ref('Room/'+RoomNum+'/picture/'+filenameObj.pic_cnt);
  }
  contentRef.remove();
})


app.use('/', router)

server.on('error', function(err){
    debug('ERROR %s', err);
});
server.on('listening', function(){
 debug('Server listening on port %s', port);
});

/*
app.post('/upload', function(req, res, next) {
  let sampleFile;
  let uploadPath;
  
  console.log(req.body);
  
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  sampleFile = req.files.sampleFile;
  
  var dir = __dirname + '/public/assets/' + req.body.room;
  
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  
  if (req.body.type === '0') {
    dir += '/audio'
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
    uploadPath = __dirname + '/public/assets/' + req.body.room + '/audio/' + req.body.id + '.mp3';
  }
    
  else if (req.body.type === '1') {
    dir += '/image'
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
    uploadPath = __dirname + '/public/assets/' + req.body.room + '/image/' + req.body.id + '.png';
  }
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
    var fileName = __dirname +'/public/assets/' + req.body.room + '/audio/' + filenameObj.n + '.mp3'
  else if (filenameObj.type === 1)
    var fileName = __dirname +'/public/assets/' + req.body.room + '/image/' + filenameObj.n + '.png'
  
  fs.unlink(fileName,function(err){
    if(err) return console.log(err);
    console.log('removed ' + fileName + ' successfully!');
  });  
  
  res.status(204).send();
})
*/
