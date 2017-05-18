var fbLogin = require('facebook-chat-api');
var SwitchCrawler = require('./switch');
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
      this._fbApi.listen((err, message) => {
        console.log(message);
        this._fbApi.sendMessage("You said: " + message.body, message.threadID);
      });
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
    resolve();
  });
};

InstantFB.prototype.sendMessageViaUsername = function (username, message) {
  return new Promise((resolve, reject) => {
    this._fbApi.getUserID(username, (err, data) => {
      if(err){
        console.error('ERROR!', err)
        reject(err);
        return;
      }

      var threadID = data[0].userID;
      this._fbApi.sendMessage(message, threadID, err => {
        if (err) {
          console.error('ERROR!', err)
          reject(err);
          return;
        }

        console.log('Sent message to', username, message);
        resolve();
      });
    });
  });
};

InstantFB.prototype.handleMessage = function (obj) {
  return this.sendMessageViaUsername(obj.username, obj.message);
};

if (process.argv.length < 4) {
  return -1;
}

const USERNAME = process.argv[2];
const PASSWORD = process.argv[3];
const ME = process.argv[4];

var fbService = new InstantFB();

fbService.init()
  .then(fbService.login.bind(fbService, {email: USERNAME, password: PASSWORD}))
  .then(fbService.openSocket.bind(fbService, '/tmp/instant_fb.sock'))
  .then(() => {
    console.log("SwitchCrawler running...");
    function toLocalTime() {
      let t  = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + " UTC";
      return new Date(t).toString();
    }
    let PRICE_THRES = 36000;
    SwitchCrawler.run(8000, (title, items, res) => {
      let interestingItem = items.find(item => {
        return item.price < PRICE_THRES && item.isFulfilledByAmazon;
      });
      let dateTimeStr = toLocalTime();
      console.log(`[${dateTimeStr}] == ${title}`);
      if(interestingItem) {
        console.log(title);
        console.log(interestingItem);
        let msg = title + "\n" +
                  interestingItem.price + "\n" +
                  interestingItem.seller + "[" + interestingItem.isAmazonJP + "]\n" +
                  dateTimeStr + "\n" +
                  res.request.uri.href;
        return fbService.sendMessageViaUsername(ME, msg);
      }
      return Promise.resolve();
    });
  });

