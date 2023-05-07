const { usedTokens } = require('./Token')

class Variables {
  constructor() {
    this.definedVariables = {};
  }

  isVariableDefined(variable) {
    if(variable.length !== 0 && !(variable in usedTokens) && variable in this.definedVariables) {
      return true;
    }
    return false;
  }

  isVariableUndefined(variable) {
    if(variable.length !== 0 && !(variable in usedTokens) && !(variable in this.definedVariables)) {
      return true;
    }
    return false;
  }

  defineVariable(variable) {
    this.definedVariables[variable] = true;
  }
}

module.exports = Variables;