var settings = {port: 4444, root: ''};

const app = require('http').createServer(handler),
    fs = require('fs'),
    bigAssApi = require("BigAssFansAPI/BigAssApi"),
    myMaster = new bigAssApi.FanMaster(3),
    lifxClientApi = require('node-lifx').Client,
    lifxClient = new lifxClientApi(),
    lightSpeed = 1000;

var myFans = {},
    allLights = {};

myMaster.onFanFullyUpdated = function(myBigAss){
  console.log('Found fan ', myBigAss.name);
  myFans[myBigAss.name] = myBigAss;
}

var lightIps = {
  '192.168.1.9' : 'Bedroom light',
  '192.168.1.10' : 'Kitchen light',
  '192.168.1.11' : 'Living room light',
  '192.168.1.12' : 'Hallway light',
};

var lightNames = {};

Object.keys(lightIps).forEach( function (ip) {
  lightNames[lightIps[ip]] = ip;
});

var maxLights = 3,
    lightCount = 0;

lifxClient.on('light-new', function(light) {
  console.log('Found light ' + lightIps[light.address]);
  light.getState( function (error, data) {
    //console.log('light data', data);
  });
  if (lightCount++ == maxLights) {
    allLights = lifxClient.lights();
  }
});

lifxClient.init();

app.listen(settings.port);
console.log("server is on " + settings.port);

// handle requests..
function handler (req, res) {
  // no need for url passing - just look for css or html and show that otherwise control a fanx@ 
  var stuff = req.url.substring(1).replace('+', ' ');
  //console.log('[' + stuff + ']');


  if (stuff === '') {
    serverStaticFile('index.html', res);
  } else if (stuff.indexOf('favicon') > -1) {
    serverStaticFile(stuff, res);
  } else {
    var params = extractUrlParams(stuff);

    if (params.part === 'Fan') {
      var device = myFans[params.room + ' Fan'];
      if (device) {
        device.fan.speed = params.state;
      } else {
        params.error = 'Cant find ' + params.room + ' Fan';
      }
    } else if (params.part === 'Light') {
      var device = myFans[params.room + ' Fan'];
      if (device) {
        device.light.brightness = params.state;
      } else {
        params.error = 'Cant find ' + params.room + ' Fan';
      }
    } else if (params.part === 'Lamp') { 
      params.room = params.room.replace('Room', 'room');
      var light = lifxClient.light(params.room + ' light');
      if (light) {
        if (params.state === '0') {
          light.off(lightSpeed);
        } else {
          light.on(lightSpeed);
          light.color(0, 0, parseInt(params.state), 3500, lightSpeed);
        } 
      } else {
        params.error = 'Cant find ' + params.room + ' light';
      }
    }
    console.log(params);
    res.writeHead(200, "application/json");
    res.end(JSON.stringify(params));
  }
}

function serverStaticFile (fileName, res) {
  fileName = (fileName === '/') ? '/index.html' : fileName;
  console.log('sending file '+ settings.root + fileName);
  fs.readFile(settings.root + fileName,
    function (err, data) {
      if (err) {
        res.writeHead(404);
        return res.end('File not found: ' + fileName);
      } else {
        res.writeHead(200, "text/html");
        return res.end(data);
      }
    }
  );
};

// splits out params from ?bit=1&bob=thing  = {bit:1, bob='thing'}
function extractUrlParams (req) {
  // remove the leading ?
  var stuff = req.substring(1);
  var bits = stuff.split('&');
  var params = {};
  bits.forEach( function (param, index) {
    var parts = param.split('=');
    params[parts[0]] = parts[1]; 
  });

  return params;
};
