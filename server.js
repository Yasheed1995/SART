'use strict';

const debug = require('debug')('sigfox-callback:app');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');

const app = express();
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

db.connect();
server.listen(port);

var admin = require('firebase-admin')
//var serviceAccount = require('./test-nodejs-400b8-firebase-adminsdk-sjan6-daa9ef4537.json')
var serviceAccount = require('./music-test-3760d-firebase-adminsdk-4liap-dd39cf76eb.json')

// connect to Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://music-test-3760d-default-rtdb.firebaseio.com"
})
var fireData = admin.database()

var listenRef = fireData.ref('sigfox/bpm')
listenRef.on('child_added', (snapshot) => {
  //console.log(snapshot.val())
})

// express router
var router = express.Router()

router.param('name', function(req, res, next, name) {
    //console.log('doing name validations on ' + name);
    if (name[0] === 's') {
        req.name = '/' + name
    }
    else
        debug('wrong')
    next()
})

router.param('opt', (req, res, next, opt) => {
    //console.log('doing opt val on ' + opt)
    req.opt = opt
    next()
})

/*
var menuPromise = new Promise((resolve, reject) => {
  var ref = fireData.ref('sigfox')
  ref.once('value').then((snapshot) => {
    var data = snapshot.val()
    var keys = (Object.keys(snapshot.val()))
    var data_key_path = []
    for (var type in data) {
        for(var key in data[type]) {
          var path_device
					//console.log(type)
//          if(type === 'gps') path_device = '/sigfox8'
          if(type === 'smoke') path_device = '/sigfox9'
//          else if(type === 'cow') path_device = '/sigfox7'
//          else if(type === 'gsensor') path_device = '/sigfox6'
//					else if(type === 'bpm') path_device = '/sigfox4'
//					else if(type === 'Brocere_cow') path_device = '/sigfox0'
					else continue
          var key_path = 
          {
            'key': key,
            'path': path_device,
						'type': type
          }
          data_key_path.push(key_path)
        }
    }
    resolve(data_key_path)
  })
})
*/
router.get('/', (req, res) => {
        
    
      res.format({
        html: function() {
          res.render('menu')
        }
      })
})

router.get('/room', (req, res) => {
        
    
      res.format({
        html: function() {
          res.render('Room')
        }
      })
})

router.get('/mainPage', (req, res) => {
        
    
      res.format({
        html: function() {
          res.render('mainPage')
        }
      })
})
/*
router.get('/:name/:opt', function(req, res){
  var path = req.name
  var type = parseInt(path[7])
  var ref_id
  if(type === 8) ref_id = 'sigfox/gps/' + req.name.slice(9, )
  else if (type === 9) ref_id = 'sigfox/smoke/' + req.name.slice(9, )
  else if (type === 7) ref_id = 'sigfox/cow/' + req.name.slice(9, )
  else if (type === 6) ref_id = 'sigfox/gsensor/' + req.name.slice(9, )
	else if (type === 4) ref_id = 'sigfox/bpm/' + req.name.slice(9, )
	else if (type === 0) ref_id = 'sigfox/Brocere_cow_json/' + req.name.slice(9, )
  else  'sigfox/' + req.name.slice(9, )
  var ref = fireData.ref(ref_id).orderByChild('payload/time')
  ref.once('value', (snapshot) => { 

    var data = snapshot.val()

    console.log(data);
		//console.log(ref_id)
    //console.log(data)
    data = Object.keys(data).map(function(_) { return data[_]; });
    data = data.reverse()

    var render_graph = 'sigfox-logs_' + path[7]
    var render_history = 'sigfox-history_' + path[7]
    var render_which = (req.opt === 'graph' ? render_graph : render_history)

    switch(type) {
      case 9:
        data = dbproc_MAX30105(data)
        break
      case 8:
        data = dbproc_gps(data)
        break
      case 7:
        data = dbproc_cow(data)
        break
      case 6:
        data = dbproc_cow_ADXL345(data)
        break
      case 4:
        data = dbproc_cow_bpm(data)
        break
      case 0:
        data = dbproc_cow_demo(data)
        break
      default:
        data = dbproc(data)
    }

    res.format({
      json: function() {
        res.json({entries: data})
      },

      html: function() {
		    res.render(render_which, {title: 'sigfox_graph', db_data: data})
      },
      default:function(){
        res.status(406).send({err:'Invalid Accept header. This method only handles html & json'});
      }
    })
  })
    .catch(function(err){
      res.format({
        json: function(){
            return res.json({err:'An error occured while fetching messages', details:err});
        },
        html: function(){
              return res.status(500).render('error', {title:'An error occured while fetching messages', err:err});
          },
        default: function(){
          res.status(406).send({err:'Invalid Accept header. This method only handles html & json'});
        }
      });
    })
});
*/
app.post('/sigfox0.firebase', (req, res) => {
    var ref_id = 'sigfox/ADXL345/' + req.body.id

    var entry = {
      "method": req.method,
      "id": req.body.id,
      "data": req.body.data,
      "path": req.url.replace(/\?(.*)$/, '').slice(0, 8),
      "time": req.body.time,
    }

    var contentRef = fireData.ref(ref_id).push()
    contentRef.set({'payload': entry}).then(() => {
      fireData.ref(ref_id).once('value', (snapshot) => {
        res.send({ "success": true })
      })

    })
})

app.use('/', router)

server.on('error', function(err){
    debug('ERROR %s', err);
});
server.on('listening', function(){
 debug('Server listening on port %s', port);
});

