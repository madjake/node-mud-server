
const memUsage = handler.getMemoryUsage();
let output = '';

for (let key in memUsage) {
  output += `${key} ${Math.round(memUsage[key] / 1024 / 1024 * 100) / 100} MB\n`;
}

output += `Total Loaded Game Objects: ${objectManager.objectStore.getLoadedObjectCount()}\n`;

user.send(output);
