const { usedTokens } = require('./Token')

class Variables {
  constructor(max_memory = 65536) {
    this.definedVariables = {};
    this.memoryAdr = {};
    this.max_memory = max_memory;
  }

  isVariableDefined(variable) {
    if(variable in this.definedVariables) {
      return true;
    }
    return false;
  }

  isVariableUndefined(variable) {
    if(!(variable in this.definedVariables)) {
      return true;
    }
    return false;
  }

  _nextAddress() {
    const sortedValues = Object.values(this.memoryAdr).sort();
    if(sortedValues.length === 0) {
      return 0;
    }
    for(let i = 0; i < sortedValues.length - 1; i++) {
      if(sortedValues[i] != sortedValues[i + 1] + 1) {
        return sortedValues[i + 1] + 1;
      }
    }
    return sortedValues[sortedValues.length - 1] + 1;
  }

  getVariableMemory(variable) {
    if(this.isVariableDefined(variable)) {
      return this.memoryAdr[variable];
    }
    this.memoryAdr[variable] = this._nextAddress();
    this.definedVariables[variable] = true;
  }
}

module.exports = Variables;