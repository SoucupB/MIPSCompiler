class Register {
  constructor(numberOfRegisters = 16) {
    this.emptyRegisters = {};
    this.numberOfRegisters = numberOfRegisters;
    this.firstRegister = 3;
  }

  getEmptyRegister() {
    if(Object.entries(this.emptyRegisters).length === 0) {
      this._fillRegister(this.firstRegister);
      return this.firstRegister;
    }
    for(let i = this.firstRegister, c = this.numberOfRegisters; i < c; i++) {
      if(!(i in this.emptyRegisters) || this.emptyRegisters[i] == true) {
        this._fillRegister(i);
        return i;
      }
    }
    return null;
  }

  freeRegister(i) {
    this.emptyRegisters[i] = true;
  }

  _fillRegister(i) {
    this.emptyRegisters[i] = false;
  }
}

class RegisterEmbed {
  constructor(type, params) {
    this.type = type;
    this.params = params;
  }
}

module.exports = { Register, RegisterEmbed };