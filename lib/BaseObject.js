class BaseObject {
  constructor(id, name) {
    this.id   = id;
    this.name = name || "object";
    this.save = ['id', 'name', 'components', 'templates'];
    this.templates  = [];
    this.components = [];
  }

  hasComponent(componentName) {
    return this[componentName] ? true : false;
  }

  /**
   * Templates define components and default values.
   * When an object is loaded it is checked against the template's
   * components to ensure it is up to date with any additional properties
   * components that may have been added.
   */
  addTemplate(template) {
    if (this.templates.indexOf(template) !== -1) {
      return false;
    }

    this.templates.push(template);

    return true;
  }

  addComponent(componentName, attributes) {
    if (this.hasComponent(componentName)) {
      return false;
    }

    this[componentName] = attributes;
    this.components.push(componentName);

    return true;
  }

  removeComponentByName(componentName) {
    if (!this.hasComponent(componentName)) {
      return false;
    }

    delete this[componentName];

    return true;
  }

  addPersistentVariable(variableName) {
    this.persistentVariables.push(variableName);
  }

  restore(attributes) {
    for (const key in attributes) {
      this[key] = attributes[key];
    }
  }
  
  toJSON() {
    var vals = {};

    this.save.forEach( (key) => {
      vals[key] = this[key];
    });

    this.components.forEach( (componentName) => {
      if (!this[componentName]) {
        return;
      }

      if (this[componentName].save) {
        vals[componentName] = {};

        this[componentName].save.forEach( (key) => {
          vals[componentName][key] = this[componentName][key];
        });
      }
    });

    return vals;
  }
}

module.exports = BaseObject;
