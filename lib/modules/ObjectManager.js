class ObjectManager {
  constructor(gameServer) {
    this.gameServer = gameServer;
    this.BaseObject = this.gameServer.scriptManager.getModule('components/BaseObject');
    this.components = {};
  }

  createBody() {
    const body = this.getComponent('Body');
    this.gameServer.logger.debug(body);
    const obj = Object.assign(this.BaseObject.constructor.prototype, body);
    this.gameServer.logger.debug(obj);

    return obj;
  }

  createObject() {
    const id = Math.floor(Math.random() * 100000);//tmp for testing
    const obj = new this.BaseObject(id, "generic object");

    //register object with object store

    return obj;
  }

  getNewComponent(componentName) {
    const Component = this.getComponent(componentName);

    return new Component();
  }

  getComponent(componentName) {
    if (!this.components[componentName]) {
      this.components[componentName] = this.gameServer.scriptManager.getModule(`components/${componentName}`);
    }
    
    this.gameServer.logger.debug(this.components);
    return this.components[componentName];
  }
}

module.exports = ObjectManager;
