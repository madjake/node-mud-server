/**
 * Handler.js is the core object gluing the driver and the library
 * together. The driver expects this object to exist and to provide
 * the following methods:
 *
 * - handleNewConnection(user)    A new network connection has been established with the server
 * - handleInput(user, rawInput)  Input from a network connnection has been received by the driver
 * 
 * 
 * NOTES:
 *  - It's a bit of a dumping ground for now. As themes and patterns arise refactor them into
 *    modules/systems.
 */
const fs = require('fs');

const SAVE_FREQUENCY = 60;

class Handler {
  constructor(gameServer, objectStore) {
    this.gameServer = gameServer;
    this.objectStore = objectStore;
    this.logger = this.gameServer.logger;
    this.scriptManager = gameServer.scriptManager;
 
    // @driver Set a list of objects that the ScriptManager will include as
    // as global dependencies while compiling scripts.
    this.gameServer.scriptManager.setScriptRuntimeDependencies([
      'modules/PersistentModule'
    ]);

    this.splashScreen = "Welcome...";
    this.loadSplashScreen();

    this.loadSystems();
    this.setTimers();
  }

  setTimers() {
    this.saveTimer = setInterval( () => {
      this.save();
    }, SAVE_FREQUENCY * 1000);
  }

  onReload() {
    this.save();
  }

  /**
   * Save game state periodically
   */
  save() {
    try {
      this.gameServer.logger.info("Saving game state...");
      this.objectManager.save();
      this.gameServer.logger.info("Done saving game state.");
    } catch(exception) {
      this.logger.error(["There was an issue saving the game state!!!!", exception]);
    }
  }

  loadSystems() {
    this.objectManager = this.scriptManager.createModule('modules/ObjectManager', this.logger, this.scriptManager, this.objectStore);
    this.objectStore.load('lib/data/objects/objects.json', this.objectManager.loadObject.bind(this.objectManager));
    
    this.verbManager = this.scriptManager.createModule('modules/VerbManager', this.handler);
    this.commandParser = this.scriptManager.createModule('modules/CommandParser', this.handler);
  }

  getScriptGlobalVariables(additionalVariables) {
    return {
      ...additionalVariables,
      handler: this,
      scriptManager: this.scriptManager,
      logger: this.gameServer.logger,
      verbManager: this.verbManager,
      commandParser: this.commandParser,
      objectManager: this.objectManager
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

  forceGarbageCollection() {
    this.gameServer.forceGarbageCollection();
  }

  reloadLib() {
    if (this.gameServer.reloading) {
      return false;
    }
    
    this.gameServer.reloading = true;
    this.onReload();
    this.gameServer.loadLib();
    this.gameServer.reloading = false;
  }
 
  getUsers() {
    return this.gameServer.getUsers();
  } 

  quitUser(user, message) {
    this.gameServer.quitUser(user, message);
  }

  getMemoryUsage() {
    return this.gameServer.getMemoryUsage();
  }

  getHighResolutionProcessTime(time) {
    return this.gameServer.getHighResolutionProcessTime(time);
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

  /**
   * This method is invoked when the driver receives input from a connectio
   * @driver
   */
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

      this.gameServer.scriptManager.runScript(verb.scriptName, this.getScriptGlobalVariables({ user: user, command: command}));

    } catch (exception) {
      this.gameServer.logger.error(exception);

      if (user.isAdmin) {
        user.send(`Stacktrace: ${exception.stack}`);
      }
    }
  }
}

module.exports = Handler;
