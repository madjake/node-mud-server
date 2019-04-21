class CommandParser {

  parseInput(user, rawInput) {
    let args = rawInput.split(' '),
        cmd = args[0];

    return {
      name: cmd,
      args: args,
      input: rawInput
    }
  }

}

module.exports = CommandParser;
