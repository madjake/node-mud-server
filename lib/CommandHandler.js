
class CommandHandler {
  constructor(gameServer) {
    this.gameServer = gameServer;

    this.commands = {
      'who': 'whoCmd',
      'mxp': 'mxpCmd',
      'say': 'sayCmd'
    };
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
      user.send('Invalid command.');
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
      user.send('Your client either does not support MXP or has it turned disabled.');
    }
  }
}

module.exports = CommandHandler;
