var settings = {port: 4444, root: ''};

const app = require('http').createServer(handler),
    fs = require('fs'),
    bigAssApi = require("BigAssFansAPI/BigAssApi"),
    myMaster = new bigAssApi.FanMaster(3); // Expect only one fan in my setup
    
var myFans = {};

myMaster.onFanFullyUpdated = function(myBigAss){
  console.log('Found fan ', myBigAss.name);
  myFans[myBigAss.name] = myBigAss;
}

app.listen(settings.port);
console.log("server is on " + settings.port);

// handle requests..
function handler (req, res) {
  // no need for url passing - just look for css or html and show that otherwise control a fanx@ 
  var stuff = req.url.substring(1).replace('+', ' ');
  console.log('[' + stuff + ']');
  if (stuff === '') {
    console.log('sending index.html');
    serverStaticFile('index.html', res);
  } else if (stuff.indexOf('favicon') > -1) {
    // do nothing..
    console.log('doing nothing');
  } else {
    console.log(myFans);
    var params = extractUrlParams(stuff);
    console.log('processing ', params);
    //console.log('fans', myFans);

    var fanName = params['device'];
    var oneFan = myFans[fanName];
    console.log('Controlling ' + fanName + ' ', params);
    if (oneFan) {
      console.log(fanName + ' found. brightness was [' + oneFan.light.brightness +']');
      if (params.brightness) {
        oneFan.light.brightness = params.brightness;
        console.log(fanName + ' found. brightness is now [' + oneFan.light.brightness +']');
      }
    }
    console.log('Giving browser', params);
    res.writeHead(200, "application/json");
    res.end(JSON.stringify(params));
  }
}

function serverStaticFile (fileName, res) {
  fileName = (fileName === '/') ? '/index.html' : fileName;
  console.log('sending file '+ settings.root+fileName);
  fs.readFile(settings.root+fileName,
    function (err, data) {
      if (err) {
        res.writeHead(404);
        return res.end('File not found: '+fileName);
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
