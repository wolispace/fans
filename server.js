var settings = {port: 4444, root: ''};

const app = require('http').createServer(handler),
    fs = require('fs'),
    bigAssApi = require("BigAssFansAPI/BigAssApi"),
    url = require('url');
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
  var call = url.parse(req.url);
  var stuff = req.url.substring(1);
  console.log(stuff);
  if (stuff === '') {
    serverStaticFile('index.html', res);
  }
  //console.log('myFans', myFans);
}

function serverStaticFile (fileName, res) {
  fileName = (fileName === '/') ? '/index.html' : fileName;
  fs.readFile(settings.root+fileName,
    function (err, data) {
      if (err) {
        res.writeHead(404);
        return res.end('File not found: '+fileName);
      } else {
        res.writeHead(200, getContentType(fileName));
        return res.end(data);
      }
    }
  );
}

function getContentType (fileName) {
  var extensions = {
    ".html" : "text/html",
    ".css" : "text/css",
    ".js" : "application/javascript",
    ".png" : "image/png",
    ".gif" : "image/gif",
    ".jpg" : "image/jpeg"};
  return {'Content-Type': extensions[path.extname(fileName)]};
}