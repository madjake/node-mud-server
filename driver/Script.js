
class Script {
  constructor(file, name, vmScript, contents, rawScript, sandbox) {
    this.file = file;
    this.name = name;
    this.vmScript = vmScript;
    this.contents = contents;
    this.rawScript = rawScript;
    this.exports = {}
    this.isModule = false;
    
    if (this.rawScript.indexOf("module.exports") !== -1) {
      this.isModule = true;
      this.exports = this.vmScript.runInNewContext(sandbox);
    }
  }

  run(sandbox) {
    return this.vmScript.runInNewContext(sandbox);
  }

  getExportedModule(moduleName) {
    if (this.isModule && !moduleName) {
      return this.exports;
    } else if (this.isModule && this.exports
        && Object.getPrototypeOf(this.exports) === Object.prototype
        && this.exports[moduleName]) {

      return this.exports[moduleName];
    }

    return null;
  }
}

module.exports = Script;
