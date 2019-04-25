
const reloadCmd = (scriptName, user) => { 
  if (!scriptName) {
    user.send('Reload which script?');
    return;
  }

  user.send(util.inspect(gameServer.reloading));
  if (gameServer.reloading) {
    user.send("Already in the process of reloading...");
    return;
  }

  user.send(`Reloading ${scriptName}...`);

  try {
    gameServer.scriptManager.reloadScript(scriptName);
    gameServer.loadLib();
    gameServer.forceGarbageCollection(); 
    
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
