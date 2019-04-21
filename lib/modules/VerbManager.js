class Verb {
  constructor(name, scriptName, adminOnly) {
    this.name = name;
    this.scriptName = scriptName;
    this.adminOnly = adminOnly ? true : false;
  }
}

class VerbManager extends PersistentModule {
  constructor(gameServer) {
    super('verb_manager.json');
    this.gameServer = gameServer;
 
    this.addVerb('test', 'cmds/player/test');
    this.addVerb('say', 'cmds/player/say');
    this.addVerb('quit', 'cmds/player/quit');
    this.addVerb('who', 'cmds/player/who');
    
    this.addVerb('/panic', 'cmds/admin/panic');
    this.addVerb('/reload', 'cmds/admin/reload');
    this.addVerb('/stats', 'cmds/admin/stats');
    this.addVerb('/mxp', 'cmds/admin/mxp');

    this.save();
  } 
  
  // Called by parent PersistentModule to restore data on startup/reload
  init(data) {
    this.verbs = {};
    
    if (data && data.verbs) {
      this.verbs = data.verbs;
    }
  }

  getVerb(name) {
    return this.verbs[name] || null;
  }

  addVerb(name, script, adminOnly) {
    if (this.verbs[name]) {
      return false;
    }

    this.verbs[name] = new Verb(name, script, adminOnly);
  }

  getSandboxVariables(sandbox) {
    return {
      ...sandbox,
      gameServer: this.gameServer,
      logger: this.gameServer.logger
    }
  }
  
  executeCommand(command, user) {
    const verb = this.getVerb(command.name);
    
    if (!verb) {
      return false;
    }
   
    if (verb.isAdminOnly && !user.isAdmin) {
      return false;
    }

    this.gameServer.scriptManager.runScript(verb.scriptName, this.getSandboxVariables({ user: user, command: command}));

    return true;
  }
 
  toJSON() {
    return {
      verbs: this.verbs
    };
  }  
}

module.exports = VerbManager;
