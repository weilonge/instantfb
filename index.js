var login = require("facebook-chat-api");
var net = require('net');
var fs = require('fs');

if (process.argv.length < 4) {
  return -1;
}

var USERNAME = process.argv[2];
var PASSWORD = process.argv[3];
var SOCKET_FILE = '/tmp/fb_api.sock';

var fbApi;

if (fs.existsSync(SOCKET_FILE)) {
  fs.unlinkSync(SOCKET_FILE);
}
login({email: USERNAME, password: PASSWORD}, function callback (err, api) {
  if(err) return console.error(err);

  fbApi = api;
  serverPrepare();
});

function serverPrepare() {
  var server = net.createServer(function(stream) {
    var buffer = '';
    stream.on('data', function(c) {
      console.log('data:', c.toString());
      buffer += c.toString();
    });
    stream.on('end', function() {
      console.log('steam ended:', buffer);
      if (buffer === 'exit') {
        buffer = '';
        server.close();
        return;
      }
      var obj = JSON.parse(buffer);
      handleMessage(obj);
      buffer = '';
    });
  });
  server.listen(SOCKET_FILE);
  fs.chmodSync(SOCKET_FILE, 0767);
}

function handleMessage(obj) {
  console.log(obj);

  fbApi.getUserID(obj.username, function(err, data){
    if(err){
      console.log("ERROR!", err)
      return callback(null);
    }
    var threadID = data[0].userID;
    fbApi.sendMessage(obj.message, threadID, function(err){
      console.log("Sent message to", obj.username, obj.message);
    });
  });
}

