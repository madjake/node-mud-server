const fs = require('fs'),
      vm = require('vm'),
      path = require('path'),
      util = require('util'),
      Script = require('driver/Script');

class ScriptManager {
  constructor(logger, libPath) {
    this.logger = logger;
    this.libPath = libPath;
    this.scripts = {};
    this.scriptDependencies = [];
  }

  setScriptRuntimeDependencies(moduleNames) {
    let modules = {};

    if (moduleNames && !moduleNames.length) {
      return false;
    }

    moduleNames.forEach( (moduleName) => {
      const module = this.getModule(moduleName);
      modules[module.name] = module;
    });

    this.scriptDependencies = modules;
  }

  getDefaultSandbox() {
    return {
			Buffer: Buffer,
      require: require,
      util: util,
      fs: fs,
      path: path,
      setInterval,
      setTimeout,
      ...this.scriptDependencies,
      runScript: this.runScript,
      createModule: this.createModule
    };
  }

  runScript(scriptName, sandbox) {
    if (!this.scripts[scriptName]) {
      this.loadScript(scriptName);
    }
    
    if (!this.scripts[scriptName]) {
      return null;
    }

    sandbox = {...this.getDefaultSandbox(), ...sandbox};
    
    return this.scripts[scriptName].run(sandbox);
  }

  createModule(scriptName, ...args) {
    return new (this.getModule(scriptName))(...args.slice(0));
  }

  getModule(scriptName, moduleName) {
    if (!this.scripts[scriptName]) {
      this.loadScript(scriptName);
    }
    
    if (!this.scripts[scriptName]) {
      return null;
    }

    return this.scripts[scriptName].getExportedModule(moduleName);
  }
 
  loadScript(scriptName) {
    const filePath = `lib/${scriptName}.js`;
    const rawScript = fs.readFileSync(filePath);
    let scriptWrapper = '%script_content%';
    
    if (rawScript.indexOf("module.exports") !== -1) {
      scriptWrapper = 'const module = {};\n%script_content%';
    }

    const wrappedScript = scriptWrapper.replace('%script_content%', rawScript);
    
    var vmScript = new vm.Script(wrappedScript, {
      filename: filePath, // filename for stack traces
      lineOffset: -(scriptWrapper.split('\n').length - 1), // line number offset to be used for stack traces
      columnOffset: 1,
      displayErrors: true,
      timeout: 1000 // ms
    });

    this.scripts[scriptName] = new Script(filePath, scriptName, vmScript, wrappedScript, rawScript, this.getDefaultSandbox());
    this.logger.info(`Loaded script: ${scriptName}`);

    return this.scripts[scriptName];
  }

  reloadScript(scriptName) { 
    const script = this.loadScript(scriptName);

    if (script) {
      delete this.scripts[scriptName];
      this.scripts[script.name] = script;
    }

    return true;
  }

  getFilesInDirectoryTree(dirPath, fileExtension) {
    const files = fs.readdirSync(dirPath);
    let scriptFiles = [];

    files.forEach((fileName, idx) => {
      const filePath = `${dirPath}/${fileName}`;
      const fileStat = fs.statSync(filePath);

      if (!fileStat) {
        return;
      }

      if (fileStat.isDirectory()) {
        scriptFiles = [...scriptFiles, ...this.getFilesInDirectoryTree(filePath, fileExtension)];
      } else if (path.extname(filePath) === fileExtension) {
        scriptFiles.push(filePath);
      }
    });

    return scriptFiles;
  }
}

module.exports = ScriptManager;
