/**
 * ObjectStore is the persistence layer for all game objects.
 *
 * Currently it's naive and simple. It loads all game objects
 * during start up/reload and serializes them all to a single
 * objects.json file when the save method is triggered.
 *
 * Future improvements to think about:
 *
 *  - Save in worker thread/child process
 *
 *  - Load objects on demand?
 *   
 *  - Store objects in a sharded way?
 *
 *  - Make a backup of the existing save data before saving and
 *    revert back to it if there were any issues during save?
 *
 *  - Only save object attributes if they are different than
 *    the component defaults?
 *
 */

const fs = require('fs');

const objectMap = {};

class ObjectStore {
  constructor(logger) {
    this.logger = logger;
    this.filePath = null;
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

  load(objFilePath, loadObjFunc) {
    this.filePath = objFilePath; 
    const loadStart = process.hrtime();

    try {
      const file = fs.openSync(this.filePath, 'r');

      let buffer = new Buffer.alloc(1024 * 1024);
      let bytesRead;
      let previousContent = '';

      while (bytesRead = fs.readSync(file, buffer, 0, buffer.length)) {

        const content = (previousContent + buffer.toString('ascii', 0, bytesRead)).split('\n');

        if (bytesRead === buffer.length) {
          previousContent = '\n' + content.splice(content.length -1)[0];
        } else {
          previousContent = '';
        }

        content.forEach((line) => {
          if (!line) {
            return;
          }
          const objData = JSON.parse(line);
          const obj = loadObjFunc(objData);

          this.addObject(obj);
        });
      }

      fs.closeSync(file);
      
      const loadTime = process.hrtime(loadStart);
      this.logger.info(`Loading ${this.getLoadedObjectCount()} objects took: ${loadTime[0]}s ${loadTime[1]/1000000}ms`);
    } catch (exception) {
      this.logger.error(["Missing object store file.", exception]);
    }

  }

  save() {
    const saveStartTime = process.hrtime();
    const writeStream = fs.createWriteStream(this.filePath, { flags : 'w' });
    let objCount = 0;

    for (const objId in objectMap) {
      writeStream.write(JSON.stringify(objectMap[objId]) + "\n");
      objCount++;
    }

    const saveTime = process.hrtime(saveStartTime);
    this.logger.info(`Saving ${objCount} objects took: ${saveTime[0]}s ${saveTime[1]/1000000}ms`);
  }
}

module.exports = ObjectStore;
