const net = require('net'),
      TelnetStream = require('../driver/TelnetStream');
        
module.exports = class TelnetClient extends TelnetStream {

  constructor(clientSocket, address, port) {
    super(clientSocket);
    this.address = address;
    this.port = port;
    
    this.TIMEOUT_MS = 6000;
    this.timer = setTimeout(this.onTimeout.bind(this), this.TIMEOUT_MS);

    this.on('input', this.onReceivedData.bind(this));
    this.on('mssp', this.onMSSPData.bind(this));
    clientSocket.connect(port, address, this.onConnect.bind(this));
  }

  onConnect() {
    console.log(`Connected to ${this.address}:${this.port}`);
  }

  onMSSPData(msspData) {
    console.log(msspData);
  }
  
  onReceivedData(data) {
    if (!!data.length) {
      var buffer = new Buffer(data);
      console.log(buffer.toString());
    } 
  } 

  onTimeout() {
    console.log(`Timeout: ${this.address} ${this.port}`);
    this.clientSocket.destroy();
  }

}
