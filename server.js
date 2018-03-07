//Allow relative paths when requiring
process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

const GameServer = require('driver/GameServer'),
      Logger = require('driver/Logger'),
      config = require('config/settings.json');

process.on('uncaughtException', function (err) {
  console.log('Uncaught exception:', err.stack);
  process.exit(42);
});

const logger = new Logger();
const gameServer = new GameServer(config, logger);
gameServer.start();
