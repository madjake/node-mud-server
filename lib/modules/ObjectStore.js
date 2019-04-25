const objectMap = {};
const dataStoreFilePath = 'lib/data/objects/objects.json';

class ObjectStore {
  constructor(gameServer, BaseObject) {
    this.gameServer = gameServer;
    this.BaseObject = BaseObject;
      
    this.load(dataStoreFilePath);
  }

  getLoadedObjectCount() {
    return Object.keys(objectMap).length;
  }  

  addObject(obj) {
    if (objectMap[obj.id]) {
      return false;
    }
     
    objectMap[obj.id] = obj;
    return true;
  }

  deleteObject(obj) {
    if (!objectMap[obj.id]) {
      return false;
    }
    
    delete objectMap[obj.id];
    return true;
  }

  load() {
    try {
      const file = fs.openSync(dataStoreFilePath, 'r');

      let buffer = new Buffer.alloc(1024 * 1024), len, prev = '';

      while (len = fs.readSync(file, buffer, 0, buffer.length)) {

        const content = (prev + buffer.toString('ascii', 0, len)).split('\n');
        prev = (len === buffer.length) ? ('\n' + content.splice(content.length - 1)[0]) : '';

        content.forEach((line) => {
          if (!line) {
            return;
          }
          const objData = JSON.parse(line);
          const obj = new this.BaseObject(objData.objId, "loading obj");
      
          obj.restore(objData);
          this.addObject(obj);
        });
      }

      fs.closeSync(file);
      
      this.gameServer.logger.info(`Loaded ${Object.keys(objectMap).length - 1} objects`);
    } catch (exception) {
      this.gameServer.logger.error(["Missing object store file.", exception]);
    }
  }

  save() {
    const writeStream = fs.createWriteStream(dataStoreFilePath, { flags : 'w' });
    const currentIdx = 0;

    for (const objId in objectMap) {
      writeStream.write(JSON.stringify(objectMap[objId]) + "\n");
    }
  }
}


class GameMap {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    
    this.map = {};
  }
 
  moveObject(obj, x, y) {
    const oldHash = this.hashPoint(obj.x, obj.y);
    const newHash = this.hashPoint(x, y);

    if (oldHash === newHash) {
      return true;
    }

    if (this.map[oldHash] && this.map[oldHash][obj.id]) {
      delete this.map[oldHash][old.id];
      
      if (Object.keys(this.map[oldHash]) === 0) {
        delete this.map[oldHash];
      }
    }
    
    if (!this.map[newHash]) {
      this.map[newHash] = {};
    }

    this.map[newHash][obj.id] = obj.id; 

    return true;
  }
 
  hashPoint(x, y) {
    return `${x},${y}`;
  }
}

module.exports = ObjectStore;
