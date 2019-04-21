const fs = require('fs');

class CommandHandler {
  constructor(gameServer) {
    this.gameServer = gameServer;
    
    this.gameServer.scriptManager.setScriptRuntimeDependencies([
      'modules/PersistentModule'
    ]);

    this.splashScreen = "Welcome...";
    this.loadSplashScreen();

    this.loadSystems();
  }

  loadSystems() {
    this.verbManager = this.createModule('modules/VerbManager');
    this.commandParser = this.createModule('modules/CommandParser');
  }

  createModule(modulePath) {
    return new (this.gameServer.scriptManager.getModule(modulePath))(this.gameServer);
  }

  /**
   * Return a list of script names that the ScriptManager
   * will include as a global dependency in every script
   * execution.
   *
   * @driver
   * @return []
   */
  getScriptRuntimeDependencies() {
    return [
      'core/PersistentModule'
    ];
  }

  /**
   * First method called in the lib after the driver has handled the
   * user connecting.
   *
   * @driver
   */
  handleNewConnection(user) {
    user.client.willMCCP2();
    user.client.willMXP();
    user.client.doEcho();
    user.setTimeout(0);
    user.setKeepAliveSeconds(true, 10);
    user.isAdmin = true; 
    this.showSplashScreen(user);
    
    // Set StartMenuState
    // Use State Machine to handle AccountState, PlayState, and PromptState
  }

  handleInput(user, rawInput) {
    if (!rawInput || !rawInput.length) {
      user.send('Invalid command.');
      return;
    }
    
    try {
      const command = this.commandParser.parseInput(user, rawInput);
      const done = this.verbManager.executeCommand(command, user);

      if (!done) {
        user.send("I don't understand what you typed.");
      }

    } catch (exception) {
      this.gameServer.logger.error(exception);

      if (user.isAdmin) {
        user.send(`Stacktrace: ${exception.stack}`);
      }
    }
  }
 
  showSplashScreen(user) {
    user.send(this.splashScreen);
  }

  loadSplashScreen() {
    fs.readFile("config/splashscreen", (err, str) => {
      if (err) {
        throw err;
      }

      this.splashScreen = str.toString();
    });
  }
}

module.exports = CommandHandler;
