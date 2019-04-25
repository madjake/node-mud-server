class GameMap {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    
    this.map = {};
  }
 
  moveObject(obj, x, y) {
    const oldHash = this.hashPoint(obj.x, obj.y);
    const newHash = this.hashPoint(x, y);

    if (oldHash === newHash) {
      return true;
    }

    if (this.map[oldHash] && this.map[oldHash][obj.id]) {
      delete this.map[oldHash][old.id];
      
      if (Object.keys(this.map[oldHash]) === 0) {
        delete this.map[oldHash];
      }
    }
    
    if (!this.map[newHash]) {
      this.map[newHash] = {};
    }

    this.map[newHash][obj.id] = obj.id; 

    return true;
  }
 
  hashPoint(x, y) {
    return `${x},${y}`;
  }
}

module.exports = GameMap;
