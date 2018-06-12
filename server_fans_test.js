var bigAssApi = require("BigAssFansAPI/BigAssApi");
var http = require('http');
var fs = require('fs');

var myMaster = new bigAssApi.FanMaster(3); // Expect only one fan in my setup
var myFans = {};

var settings = {port:8080};


myMaster.logging = true;

myMaster.onFanFullyUpdated = function(myBigAss){
  console.log(myBigAss);
  myFans[myBigAss.name] = myBigAss;
}

//create a server object:
http.createServer(function (req, res) {
  var content = 'Waiting for fans - try again...';
  var fanName = 'Bedroom Fan';
  var oneFan = myFans[fanName];
  if (req.url == '/favicon.ico') {
    // no favicon just yet..
  } else if (req.url == '/fans.css') {
	  
  } else {
    console.log('Controlling ' + oneFan['name'] + ' ' + req.url);
    if (oneFan) {
      content = fanName + ' found. bright was [' + oneFan.light.brightness +']';
      var params = req.url.split('/');
      var state = params.length > 0 ? params[1] : 'off';
      if (state === 'on') {
        oneFan.light.brightness = 9;
        console.log('ON');
      } else {
        oneFan.light.brightness = 0;
        console.log('OFF');
      }
  
      content = content + ' state= ' + state + '. Now bright=[' +  oneFan.light.brightness + ']';
    }
    content = "<a href='/on' class='big_button'>On</a> | <a href='/off'  class='big_button'>Off</a>";

    var contentHeader = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1">';
	contentHeader += '<style>.big_button { padding:10px;	border-radius: 5px;	border: 3px solid black; background-color: limegreen;}</style>';
	contentHeader += '<head><body>';
    
	var contentFooter = '</body></html>';
    res.write(contentHeader + content + contentFooter); //write a response to the client
    res.end(); //end the response
  }

}).listen(settings.port); //the server object listens on port 8080

