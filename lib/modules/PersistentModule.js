const fs = require('fs');

class PersistentModule {
  constructor(moduleName) {
    this.moduleName = moduleName;
    this.dataFilePath = `lib/data/modules/${this.moduleName}`;
    this.load();
  }

  load() {

    if (!fs.existsSync(this.dataFilePath)) {
      this.init();
      return false;
    }

    var jsonFileContents = fs.readFileSync(this.dataFilePath);
    
    if (!jsonFileContents) {
      this.init();
      return false;
    }
    
    const data = JSON.parse(jsonFileContents);
    this.init(data);
    
    return true;
  }

  init() {
    // implement in child
  }

  // Relies on child class to implement toJSON
  save() {
    fs.writeFileSync(this.dataFilePath, JSON.stringify(this));
  }
}

module.exports = PersistentModule;
