/**
 * ObjectManager handles the creation and persistence of game objects.
 * 
 * The implemented ObjectStore and ObjectManager assumes an entirely persistent
 * game. All object attributes are saved and restored during reloads and server
 * reboots. Because the server allows for live programming I've opted for a less
 * restrictive object model.  Game Objects are just list of properties. Game Objects
 * receive properties by being assigned components. Templates are used to group
 * components together to create consistency amongst object types.  
 *
 * Components:
 *
 * Components are simple dictionaries defining the properties associated with a
 * a particular concept. For example a GameObject with the Descriptive component
 * will have a `name` and `description` property.
 *
 * Templates:
 * 
 * Templates are collections of components and default values for the component's
 * properties. The `Player` template defines components that a player would have 
 * e.g. `Body`, `User`, and `Descriptive`
 * 
 */
class ObjectManager {
  constructor(logger, scriptManager, objectStore) {
    this.logger = logger;
    this.scriptManager = scriptManager;
    this.objectStore = objectStore;
    this.components = {};
    this.templates  = {};

    this.loadComponents();
    this.loadTemplates();

    this.BaseObject = this.scriptManager.getModule('BaseObject');
  }
 
  loadComponents() {
    // this will be done with OLC
    this.addComponent('Body', 'components/Body');
    this.addComponent('Descriptive', 'components/Descriptive');
  }

  loadTemplates() {
    this.addTemplate('Player', 'templates/Player'); 
  }
 
  save() {
    this.objectStore.save();
  }

  addTemplate(templateName, templateScript) {
    this.templates[templateName] = this.scriptManager.getModule(templateScript);
  }

  addComponent(componentName, componentScript) {
    this.components[componentName] = this.scriptManager.getModule(componentScript);
  }

  createObject(objectName, templates) {
    const id = Math.floor(Math.random() * 100000000);//tmp for testing
    const obj = new this.BaseObject(id, objectName);

    this.objectStore.addObject(obj);  

    templates.forEach ( (templateName) => {
      const template = this.templates[templateName];
      
      if (template) {
        this.addComponents(obj, template.components);
        obj.addTemplate(templateName);
      }
    });

    return obj;
  }

  addComponents(obj, componentNames) {
    componentNames.forEach( (componentName) => {
      const component = this.components[componentName];

      if (component) {
        obj.addComponent(componentName, component);
      }
    });

  }
  
  loadObject(objData) {
    const obj = new this.BaseObject(objData.objId, "loading obj");
    obj.restore(objData);

    return obj;
  }
}

module.exports = ObjectManager;
