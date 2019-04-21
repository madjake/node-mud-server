const net = require('net'),
      fs = require('fs'),
      TelnetStream = require('driver/TelnetStream'),
      User = require('driver/User'),
      ScriptManager = require('driver/ScriptManager');

class GameServer {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;

    this.users = new Set();
    this.server = net.createServer(this.onUserConnect.bind(this));
    this.scriptManager = new ScriptManager(logger, this.config.libDirectory);
  }

  /**
   * Load the CommandHandler script through the ScriptManager so it
   * can be dynamically reloaded during runtime
   */
  loadLib() {
    const CommandHandler = this.scriptManager.getModule('CommandHandler');

    if (!CommandHandler) {
      this.logger.error('lib/CommandHandler.js is missing or did not load successfully.');
      process.exit(1);
    }

    this.commandHandler = new CommandHandler(this);
  }

  start() {
    this.loadLib();
    this.server.listen(this.config.port);
    this.logger.info(`Server started on port ${this.config.port}`);
  }

  onUserConnect(socket) {
    let client = new TelnetStream(socket);
    let user = new User(client);

    this.users.add(user);

    client.on('input', this.onInput.bind(this, user));
    client.on('socketError', this.onSocketError.bind(this, user));
    client.on('disconnect', this.onUserDisconnect.bind(this, user));
    
    this.commandHandler.handleNewConnection(user);
    this.logger.info(`User connected ${user.getClientIp()}`);
  }

  onInput(user, rawInput) {
    try {
      this.commandHandler.handleInput(user, rawInput);
    } catch (exception) {
      user.send("There was a problem with that command. It has been logged. If it continues please contact an Admin.");
      this.logger.error(exception);
    }
  }

  getUsers() {
    return [...this.users];
  }

  onSocketError(socketError, user) {
    this.logger.info(`${user.getClientIp()} errored:`, socketError);
    this.disconnectUser(user);
  }

  onUserDisconnect(user) {
    this.disconnectUser(user);
  }

  quitUser(user, message) {
    if (user && message) {
      user.send(message);
    }

    user.client.endConnection();
  }

  disconnectUser(user) {
    this.logger.info(`${user.getClientIp()} disconnected.`);
    this.users.delete(user);
  }

  getMemoryUsage() {
    return process.memoryUsage();
  }

  forceGarbageCollection() {
    global.gc(true);
  }
}

module.exports = GameServer;
