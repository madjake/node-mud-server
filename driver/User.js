class User {
  constructor(client) {
    this.client = client;
    
    this.client.willMCCP2();
    this.client.willEcho();
    this.client.willMXP();
    this.setTimeout(0);
    this.setKeepAlive(true, 10);
  } 

  setKeepAlive(enable, seconds) {
    this.client.clientSocket.setKeepAlive(enable, 1000 * seconds);
  }

  setTimeout(seconds) {
    this.client.clientSocket.setTimeout(seconds);
  }

  get mxp() {
    return this.client.mxp;
  }

  send(message) {
    if (!message || !message.length || message.trim() == '') {
        return false;
    }

    message = message.replace(/(?:\r|\n)/g, '\r\n');

    if (message && message.charAt(message.length - 2) !== '\\') {
        message += '\r\n';
    }

    this.client.send(message);
  }
  
  getClientIp() {
    return this.client.clientSocket.remoteAddress.replace(/^.*:/, '');
  }
}

module.exports = User;
