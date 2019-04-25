# Node Mud Server

This project is meant to establish a mud server using Node.JS that is fully
extendable during runtime. Most development can be done in game by issuing
commands and uploading/pasting scripts written in Javascript directly to the
game server.

Mud protocols the server will support:

* MCCP2 (Compression of sent and received text)
* MXP   (Out of band data e.g. menus, variables, etc)
* MSSP  (Mud Server Status Protocol. A protocol that reports information about your server so sites like [mudstats.com](http://mudstats.com) can automatically update its directory of MUDs.


## Design Philosphy 

- Full Game Systems can be implemented at runtime
- Game World Persistence
- ...

### Prerequisites

* [Node.js](https://nodejs.org/en/) ... See .nvmrc for version

Highly recommended to use [NVM](https://github.com/creationix/nvm) to manage node versions.

### Installing

No external depencies yet so no need to install anything.

## Running

### Run in foreground:

```
> npm start
```

## Inspirations

I take inspiration from codebases and games that I've have amazing experiences with through
the years:

- [Gemstone 4, Alliance of Heroes, Modus Operandi, and Dragon Realms](https://www.play.net/)
- [The Eternal City](http://www.skotos.net/games/eternal-city/)
- [ColdC](https://cold.org/coldc/) 
- [LPMuds](http://lpmuds.net/)

## Authors

* [Jake Fournier](https://github.com/madjake)

## License

This project is licensed under the ISC License - see the [LICENSE.md](LICENSE.md) file for details
