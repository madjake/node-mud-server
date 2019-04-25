
const reloadCmd = (scriptName, user) => { 
  if (!scriptName) {
    user.send('Reload which script?');
    return;
  }

  user.send(`Reloading ${scriptName}...`);

  try {
    scriptManager.reloadScript(scriptName);
    
    if (!scriptName.startsWith('cmds/')) {
      handler.reloadLib();
      handler.forceGarbageCollection(); 
    }
    
    user.send(`Reloaded ${scriptName}.`);
  } catch (exception) {
    
    logger.error(`Failed loading ${scriptName}... ${exception.stack}`);
    
    if (user.isAdmin) {
      user.send(`Error loading script ${scriptName}\nStacktrace: ${exception.stack}`);
    }

    return null;
  }
};

let scriptName;

if (command.args.length > 1) {
  scriptName = command.args.slice(1).join(' ');
}

reloadCmd(scriptName, user);
