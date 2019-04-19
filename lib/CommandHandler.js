class CommandHandler {
  constructor(gameServer) {
    this.gameServer = gameServer;

    this.commands = {
      'who': 'whoCmd',
      'mxp': 'mxpCmd',
      'say': 'sayCmd',
      'quit': 'quitCmd',
      '/reload': 'reloadAdminCmd',
      '/stats': 'statsAdminCmd',
      'test': 'testCmd',
      'cmd': 'testRunScriptCmd'
    };
  }

  beginConnection(user) {
    // Use State Machine to handle AccountState, PlayState, and PromptState
  }

  handleInput(user, rawInput) {
    if (!rawInput || !rawInput.length) {
      user.send('Invalid command.');
      return;
    }

    var Command = this.parseInput(user, rawInput);

    if (this.commands[Command.name] && typeof(this[this.commands[Command.name]]) == "function") {
      this[this.commands[Command.name]](user, Command);
    } else {
      user.send("I don't understand what you typed.");
    }
  }

  parseInput(user, rawInput) {
    let args = rawInput.split(' '),
        cmd = args[0];

    return {
      name: cmd,
      args: args,
      input: rawInput
    }
  }

  sayCmd(user, Command) {
    if (Command.args.length < 2) {
      user.send('Say what?');
      return;
    }

    let sayText = Command.args.slice(1).join(' ');
    user.send(`You say, "${sayText}"`);

    for (let u of this.gameServer.getUsers()) {
      if (u !== user) {
        u.send(`${user.getClientIp()} says, "${sayText}"`);
      }
    }
  }

  quitCmd(user, Command) {
    this.gameServer.quitUser(user, 'Goodbye!');
  }

  whoCmd(user, Command) {
    let userIps = this.gameServer.getUsers().map((u) => { return u.getClientIp() });

    if (userIps.length) {
      user.send(`Users:\n\n${userIps.join('\n')}`);
    } else {
      user.send('Nobody online?!');
    }
  }

  mxpCmd(user, Command) {
    if (user.mxp) {
      user.send('[1z<send "command1|command2|command3" hint="click to see menu|Item 1|Item 2|Item 2">this is a menu link</SEND>');
    } else {
      user.send('Your client either does not support MXP or has it disabled.');
    }
  }

  testCmd(user, Command) {
    user.send('Change this text, use the /reload command, and use the test command to see that it updated');
  }

  testRunScriptCmd(user, Command) {
    this.gameServer.ScriptManager.runScript('cmds/test', { user: user, message: "I am an injected variable"});
  }

  reloadAdminCmd(user, Command) {
    if (Command.args.length < 2) {
      user.send('Reload which script?');
      return;
    }

    var scriptName = Command.args.slice(1).join(' ');
    user.send(`Reloading ${scriptName}`);

    this.gameServer.ScriptManager.reloadScript(scriptName);

    if (scriptName === 'CommandHandler') {
      this.gameServer.loadLib();
    }

    user.send(`Reloaded ${scriptName}`);
  }

  statsAdminCmd(user, Command) {
    const memUsage = this.gameServer.getMemoryUsage();

    for (let key in memUsage) {
      user.send(`${key} ${Math.round(memUsage[key] / 1024 / 1024 * 100) / 100} MB`);
    }
  }
}

module.exports = CommandHandler;
