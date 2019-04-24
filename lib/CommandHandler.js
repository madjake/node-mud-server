const fs = require('fs');

class CommandHandler {
  constructor(gameServer) {
    this.gameServer = gameServer;
    
    // @driver Set a list of objects that the ScriptManager will include as
    // as global dependencies in every script execution.
    this.gameServer.scriptManager.setScriptRuntimeDependencies([
      'modules/PersistentModule'
    ]);

    this.splashScreen = "Welcome...";
    this.loadSplashScreen();

    this.loadSystems();
  }

  getSandboxVariables(sandbox) {
    return {
      ...sandbox,
      gameServer: this.gameServer,
      logger: this.gameServer.logger,
      verbManager: this.verbManager,
      commandParser: this.commandParser,
      objectManager: this.objectManager
    }
  }

  loadSystems() {
    this.verbManager = this.createModule('modules/VerbManager');
    this.commandParser = this.createModule('modules/CommandParser');
    this.objectManager = this.createModule('modules/ObjectManager');
  }

  createModule(modulePath) {
    return new (this.gameServer.scriptManager.getModule(modulePath))(this.gameServer);
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
      const verb = this.verbManager.getVerb(command.name);
       
      if (!verb || (verb.isAdminOnly && !user.isAdmin)) {
        user.send("I don't understand what you typed.");
        return false;
      }

      this.gameServer.scriptManager.runScript(verb.scriptName, this.getSandboxVariables({ user: user, command: command}));

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
