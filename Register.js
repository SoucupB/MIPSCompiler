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

class RegistersEmbed {
  constructor(asm) {
    this.asm = asm
  }

  _isRegister(param) {
    return typeof param === 'number';
  }

  _isMem(param) {
    return typeof param !== 'number' && param[0] == '[';
  }

  _isNumber(param) {
    return typeof param === 'number';
  }

  _extractMemory(param) {
    return parseInt(param.substring(1, param.length - 1));
  }

  _registerMove(params) {
    if(this._isRegister(params[0]) && this._isNumber(params[1])) {
      return new RegisterEmbed('addi', [`$${params[0]}`, this.zeroReg, params[1]])
    }
    if(this._isRegister(params[0]) && this._isMem(params[1])) {
      return new RegisterEmbed('lw', [`$${params[0]}`, this.zeroReg, this._extractMemory(params[1])])
    }
    if(this._isMem(params[0]) && this._isRegister(params[1])) {
      return new RegisterEmbed('sw', [`$${params[1]}`, this.zeroReg, this._extractMemory(params[0])])
    }
    return null;
  }

  toMips() {
    this.zeroReg = '$0'
    this.oneReg = '$1'
    let response = [];
    response.push(new RegisterEmbed(`xor`, [this.zeroReg, this.zeroReg, this.zeroReg]))
    response.push(new RegisterEmbed(`addi`, [this.oneReg, this.zeroReg, 1]))
    for(let i = 0; i < this.asm.length; i++) {
      const params = this.asm[i].params;
      switch(this.asm[i].type.toLowerCase()) {
        case 'mov': {
          response.push(this._registerMove(params))
          break;
        }
        case 'add': {
          response.push(new RegisterEmbed('add', [`$${params[0]}`, `$${params[1]}`, `$${params[2]}`]))
          break;
        }
        case 'j': {
          response.push(new RegisterEmbed('j', params))
          break;
        }
        case 'mul': {
          response.push(new RegisterEmbed('mul', [`$${params[0]}`, `$${params[1]}`, `$${params[2]}`]))
          break;
        }
        case 'jre': {
          response.push(new RegisterEmbed('j', [params[0] + i + 1]))
          break;
        }
        case 'benq': {
          response.push(new RegisterEmbed('bne', [`$${params[0]}`, `$${params[1]}`, params[2]]))
          break;
        }
        case 'beq': {
          response.push(new RegisterEmbed('beq', [`$${params[0]}`, `$${params[1]}`, params[2]]))
          break;
        }
        case 'slt': {
          response.push(new RegisterEmbed('slt', [`$${params[0]}`, `$${params[1]}`, `$${params[2]}`]))
          break;
        }
        default: {
          break;
        }
      }
    }
    return response;
  }
}

module.exports = { Register, RegisterEmbed, RegistersEmbed };