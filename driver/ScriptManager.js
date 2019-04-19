const fs = require('fs'),
      vm = require('vm'),
      Script = require('driver/Script');

class ScriptManager {
  constructor(logger, libPath) {
    this.logger = logger;
    this.libPath = libPath;
    this.scripts = {};

    this.loadScripts();
  }

  runScript(scriptName, sandbox) {
    if (!this.scripts[scriptName]) {
      return null;
    }

    return this.scripts[scriptName].run(sandbox || {});
  }

  getModule(scriptName, moduleName) {
    const script = this.scripts[scriptName];

    if (!script) {
      return null;
    }

    return script.getExportedModule(moduleName);
  }

  loadScripts() {
    const scriptFiles = this.getFilesInDirectoryTree(this.libPath);

    scriptFiles.forEach( (filePath) => {
      const script = this.loadScript(filePath);
      this.scripts[script.name] = script;
    })

    this.logger.info(`Loaded ${Object.keys(this.scripts).length} scripts from ${this.libPath}/:\n\t${Object.keys(this.scripts).join('\n\t')}`);
  }

  reloadScript(scriptName) {
    const oldScript = this.scripts[scriptName];

    if (!oldScript) {
      return false;
    }

    const filePath = oldScript.file;
    //this.uncacheModule(filePath);
    const script = this.loadScript(filePath);

    if (script) {
      delete this.scripts[scriptName];
      this.scripts[script.name] = script;
    }

    return true;
  }

  loadScript(filePath) {
    const scriptName = filePath.replace(/^lib\//, '').replace(/\.js$/, '');
    const rawScript = fs.readFileSync(filePath);
    let scriptWrapper = '%script_content%';

    if (rawScript.indexOf("module.exports") !== -1) {
      scriptWrapper = 'const module = {};\n%script_content%';
    }

    const wrappedScript = scriptWrapper.replace('%script_content%', rawScript);

    var vmScript = new vm.Script(wrappedScript, {
      filename: filePath, // filename for stack traces
      lineOffset: scriptWrapper.split('\n').length, // line number offset to be used for stack traces
      columnOffset: 1,
      displayErrors: true,
      timeout: 1000 // ms
    });

    try {
      const script = new Script(filePath, scriptName, vmScript, wrappedScript, rawScript);

      return script;
    } catch (exception) {
      this.logger.error(`Failed loading ${filePath}`);
      return null;
    }
  }

  getFilesInDirectoryTree(dirPath) {
    let files = fs.readdirSync(dirPath);
    let scriptFiles = [];

    files.forEach((fileName, idx) => {
      const filePath = `${dirPath}/${fileName}`;
      const fileStat = fs.statSync(filePath);

      if (!fileStat) {
        return;
      }

      if (fileStat.isDirectory()) {
        scriptFiles = [...scriptFiles, ...this.getFilesInDirectoryTree(filePath)];
      } else {
        scriptFiles.push(filePath);
      }
    });

    return scriptFiles;
  }
}

module.exports = ScriptManager;
