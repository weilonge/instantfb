const fbLogin = require('facebook-chat-api');
const net = require('net');
const fs = require('fs');

let InstantFB = function () {};

InstantFB.prototype.init = function () {
  process.on('SIGINT', this.exit.bind(this));
};

InstantFB.prototype.exit = function () {
  if (this._socketServer) {
    this._socketServer.close();
  }
  process.exit();
}

InstantFB.prototype.login = function (credential) {
  return new Promise((resolve, reject) => {
    fbLogin(credential, (err, api) => {
      if(err) {
        reject(err);
        return;
      }

      this._fbApi = api;
      this._fbApi.listen(this.handleFacebookMessage.bind(this));
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
      let buffer = '';
      stream.on('data', c => {
        buffer += c.toString();
      });
      stream.on('end', () => {
        console.log('steam ended:', buffer);
        this.handleSocketMessage(buffer);
        buffer = '';
      });
    });
    this._socketServer.listen(socket);
    fs.chmodSync(socket, 0767);
  });
};

InstantFB.prototype.sendMessageByUsername = function (username, message) {
  return new Promise((resolve, reject) => {
    this._fbApi.getUserID(username, (err, data) => {
      if(err){
        console.error('ERROR!', err)
        reject(err);
        return;
      }

      resolve(data[0].userID);
    });
  }).then(threadID => {
    return this.sendMessageByThreadID(threadID, message);
  });
};

InstantFB.prototype.sendMessageByThreadID = function (threadID, message) {
  return new Promise((resolve, reject) => {
    this._fbApi.sendMessage(message, threadID, err => {
      if (err) {
        console.error('ERROR!', err)
        reject(err);
        return;
      }
      resolve();
    });
  });
}

InstantFB.prototype.handleSocketMessage = function (rawBody) {
  const commandObject = JSON.parse(rawBody);
  switch (commandObject.type) {
    case 'sendMessage': {
      return this.sendMessageByUsername(commandObject.username, commandObject.message);
    }
    case 'exit': {
      this.exit();
      return Promise.resolve();
    }
  }
};

InstantFB.prototype.handleFacebookMessage = function (err, event) {
  console.log(event);
  switch (event.type) {
    case 'message': {
      this.sendMessageByThreadID(event.threadID, "You said: " + event.body);
      break;
    }
  }
};

(async () => {
  if (process.argv.length < 4) {
    return -1;
  }

  const USERNAME = process.argv[2];
  const PASSWORD = process.argv[3];

  let fbService = new InstantFB();
  await fbService.init();
  await fbService.login({
    email: USERNAME,
    password: PASSWORD,
  });
  await fbService.openSocket('/tmp/instant_fb.sock');
})();

