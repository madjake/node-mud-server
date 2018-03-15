/*****
 * Telnet and MUD protocol constants
 */
const COMMANDS = {
  SE: 240,//End of subnegotiation parameters
  NOP: 241,//No operation.
  DATA_MARK: 242,//The data stream portion of a Synch.
  //This should always be accompanied
  //by a TCP Urgent notification.
  BREAK: 243,//NVT character BRK.
  INTERRUPT_PROCESS: 244,//The function IP.
  ABORT_OUTPUT: 245,//The function AO.
  ARE_YOU_THERE: 246,//The function AYT.
  ERASE_CHARACTER: 247,//The function EC.
  ERASE_LINE: 248,//The function EL.
  GO_AHEAD: 249,//The GA signal
  SB: 250,//Indicates that what follows is
  //subnegotiation of the indicated
  //option.
  WILL: 251,//Indicates the desire to begin
  //performing, or confirmation that
  //you are now performing, the
  //indicated option.
  WONT: 252,//Indicates the refusal to perform,
  //or continue performing, the
  //indicated option.
  DO: 253,//Indicates the request that the
  //other party perform, or
  //confirmation that you are expecting
  //the other party to perform, the
  //indicated option.
  DONT: 254,//Indicates the demand that the
  //other party stop performing,
  //or confirmation that you are no
  //longer expecting the other party
  //to perform, the indicated option.
  IAC: 255 //Data Byte 255
};

const OPTIONS = {
  OPT_BINARY: 0,
  OPT_ECHO: 1,  // Echo RFC 857
  OPT_SGA: 3,  // Suppress Go Ahead RFC 858
  OPT_EXTENDED_ASCII: 17, //extended ascii character codes
  OPT_TT: 24, // Terminal Type RFC 1091
  OPT_NAWS: 31, // Negotiate About Window Size RFC 1073
  OPT_TS: 32, // Terminal Speed RFC 1079
  OPT_LINEMODE: 34,
  OPT_NEO: 39, // New Environment Option RFC 1572
  OPT_EXOPL: 255 // Extended-Options-List RFC 861
};

const MUD_OPTIONS = {
  MSSP: 70, //Mud Server Status Protocol
  MCCP: 85,//mud compression protocol v1
  MCCP2: 86,//mud compression protocol v2
  MSP: 90, //mud sound protocol
  MXP: 91 //mud extension protocol
};

const MSSP = {
  VAR: 1,
  VAL: 2
};

const CONTROL_CODES = {
  bs: 8, //backspace
  ht: 9, //horizontal tab
  vt: 11, //vertical tab
  fd: 12, //form feed
  space: 20, //space
  delete: 127 //delete (backspace in windows telnet?)
};

const STATES = {
  DATA: 'data',
  NEGOTIATION: 'negotiation',
  NEGOTIATION_OPTION: 'negotiation-option',
  SUB_NEGOTIATION: 'sub-negotiation'
};

const NEW_LINES = {
  CR: 13,// Moves the NVT printer to the left marginof the current line.
  LF: 10,// Moves the NVT printer to the next print line, keeping the same horizontal position.
  NULL: 0  // Used to indicate that just a CR character was requested from the client.
};


// TODO: Kind of goofy. Maybe import recursive (deepFreeze) function?
module.exports = Object.freeze({
  COMMANDS: Object.freeze(COMMANDS),
  OPTIONS: Object.freeze(OPTIONS),
  MUD_OPTIONS: Object.freeze(MUD_OPTIONS),
  MSSP: Object.freeze(MSSP),
  STATES: Object.freeze(STATES),
  CONTROL_CODES: Object.freeze(CONTROL_CODES),
  NEW_LINES: Object.freeze(NEW_LINES)
});
