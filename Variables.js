class Variables {
  constructor() {
    this.definedVariables = {};
  }

  isVariableDefined(variable) {
    if(variable in this.definedVariables) {
      return true;
    }
    return false;
  }

  defineVariable(variable) {
    this.definedVariables[variable] = true;
  }
}

module.exports = Variables;