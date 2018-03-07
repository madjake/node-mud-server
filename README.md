# Node Mud Server

The goal of the Node Mud Server project is to establish a barebones mud server that supports common mud protocols
and takes care of the fundamentals of network programming within the Node.js environment.

This isn't meant to be a fully playable game but instead offer a starting point for developers to design and implement
their own game mechanics.

Mud protocols the server will support:

* MCCP2 (Compression of sent and received text)
* MXP   (Out of band data e.g. menus, variables, etc)
* MSSP  (Mud Server Status Protocol. A protocol that reports information about your server so sites like [mudstats.com](http://mudstats.com) can automatically update its directory of MUDs.

### Prerequisites

* [Node.js](https://nodejs.org/en/) Tested on v8.10.0 and above

### Installing

No external depencies yet so no need to install anything.

## Running

### Run in foreground:

```
> node server.js
```

or

```
> npm start
```

### Run in background: 

This isn't really ready for prime time but if you wanted to run this a great process manager for nodejs
is [PM2](http://pm2.keymetrics.io/)

Start :
```
> npm install pm2 -g
> pm2 start server.js --name "mud"
```

Stop:
```
> pm2 stop mud
```

Restart:
```
> pm2 restart mud
```

For information about startup scripts (your server reboots) and how to configure PM2 to run on reboots see http://pm2.keymetrics.io/docs/usage/startup/

## Authors

* [Jake Fournier](https://github.com/madjake)

## License

This project is licensed under the ISC License - see the [LICENSE.md](LICENSE.md) file for details
