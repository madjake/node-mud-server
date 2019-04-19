class Logger {

  debug(message) {
    console.log('\x1b[33mDEBUG\x1b[0m', message);
  }

  info(message) {
    console.log('\x1b[32mINFO\x1b[0m', message);
  }

  error(message) {
    console.log('\x1b[31mERROR\x1b[0m', message);
  }
}

module.exports = Logger;
