

## Brocere Sigfox log 

### Purpose

* Logs the message sent by your Sigfox objects
* Display a chart received messages, with received time, data payload and relevant metadata

This is a Node.js/Express application, with two routes:

* POST / sigfox to log a message
* GET / to display the dashboard


### Installation

#### Dependencies

Before installing the app itself, check that the main dependencies are installed on your system

##### Node.js

This app relies on node 12.4.0 
do no use io.js (heroku does not support io.js for security reasons)

To install, the better is probably to use [nvm (Node version manager)](https://github.com/creationix/nvm) that will let you switch between version of Node.

```
$ curl https://raw.githubusercontent.com/creationix/nvm/v0.25.0/install.sh | bash
$ nvm install 12
$ nvm use 12
```

##### MongoDB

* use mlab
* mongodb://<dbuser>:<dbpassword>@ds121982.mlab.com:21982/sigfox_test
* dbuser: brocere
* dbpassword: brocere0211


##### Packages

* [express](http://expressjs.com) : Fast, unopinionated, minimalist web framework
* [body-parser](http://npmjs.com/body-parser) : Node.js body parsing middleware.
* [debug](http://npmjs.com/debug) : small debugging utility
* [mongojs](http://npmjs.com/mongojs) : Easy to use module that implements the mongo api
* [ejs](http://npmjs.com/ejs) : Embedded JavaScript templates
* [moment](http://npmjs.com/moment) : Parse, validate, manipulate, and display dates

#### Install

````
$ npm install
````

##Run


#### App
```
$ ./run.sh
```

#### Env vars

You can set the following env vars to adjust your app's behaviour:

* `DEBUG` : Will filter the logs displayed in console. Check the [debug module](https://github.com/visionmedia/debug) documentation for details.
```
DEBUG=sigfox-callback:* node server.js
```
* `PORT`: the port your app will be listening to. Defaults to 34000


### Test requests

#### Check your dashboard

Navigate to http://localhost:34000/ in your browser.


### deploy on heroku


#### One-Click Deployment

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/nicolsc/sigfox-callback-demo/tree/master)

#### Using CLI (Command Line Interface)

* Make sure you have installed the [Heroku Toolbelt](https://toolbelt.heroku.com/)
* Create an application : `heroku apps:create {whatever name}`. Documentation [here](https://devcenter.heroku.com/articles/creating-apps)
* Deploy your code : `$ git push heroku master`
## Command:
```
git add .
git commit -m 'init message'
heroku create
git push heroku master
heroku open
```


All that remains to do is to set up your Sigfox callback on [the Sigfox backend](https://backend.sigfox.com)


#### How to set up a Sigfox callback

* Log into your [Sigfox backend](http://backend.sigfox.com) account
* In the _device type_ section, access to the device type of the object you want to track
* In the sidebar, click on the [Callbacks](http://backend.sigfox.com/devictype/:key/callbacks) option
* Click the _New_ button
* Set your callback as following
  * Type: DATA UPLINK
  * Channel: URL
  * Url syntax :   `http://{your URL}/sigfox?id={device}&time={time}&snr={snr}&station={station}&data={data}&avgSignal={avgSignal}&rssi={rssi}&lat={lat}&lng={lng}`
  * HTTP POST
  * _OK_
  
