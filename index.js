var fbLogin = require('facebook-chat-api');
var net = require('net');
var fs = require('fs');

var InstantFB = function () {};

InstantFB.prototype.init = function () {
  return new Promise(resolve => {
    process.on('SIGINT', () => {
      if (this._socketServer) {
        this._socketServer.close();
      }
      process.exit();
    });
    resolve();
  });
};

InstantFB.prototype.login = function (credential) {
  return new Promise((resolve, reject) => {
    fbLogin(credential, (err, api) => {
      if(err) {
        reject(err);
        return;
      }

      this._fbApi = api;
      resolve();
    });
  });
};

InstantFB.prototype.openSocket = function (socket) {
  if (fs.existsSync(socket)) {
    fs.unlinkSync(socket);
  }
  return new Promise((resolve, reject) => {
    this._socketServer = net.createServer(stream => {
      var buffer = '';
      stream.on('data', c => {
        buffer += c.toString();
      });
      stream.on('end', () => {
        console.log('steam ended:', buffer);
        if (buffer === 'exit') {
          buffer = '';
          this._socketServer.close();
          return;
        }
        var obj = JSON.parse(buffer);
        buffer = '';
        this.handleMessage(obj);
      });
    });
    this._socketServer.listen(socket);
    fs.chmodSync(socket, 0767);
  });
};

InstantFB.prototype.handleMessage = function (obj) {
  return new Promise((resolve, reject) => {
    this._fbApi.getUserID(obj.username, (err, data) => {
      if(err){
        console.error('ERROR!', err)
        reject(err);
        return;
      }

      var threadID = data[0].userID;
      this._fbApi.sendMessage(obj.message, threadID, err => {
        if (err) {
          console.error('ERROR!', err)
          reject(err);
          return;
        }

        console.log('Sent message to', obj.username, obj.message);
        resolve();
      });
    });
  });
};

if (process.argv.length < 4) {
  return -1;
}

const USERNAME = process.argv[2];
const PASSWORD = process.argv[3];

var fbService = new InstantFB();

fbService.init()
  .then(fbService.login.bind(fbService, {email: USERNAME, password: PASSWORD}))
  .then(fbService.openSocket.bind(fbService, '/tmp/instant_fb.sock'));
