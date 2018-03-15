/*****
 * TCP stream to handle basic telnet commands
 * and options along with MUD specific protocols.
 *
 * Inspiration from: https://github.com/wez/telnetjs
 *
 * @author Jake Fournier <madjake@gmail.com>
 *
 * TODO: Are data IAC's being escaped?
 * TODO: send(): check if CR LF and add if missing
 *
 * @type {exports} TelnetStream
 */
const DuplexStream = require('stream').Duplex,
      util = require('util'),
      zlib = require('zlib'),
      TelnetConstants = require('driver/TelnetConstants');

module.exports = class TelnetStream extends DuplexStream {
    constructor(socket, options) {
      options = options || {}
      options.socket = socket;
      super(options);
      this.clientSocket = socket;
      this.destinationStream = null;
      this.bytes = [];
      this.currentCommand = null;
      this.negotiatedOptions = {};
      this.state = this.STATES.DATA;
      this.clientSocket.pipe(this).pipe(this.clientSocket);

      this.mccp = false;
      this.mccp2 = false;
      this.mxp = false;

      this.on('error', this.handleSocketError.bind(this));
      this.on('end', this.endConnection.bind(this));
      this.on('close', this.endConnection.bind(this));
    }

  handleSocketError(error) {
    this.emit('socketError', error)
  };

  endConnection() {
    this.emit('disconnect');
  };

  willMCCP2() {
    this.sendCommand(this.TelnetCommands.WILL, this.MUD_TELNET_OPTIONS.MCCP2);
  }

  willEcho() {
    this.sendCommand(this.TelnetCommands.WILL, this.TelnetOptions.OPT_ECHO);
  }

  dontEcho() {
    this.sendCommand(this.TelnetCommands.DONT, this.TelnetOptions.OPT_ECHO);
  }

  doEcho() {
    this.sendCommand(this.TelnetCommands.DO, this.TelnetOptions.OPT_ECHO);
  }

  wontEcho() {
    this.sendCommand(this.TelnetCommands.WONT, this.TelnetOptions.OPT_ECHO);
  }

  doMXP() {
    this.sendCommand(this.TelnetCommands.DO, this.MUD_TELNET_OPTIONS.MXP);
  }

  willMXP() {
    this.sendCommand(this.TelnetCommands.WILL, this.MUD_TELNET_OPTIONS.MXP);
  }

  dontMXP() {
    this.sendCommand(this.TelnetCommands.DONT, this.MUD_TELNET_OPTIONS.MXP);
    this.mxp = false;
  }

  _write(chunk, encoding, callback) {
    for (var i = 0; i < chunk.length; i++) {
      var byte = chunk[i];

      this.lastByte = (i - 1) >= 0 ? chunk[i - 1] : null;
      this.currentByte = byte;
      this.nextByte = (i + 1) < chunk.length ? chunk[i + 1] : null;

      this.bytes.push(byte);

      if (this.state == this.STATES.DATA
          && (byte == this.TelnetNewLines.LF ||
              (byte == this.TelnetNewLines.CR
                  && (this.nextByte == this.TelnetNewLines.NULL
                      || this.nextByte == this.TelnetNewLines.LF)
                  )
              )
          ) {
        this.bytes.splice(-1, 1);
        this.sendCurrentBuffer();
        this.reset();
      } else if (this.state == this.STATES.DATA
          && (byte == this.CONTROL_CODES.BS
              || byte == this.CONTROL_CODES.DELETE)
          ) {
        //clean up after ourselves
        this.bytes.splice(-2, 2);

        //tell our client to clean up too
        this.send([
          this.CONTROL_CODES.BS,
          this.CONTROL_CODES.SPACE,
          this.CONTROL_CODES.BS
        ]);

      } else if (this.state == this.STATES.DATA
          && byte == this.TelnetCommands.IAC) {
        this.state = this.STATES.NEGOTIATION;
      } else if (this.state == this.STATES.NEGOTIATION) {

        if (byte == this.TelnetCommands.INTERRUPT_PROCESS) {
          this.emit('disconnect');
          return;
        }
        this.negotiate();
      } else if (this.state == this.STATES.NEGOTIATION_OPTION) {
        this.parseOption();
      } else if (this.state == this.STATES.SUB_NEGOTIATION) {
        this.subNegotiate();
      }
    }

    callback();
  }

  sendCurrentBuffer() {
    if (this.bytes.length) {
      var buffer = new Buffer(this.bytes);
      var line = buffer.toString().replace(/[^\x00-\x7F]/g, "");//strip out non ascii
      //.replace(/\W/g, '');
      this.emit('input', line);
      this.reset();
    }
  }

  reset() {
    this.state = this.STATES.DATA;
    this.currentCommand = null;
    this.clearBuffer();
  };

  clearBuffer() {
    this.bytes = [];
    this.lastByte = null;
    this.currentByte = null;
    this.nextByte = null;
    this.optionData = [];
  }

  negotiate() {
    switch (this.currentByte) {
      case this.TelnetCommands.WILL://respond with do or dont
        this.currentCommand = this.TelnetCommands.WILL;
        this.state = this.STATES.NEGOTIATION_OPTION;
        break;
      case this.TelnetCommands.WONT://set option off/ignore
        this.currentCommand = this.TelnetCommands.WONT;
        this.state = this.STATES.NEGOTIATION_OPTION;
        break;
      case this.TelnetCommands.DO://respond with will or wont
        this.currentCommand = this.TelnetCommands.DO;
        this.state = this.STATES.NEGOTIATION_OPTION;
        break;
      case this.TelnetCommands.DONT://set option off/ignore
        this.currentCommand = this.TelnetCommands.DONT;
        this.state = this.STATES.NEGOTIATION_OPTION;
        break;
      case this.TelnetCommands.SB:
        this.currentCommand = this.TelnetCommands.SB;
        this.state = this.STATES.SUB_NEGOTIATION;
        break;
      default:
        this.reset();
        console.log('IAC but no match - byte: ', this.currentByte);
        break;
    }
  }

  parseOption() {
    switch (this.currentByte) {
      case this.MUD_TELNET_OPTIONS.MCCP:
        this.currentOption = this.MUD_TELNET_OPTIONS.MCCP;
        break;
      case this.MUD_TELNET_OPTIONS.MCCP2:
        this.currentOption = this.MUD_TELNET_OPTIONS.MCCP2;
        break;
      case this.MUD_TELNET_OPTIONS.MXP:
        this.currentOption = this.MUD_TELNET_OPTIONS.MXP;
        break;
      case this.MUD_TELNET_OPTIONS.MSSP:
        this.currentOption = this.MUD_TELNET_OPTIONS.MSSP;
        break;
      case this.TelnetOptions.OPT_ECHO:
        this.currentOption = this.TelnetOptions.OPT_ECHO;
        break;
      case this.TelnetOptions.OPT_SGA:
        this.currentOption = this.TelnetOptions.OPT_SGA;
        break;
      default:
        break;
    }

    if (this.currentCommand == this.TelnetCommands.SB) {
      this.state = this.STATES.SUB_NEGOTIATION;
    } else if (this.currentCommand && this.currentOption) {
      this.handleFeature(this.currentCommand, this.currentOption);
    } else {
      this.reset();
    }
  }

  subNegotiate() {
    switch (this.currentByte) {
      case this.TelnetCommands.SE:
        //end of negotiation
        this.handleFeature(this.currentCommand, this.currentOption, this.optionData);
        this.reset();
        break;
      default:
        this.optionData.push(this.currentByte);
        break;
    }
  }

  /*
     WILL - Sender wants to do something
     DO   - Sender wants the other side to do something
     WONT - Sender doesn't want to do something
     DONT - Sender doesn't want other side to do something

     Sender     Receiver
      WILL         DO      option enabled
      WILL        WONT     option disabled
      DO          WILL     option enabled
      DO          WONT     option disabled
      WONT        DONT     option disabled (DONT only valid response)
      DONT        WONT     option disabled (WONT only valid response)
  */
  handleFeature(command, option, data) {
    switch (command) {
        case this.TelnetCommands.DO:
            this.doFeature(option, data);
            break;
        case this.TelnetCommands.WILL:
            this.willFeature(option, data);
            break;
        case this.TelnetCommands.DONT:
            this.dontFeature(option, data);
            break;
        case this.TelnetCommands.WONT:
            this.wontFeature(option, data);
            break;
        case this.TelnetCommands.SB:
            this.subNegotiateFeature(option, data);
            break;
    }

    this.reset();
  }

  willFeature(option, data) {
    if (option == this.MUD_TELNET_OPTIONS.MSSP) {
      this.negotiatedOptions[this.MUD_TELNET_OPTIONS.MSSP] = this.MUD_TELNET_OPTIONS.MSSP;
      this.sendCommand(this.TelnetCommands.DO, this.MUD_TELNET_OPTIONS.MSSP);
    } else if (option == this.TelnetOptions.OPT_ECHO) {
      this.dontEcho();
    } else if (option == this.MUD_TELNET_OPTIONS.MXP) {
      this.doMXP();
    }
  }

  doFeature(option, data) {
    if (option == this.MUD_TELNET_OPTIONS.MSSP) {
      this.negotiatedOptions[this.MUD_TELNET_OPTIONS.MSSP] = this.MUD_TELNET_OPTIONS.MSSP;
    } else if (option == this.MUD_TELNET_OPTIONS.MCCP
        && !this.negotiatedOptions[this.MUD_TELNET_OPTIONS.MCCP]) {
      this.sendCommand(this.TelnetCommands.SB, [this.MUD_TELNET_OPTIONS.MCCP, this.TelnetCommands.IAC, this.TelnetCommands.SE]);
      this.zlib = zlib.createDeflate({'level': 9});
      this.zlib.pipe(this.destinationStream);
      this.negotiatedOptions[this.MUD_TELNET_OPTIONS.MCCP] = this.MUD_TELNET_OPTIONS.MCCP;
    } else if (option == this.MUD_TELNET_OPTIONS.MCCP2
        && !this.negotiatedOptions[this.MUD_TELNET_OPTIONS.MCCP2]) { //MCCP2
      this.sendCommand(this.TelnetCommands.SB, [this.MUD_TELNET_OPTIONS.MCCP2, this.TelnetCommands.IAC, this.TelnetCommands.SE]);
      this.zlib = zlib.createDeflate({'level': 9});
      this.zlib.pipe(this.destinationStream);
      this.negotiatedOptions[this.MUD_TELNET_OPTIONS.MCCP2] = this.MUD_TELNET_OPTIONS.MCCP2;
      this.mccp2 = true;
    } else if (option == this.MUD_TELNET_OPTIONS.MXP) { // MXP
      this.sendCommand(this.TelnetCommands.SB, [this.MUD_TELNET_OPTIONS.MXP, this.TelnetCommands.IAC, this.TelnetCommands.SE]);
      this.negotiatedOptions[this.MUD_TELNET_OPTIONS.MXP] = this.MUD_TELNET_OPTIONS.MXP;
      this.mxp = true;
    } else if (option == this.TelnetOptions.OPT_ECHO) {
      this.willEcho();
    }
  }

  //option disabled. wont is only valid response
  dontFeature(option, data) {
    if (option == this.MUD_TELNET_OPTIONS.MXP) {
      this.negotiatedOptions[this.MUD_TELNET_OPTIONS.MXP] = false;
      this.mxp = false;
    }

    this.sendCommand(this.TelnetCommands.WONT, option);
  }

  //option disabled. dont is only valid response
  wontFeature(option, data) {
    if (option == this.MUD_TELNET_OPTIONS.MXP) {
      this.negotiatedOptions[this.MUD_TELNET_OPTIONS.MXP] = false;
      this.mxp = false;
    }

    this.sendCommand(this.TelnetCommands.DONT, option);
  }

  subNegotiateFeature(option, data) {
    if (option == this.MUD_TELNET_OPTIONS.MSSP) {
      var msspData = {};

      var buffer = new Buffer(data, 'ascii');
      buffer = buffer.toString().split(String.fromCharCode(this.MSSP.VAR));

      for (var i = 0; i < buffer.length; i++) {
        var kv = buffer[i].split(String.fromCharCode(this.MSSP.VAL));
        if (kv.length == 2) {
          var key = kv[0].replace(/[^\x00-\x7F]/g, "");
          var val = kv[1].replace(/[^\x00-\x7F]/g, "");
          msspData[key] = val;
        }
      }

      this.emit('mssp', msspData)
    }
  }

  _read(size) {

  }

  pipe(destinationStream, options) {
    this.destinationStream = destinationStream;
  }

  sendCommand(command, bytes) {
    var fullCommand = [this.TelnetCommands.IAC, command];

    if (bytes instanceof Array) {
      fullCommand.push.apply(fullCommand, bytes);
    } else {
      fullCommand.push(bytes);
    }

    this.send(fullCommand);
  }

  send(data) {
    if (!Buffer.isBuffer(data)) {
      data = new Buffer(data);
    }

    if (this.zlib) {
      this.zlib.write(data);
      this.zlib.flush();
    } else {
      this.destinationStream.write(data);
    }
  }

  get MUD_TELNET_OPTIONS() {
    return TelnetConstants.MUD_OPTIONS;
  }

  get MSSP () {
    return TelnetConstants.MSSP;
  }

  get CONTROL_CODES() {
    return TelnetConstants.CONTROL_CODES;
  }

  get STATES() {
    return TelnetConstants.STATES;
  }

  get TelnetCommands() {
    return TelnetConstants.COMMANDS;
  }

  // Telnet Options http://www.iana.org/assignments/telnet-options
  get TelnetOptions() {
    return TelnetConstants.OPTIONS;
  }

  get TelnetNewLines() {
    return TelnetConstants.NEW_LINES;
  }
}
