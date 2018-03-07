const net = require('net'),
      fs = require('fs'),
      TelnetStream = require('driver/TelnetStream'),
      User = require('driver/User');

class GameServer {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
   
    this.users = new Set();
    this.Server = net.createServer(this.onUserConnect.bind(this));
  }

  /*
   The goal here will be that the CommandHandler will be loaded by
   a script manager which will be able to reload scripts on
   demand so all game logic can be reloaded without a restart 
   or hotboot.  For now it doesn't do anything like that.
   */
  loadLib() {
    let CommandHandler = require('lib/CommandHandler');
    this.commandHandler = new CommandHandler(this); 
  }

  start() {
    this.loadLib();
    this.loadSplashScreen();
    this.Server.listen(this.config.port);
    this.logger.log(`Server started on port ${this.config.port}`);
  }

  onUserConnect(socket) {
    let client = new TelnetStream(socket);
    let user = new User(client);

    this.users.add(user); 

    client.on('input', this.onInput.bind(this, user));
    client.on('socketError', this.onSocketError.bind(this, user));
    client.on('disconnect', this.onUserDisconnect.bind(this, user));
    
    this.showSplashScreen(user);
    this.logger.log(`User connected ${user.getClientIp()}`);
  }
    
  onInput(user, rawInput) {
    this.commandHandler.handleInput(user, rawInput);
  }

  getUsers() {
    return [...this.users];     
  }

  onSocketError(socketError, user) {
    this.disconnectUser(user);
  }

  onUserDisconnect(user) {
    this.disconnectUser(user);
  }

  disconnectUser(user) {
    user.send('Goodbye.');
    this.logger.log(`${user.getClientIp()} disconnected.`);
    this.users.delete(user);
  }

  showSplashScreen(user) {
    user.send(this.splashScreen);
  }

  loadSplashScreen(user) {
    fs.readFile("config/splashscreen", (err, str) => { 
      if (err) { 
        throw err;
      }
        
      this.splashScreen = str.toString(); 
    });
  }
}

module.exports = GameServer;
