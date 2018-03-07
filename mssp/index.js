const TelnetClient = require('./TelnetClient');
const Socket = require('net').Socket;

let muds = [
  {
    address: '159.203.94.205',
    port: 2350
  }
];

let clientSocket = new Socket();
let client = new TelnetClient(clientSocket, muds[0].address, muds[0].port)
