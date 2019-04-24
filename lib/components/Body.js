class Body {
  constructor() {
    this.user = null;
    this.test = 'hello';
    this.persistentVariables = ['test']
  }

  //If a body has a user it's a player otherwise it's an NPC
  setUser(user) {
    this.user = user; 
  }

  isTest() {
    return "boooo";
  }
}


module.exports = Body;
