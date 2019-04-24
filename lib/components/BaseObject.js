class BaseObject {
  constructor(id, name) {
    this.id   = id;
    this.name = name || "object";
    this.persistentVariables = ['id', 'name'];
  }

  hasComponent(component) {
    return this.constructor.prototype[component.name] ? true : false;
  }

  static addComponent(component) {
    if (this.hasComponent(component)) {
      return false;
    }

    this.constructor.prototype[component.name] = component;

    return true;
  }

  addPersistentVariable(variableName) {
    this.persistentVariables.push(variableName);
  }

  save() {
    var json = JSON.stringify(this, (key, value) => {
      if (this.persistentVariables.indexOf(key) !== -1) {
        return value;
      }

      return undefined;
    });
  }
}

module.exports = BaseObject;
