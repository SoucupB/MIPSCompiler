const tokens = {
  initialization: 0,
  sign_plus: 1,
  sign_minus: 2,
  sign_mul: 3,
  constant_token: 4,
  sign_div: 5,
  sign_open_paranth: 6,
  sign_close_paranth: 7,
  variable: 8,
  data_type: 9,
  expression: 10,
  sign_double_and: 11,
  sign_double_or: 12,
  sign_greater: 13,
  sign_lower: 14,
  sign_double_equal: 15,
  if_instruction: 16,
  sign_mod: 17,
  sign_not_equal: 18
}

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
      if(sortedValues[i] + 1 != sortedValues[i + 1]) {
        return sortedValues[i] + 1;
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

class Utils {
  static iterateThroughNonTokensSeparators(string, index) {
    while(index[0] < string.length && (string[index[0]] == '\n' || string[index[0]] == '\t' || string[index[0]] == '\t\n' || string[index[0]] == ' ')) {
      index[0]++;
    }
  }

  static _equals(a, b, index, expectedIndex) {
    return index < a.length && expectedIndex < b.length && a[index] == b[expectedIndex];
  }

  static _isNormalChar(string, index) {
    return index < string.length && !(string[index] == '\n' || string[index] == '\t' || string[index] == '\t\n' || string[index] == ' ')
  }

  static _isEqual(token, expected) {
    return token === expected;
  }

  static expectString(string, expected, index) {
    Utils.iterateThroughNonTokensSeparators(string, index);
    let i = index[0];
    let toCompare = Utils._isEqual;
    let token = "";
    if(expected.type == 'dynamic') {
      toCompare = expected.comparer;
    }
    while(Utils._isNormalChar(string, i)) {
      token += string[i];
      i++;
    }
    if(!toCompare(expected.payload, token)) {
      return false;
    }
    index[0] = i;
    return true;
  }

  static isNumber(number) {
    if (!isNaN(Number(number))) {
      return true
    }
    return false;
  }
  
  static createExpression(payload) {
    let response = [];
    for(let i = 0; i < payload.length; i++) {
      switch(payload[i]) {
        case '+': {
          response.push({
            token: tokens.sign_plus
          })
          break;
        }
        case '-': {
          response.push({
            token: tokens.sign_minus
          })
          break;
        }
        case '*': {
          response.push({
            token: tokens.sign_mul
          })
          break;
        }
        case '/': {
          response.push({
            token: tokens.sign_div
          })
          break;
        }
        case '%': {
          response.push({
            token: tokens.sign_mod
          })
          break;
        }
        case '(': {
          response.push({
            token: tokens.sign_open_paranth
          })
          break;
        }
        case ')': {
          response.push({
            token: tokens.sign_close_paranth
          })
          break;
        }
        case '&&': {
          response.push({
            token: tokens.sign_double_and
          })
          break;
        }
        case '||': {
          response.push({
            token: tokens.sign_double_or
          })
          break;
        }
        case '>': {
          response.push({
            token: tokens.sign_greater
          })
          break;
        }
        case '<': {
          response.push({
            token: tokens.sign_lower
          })
          break;
        }
        case '==': {
          response.push({
            token: tokens.sign_double_equal
          })
          break;
        }
        case '!=': {
          response.push({
            token: tokens.sign_not_equal
          })
          break;
        }
        default: {
          const isNum = Utils.isNumber(payload[i]);
          response.push({
            token: isNum ? tokens.constant_token : tokens.variable,
            value: isNum ? parseInt(payload[i]) : payload[i]
          })
          break;
        }
      }
    }
    return response;
  }

  static areRegistersEqual(src, dst) {
    if(src.length !== dst.length) {
      return false;
    }
    for(let i = 0; i < src.length; i++) {
      if(src[i].type !== dst[i].type || JSON.stringify(src[i].params) !== JSON.stringify(dst[i].params)) {
        return false;
      }
    }
    return true;
  }

  static createAssignationPayload(payloadData) {
    return {
      token: 'assignation',
      payload: [
        {
          token: tokens.variable,
          payload: payloadData[0]
        },
        {
          token: tokens.expression,
          payload: Utils.createExpression(payloadData.slice(-(payloadData.length - 1)))
        }
      ]
    }
  }

  static createConditionalPayload(condictionExpression, instructions) {
    const payload = {
      token: 'condition',
      payload: []
    };
    if(condictionExpression) {
      payload.payload.push({
        token: tokens.expression,
        payload: condictionExpression
      })
    }
    for(let i = 0; i < instructions.length; i++) {
      payload.payload.push(instructions[i])
    }
    return payload
  }

  static createForLoopPayload(loopInstructions, instructions) {
    const payload = {
      token: 'for_loop',
      payload: [
        loopInstructions[0],
        {
          token: tokens.expression,
          payload: loopInstructions[1]
        },
        loopInstructions[2]
      ]
    };
    for(let i = 0; i < instructions.length; i++) {
      payload.payload.push(instructions[i])
    }
    return payload
  }
  
  static createInitializationPayload(payloadData) {
    const payload = {
      token: 'initialization',
      payload: [
        {
          token: tokens.data_type,
          payload: payloadData[0]
        },
        {
          token: tokens.variable,
          payload: payloadData[1]
        },
      ]
    };
    const expression = payloadData.slice(-(payloadData.length - 2));
    if(payloadData.length > 2) {
      payload.payload.push({
        token: tokens.expression,
        payload: Utils.createExpression(expression)
      })
    }
  
    return payload
  }
}

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
  constructor(asm, variables) {
    this.asm = asm
    this.variables = variables;
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

  _mips_ExtractReg(param) {
    return parseInt(param.charAt(1));
  }

  pretifyOutPut(output) {
    let response = ""
    for(const [key, _] of Object.entries(this.variables.definedVariables)) {
      response += `${key}: ${output['memory'][this.variables.memoryAdr[key]]};` + '\n'
    }
    return response;
  }

  executeMips(mipsAsm, pretify = false, registerCount = 32, memCount = 256) {
    let memory = Array(memCount).fill(0);
    let registers = Array(registerCount).fill(0);
    let i = 0;
    let specialRegisters = {
      mfhi: 0,
      mflo: 0
    }
    while(i < mipsAsm.length) {
      const param = mipsAsm[i].params;
      switch(mipsAsm[i].type.toLowerCase()) {
        case 'add': {
          registers[this._mips_ExtractReg(param[0])] = registers[this._mips_ExtractReg(param[1])] + registers[this._mips_ExtractReg(param[2])]
          break;
        }
        case 'or': {
          registers[this._mips_ExtractReg(param[0])] = (registers[this._mips_ExtractReg(param[1])] != 0 || registers[this._mips_ExtractReg(param[2])] != 0) ? 1 : 0
          break;
        }
        case 'and': {
          registers[this._mips_ExtractReg(param[0])] = (registers[this._mips_ExtractReg(param[1])] != 0 && registers[this._mips_ExtractReg(param[2])] != 0) ? 1 : 0
          break;
        }
        case 'div': {
          specialRegisters.mfhi = registers[this._mips_ExtractReg(param[0])] % registers[this._mips_ExtractReg(param[1])];
          specialRegisters.mflo = Math.floor(registers[this._mips_ExtractReg(param[0])] / registers[this._mips_ExtractReg(param[1])]);
          break;
        }
        case 'mflo': {
          registers[this._mips_ExtractReg(param[0])] = specialRegisters.mflo
          break;
        }
        case 'mfhi': {
          registers[this._mips_ExtractReg(param[0])] = specialRegisters.mfhi
          break;
        }
        case 'mul': {
          registers[this._mips_ExtractReg(param[0])] = registers[this._mips_ExtractReg(param[1])] * registers[this._mips_ExtractReg(param[2])]
          break;
        }
        case 'addi': {
          registers[this._mips_ExtractReg(param[0])] = registers[this._mips_ExtractReg(param[1])] + parseInt(param[2]);
          break;
        }
        case 'xor': {
          registers[this._mips_ExtractReg(param[0])] = (registers[this._mips_ExtractReg(param[1])] ^ registers[this._mips_ExtractReg(param[2])])
          break;
        }
        case 'sw': {
          memory[param[2] + registers[this._mips_ExtractReg(param[1])]] = registers[this._mips_ExtractReg(param[0])]
          break;
        }
        case 'lw': {
          registers[this._mips_ExtractReg(param[0])] = memory[param[2] + registers[this._mips_ExtractReg(param[1])]]
          break;
        }
        case 'slt': {
          registers[this._mips_ExtractReg(param[0])] = (registers[this._mips_ExtractReg(param[1])] < registers[this._mips_ExtractReg(param[2])]) ? 1 : 0
          break;
        }
        case 'bne': {
          if(registers[this._mips_ExtractReg(param[0])] != registers[this._mips_ExtractReg(param[1])]) {
            i = parseInt(param[2] + i);
          }
          break;
        }
        case 'beq': {
          if(registers[this._mips_ExtractReg(param[0])] == registers[this._mips_ExtractReg(param[1])]) {
            i = parseInt(param[2] + i);
          }
          break;
        }
        case 'j': {
          i = parseInt(param[0]);
          continue;
        }
        default: {
          break;
        }
      }
      i++;
    }
    if(pretify) {
      return this.pretifyOutPut({
        memory: memory,
        registers: registers
      })
    }
    return {
      memory: memory,
      registers: registers
    }
  }

  toMipsString() {
    const mipsCode = this.toMips();
    let response = [];
    for(let i = 0; i < mipsCode.length; i++) {
      response.push(`${i}: ${mipsCode[i].type} ${mipsCode[i].params.join(' ')}`)
    }
    return response.join('\n')
  }

  toMips() {
    this.zeroReg = '$0'
    this.oneReg = '$1'
    let response = [];
    response.push(new RegisterEmbed(`xor`, [this.zeroReg, this.zeroReg, this.zeroReg]))
    response.push(new RegisterEmbed(`addi`, [this.oneReg, this.zeroReg, 1]))
    let offset = 2;
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
        case 'div': {
          response.push(new RegisterEmbed('div', [`$${params[0]}`, `$${params[1]}`]))
          break;
        }
        case 'mflo': {
          response.push(new RegisterEmbed('mflo', [`$${params[0]}`]))
          break;
        }
        case 'mfhi': {
          response.push(new RegisterEmbed('mfhi', [`$${params[0]}`]))
          break;
        }
        case 'or': {
          response.push(new RegisterEmbed('or', [`$${params[0]}`, `$${params[1]}`, `$${params[2]}`]))
          break;
        }
        case 'and': {
          response.push(new RegisterEmbed('and', [`$${params[0]}`, `$${params[1]}`, `$${params[2]}`]))
          break;
        }
        case 'j': {
          response.push(new RegisterEmbed('j', [params[0] + offset]))
          break;
        }
        case 'mul': {
          response.push(new RegisterEmbed('mul', [`$${params[0]}`, `$${params[1]}`, `$${params[2]}`]))
          break;
        }
        case 'jre': {
          response.push(new RegisterEmbed('j', [params[0] + i + 1 + offset]))
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

class Parser {
  constructor(code) {
    this.code = code;
  }

  containsSpecialCharacters(str) {
    var regex = /[^a-zA-Z0-9_]/;
    return regex.test(str);
  }

  isNumber(input) {
    return !isNaN(input);
  }

  _isValidVariableName(str) {
    if (str === '' || /^\d/.test(str)) {
      return false;
    }

    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(str)) {
      return false;
    }

    var reservedKeywords = [
      'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
      'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for',
      'function', 'if', 'implements', 'import', 'in', 'instanceof', 'interface', 'let',
      'new', 'null', 'package', 'private', 'protected', 'public', 'return', 'static',
      'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void',
      'while', 'with', 'yield'
    ];
    if (reservedKeywords.includes(str)) {
      return false;
    }
    return true;
  }

  getNumberToken(str, index) {
    let i = index[0];
    let number = ''
    while(i < str.length && !this.containsSpecialCharacters(str[i])) {
      number += str[i];
      i++;
    }
    if(this.isNumber(number)) {
      index[0] = i;
      return number;
    }
    return null;
  }

  getVarToken(str, index) {
    let i = index[0];
    let variable = ''
    while(i < str.length && !this.containsSpecialCharacters(str[i])) {
      variable += str[i];
      i++;
    }
    if(this._isValidVariableName(variable)) {
      index[0] = i;
      return variable;
    }
    return null;
  }

  spaceSeparator(str, index) {
    while(str[index[0]] == ' ' || str[index[0]] == '\n' || str[index[0]] == '\t' || str[index[0]] == '\t\n') {
      index[0]++;
    }
  }

  getNextToken(str, index) {
    this.spaceSeparator(str, index);
    let nrToken = this.getNumberToken(str, index);
    if(nrToken) {
      return nrToken;
    }
    let varToken = this.getVarToken(str, index);
    if(varToken) {
      return varToken
    }
    return null;
  }

  _isSign(chr) {
    return chr == '|' || chr == '-' || chr == '+' || chr == '*' || chr == '/' || chr == '%' || chr == '&' || chr == '=' || chr == '<' || chr == '>';
  }

  _isExtendedSign(chr) {
    return this._isSign(chr) || chr == '==' || chr == '<=' || chr == '>=' || chr == '!=';
  }

  _isSignToken(str, index) {
    let token = "";
    let i = index[0];
    while(i < str.length && this._isSign(str[i])) {
      token += str[i++];
    }
    if(token.length !== 0 && this._isExtendedSign(token)) {
      return token;
    }
    return null;
  }

  _extractParanthesisOperations(str, index, instructions) {
    this.spaceSeparator(str, index);
    if(str[index[0]] == '(') {
      instructions.push('(')
      index[0]++;
      this.expectExpression_t(str, index, instructions);
      if(str[index[0]] != ')') {
        return 0;
      }
      index[0]++;
      this.spaceSeparator(str, index);
      instructions.push(')')
      return 1;
    }
    this.spaceSeparator(str, index);
    return 2;
  }

  expectExpression_t(str, index, instructions) {
    let currentIndex = [index[0]]
    if(this._extractParanthesisOperations(str, currentIndex, instructions) == 0) {
      return ;
    }
    let token = this.getNextToken(str, currentIndex)
    if(!token) {
      return ;
    }
    this.spaceSeparator(str, currentIndex);
    instructions.push(token)
    while(currentIndex[0] < str.length && this._isSignToken(str, currentIndex)) {
      instructions.push(this._isSignToken(str, currentIndex))
      currentIndex[0] += this._isSignToken(str, currentIndex).length;
      const paranthExpression = this._extractParanthesisOperations(str, currentIndex, instructions);
      if(paranthExpression == 0) {
        return ;
      }
      if(paranthExpression == 1) {
        continue;
      }
      token = this.getNextToken(str, currentIndex)
      if(!token) {
        return ;
      }
      instructions.push(token);
      this.spaceSeparator(str, currentIndex);
    }
    this.spaceSeparator(str, currentIndex);
    index[0] = currentIndex[0];
    return 
  }

  _getString(str, index, toCompareWith) {
    let toCompareWithIndex = 0;
    let ind = index[0];
    for(let i = 0; i < toCompareWith.length; i++) {
      if(toCompareWith[i] == str[ind++]) {
        toCompareWithIndex++;
      }
      else {
        break;
      }
    }
    if(toCompareWithIndex == toCompareWith.length) {
      return true;
    }
    return false;
  }

  expectInitialization(str, index) {
    this.spaceSeparator(str, index);
    if(this._getString(str, index, 'int')) {
      return true;
    }
    return false;
  }

  _jump(str, index, toCompareString) {
    this.spaceSeparator(str, index);
    if(this._getString(str, index, toCompareString)) {
      index[0] += toCompareString.length;
      return true;
    }
    return false;
  }

  parseInstructions(str, index, toParse, implicit = true) {
    let tokens = [];
    let newIndex = [index[0]]
    for(let i = 0; i < toParse.length; i++) {
      this.spaceSeparator(str, newIndex);
      switch(toParse[i]) {
        case '$var': {
          tokens.push(this.getVarToken(str, newIndex));
          continue;
        }
        case '$expression': {
          if(implicit) {
            tokens = tokens.concat(this.expectExpression(str, newIndex));
          }
          else {
            tokens.push(this.expectExpression(str, newIndex, true))
          }
          continue;
        }
        case '$assignation': {
          if(implicit) {
            tokens = tokens.concat(this.getAssignationTokens(str, newIndex, false));
          }
          else {
            tokens.push(this.getAssignation(str, newIndex, false));
          }
          continue;
        }
        case '$code': {
          const newInstructions = this.parse_t(str, newIndex);
          if(newInstructions) {
            tokens = tokens.concat(newInstructions);
          }
          continue;
        }
        default: {
          break;
        }
      }
      if(!this._jump(str, newIndex, toParse[i])) {
        return false
      }
      if(implicit) {
        tokens.push(toParse[i]);
      }
    }
    index[0] = newIndex[0];
    return tokens;
  }

  getAssignationTokens(str, index, withTerminationStr = true) {
    let toExpect = ['$var', '=', '$expression']
    if(withTerminationStr) {
      toExpect.push(';')
    }
    let tokens = this.parseInstructions(str, index, toExpect);
    if(tokens) {
      tokens.splice(1, 1);
      if(withTerminationStr) { 
        tokens.splice(tokens.length - 1, 1);
      }
      return tokens;
    }
    return null;
  }

  getAssignation(str, index, withTerminationStr = true) {
    let assignation = this.getAssignationTokens(str, index, withTerminationStr);
    if(assignation) {
      return Utils.createAssignationPayload(assignation);
    }
    return null;
  }

  getForLoop(str, index) {
    let toExpect = ['for', '(', '$assignation', ';', '$expression', ';', '$assignation', ')', '{', '$code', '}']  
    let tokens = this.parseInstructions(str, index, toExpect, false);
    if(tokens) {
      return tokens;
    }
    return false;
  }

  getConditional(str, index) {
    let toExpect = ['if', '(', '$expression', ')', '{', '$code', '}']  
    let tokens = this.parseInstructions(str, index, toExpect, false);
    if(tokens) {
      return tokens;
    }
    return false;
  }

  parseInitialization(str, index) {
    let isExpression = this.expectInitialization(str, index);
    if(isExpression) {
      let toExpect = ['int', '$var', '=', '$expression', ';'];
      let tokens = this.parseInstructions(str, index, toExpect);
      if(tokens) {
        tokens.splice(2, 1);
        tokens.splice(tokens.length - 1, 1);
        return Utils.createInitializationPayload(tokens);
      }
    }
    if(isExpression) {
      let toExpect = ['int', '$var', ';']
      let tokens = this.parseInstructions(str, index, toExpect);
      if(tokens) {
        tokens.splice(tokens.length - 1, 1);
        return Utils.createInitializationPayload(tokens);
      }
    }
    let assignation = this.getAssignation(str, index);
    if(assignation) {
      return assignation;
    }
    let forLoop = this.getForLoop(str, index);
    if(forLoop) {
      return Utils.createForLoopPayload([forLoop[0], forLoop[1], forLoop[2]], forLoop.slice(3));
    }
    let conditional = this.getConditional(str, index);
    if(conditional) {
      return Utils.createConditionalPayload(conditional[0], conditional.slice(1));
    }
    return null;
  }

  expectExpression(str, index, implicit = false) {
    let instructions = [];
    this.expectExpression_t(str, index, instructions)
    if(!implicit) {
      return instructions;
    }
    return Utils.createExpression(instructions);
  }

  parse_t(code, index) {
    let codePointer = [index[0]];
    let response = [];
    while(codePointer[0] < code.length) {
      let tokens = this.parseInitialization(code, codePointer);
      if(!tokens) {
        index[0] = codePointer[0];
        return response;
      }
      response.push(tokens)
    }
    index[0] = codePointer[0];
    return response;
  }

  parse() {
    let codePointer = [0];
    return this.parse_t(this.code, codePointer)
  }

  compile() {
    const parsedData = this.parse();
    const code = new Compiler(parsedData);
    code.compile();
    const resp = new RegistersEmbed(code.asm, code.variables);
    return resp.toMipsString();
  }

  run() {
    const parsedData = this.parse();
    const code = new Compiler(parsedData);
    code.compile();
    const resp = new RegistersEmbed(code.asm, code.variables);
    return resp.executeMips(resp.toMips(), true);
  }
}

let nodeID = 0;

class ExpressionTree {
  constructor(variables = null) {
    this.root = new ExpressionNode();
    this.registers = new Register();
    this.registerIDs = {};
    this.variables = variables;
  }

  _getRegisterValue(node_id) {
    if(node_id in this.registerIDs) {
      return this.registerIDs[node_id];
    }
    const newReg = this.registers.getEmptyRegister();
    this.registerIDs[node_id] = newReg
    return newReg;
  }

  _getEmptyRegister() {
    return this.registers.getEmptyRegister();
  }

  _freeRegisters(node_id) {
    if(!(node_id in this.registerIDs)) {
      this.registers.freeRegister(node_id)
      return ;
    }
    const currentReg = this.registerIDs[node_id];
    delete this.registerIDs[node_id];
    this.registers.freeRegister(currentReg);
  }

  freeRegisterByNumber(register) {
    for(const [key, value] of Object.entries(this.registerIDs)) {
      if(value == register) {
        this._freeRegisters(key);
        return ;
      }
    }
  }

  freeNonIDRegister(register) {
    this._freeRegisters(register);
  }

  toRegister() {
    let asm = [];
    this.toRegister_t(this.root, asm);
    return asm;
  }

  getExpressionRegisterIndex(asm) {
    if(!asm.length) {
      return null;
    }
    return asm[asm.length - 1].params[0];
  }

  pushAssignationAsm(node) {
    if(node.token == tokens.constant_token) {
      return new RegisterEmbed('mov', [this._getRegisterValue(node.id), node.value]);
    }
    return new RegisterEmbed('mov', [this._getRegisterValue(node.id), `[${this.variables.getVariableMemory(node.value)}]`]);
  }

  _addArithmeticRegisterToAsm(regName, node, asm) {
    const leftReg = this._getRegisterValue(node.left.id);
    const rightReg = this._getRegisterValue(node.right.id);
    asm.push(new RegisterEmbed(regName, [this._getRegisterValue(node.id), leftReg, rightReg]));
    this._freeRegisters(node.left.id);
    this._freeRegisters(node.right.id);
  }

  _addLogicRegisterToAsm(node, asm) {
    switch(node.sign) {
      case tokens.sign_greater: {
        const leftReg = this._getRegisterValue(node.left.id);
        const rightReg = this._getRegisterValue(node.right.id);
        asm.push(new RegisterEmbed('slt', [this._getRegisterValue(node.id), rightReg, leftReg]));
        this._freeRegisters(node.left.id);
        this._freeRegisters(node.right.id);
        break;
      }
      case tokens.sign_lower: {
        const leftReg = this._getRegisterValue(node.left.id);
        const rightReg = this._getRegisterValue(node.right.id);
        asm.push(new RegisterEmbed('slt', [this._getRegisterValue(node.id), leftReg, rightReg]));
        this._freeRegisters(node.left.id);
        this._freeRegisters(node.right.id);
        break;
      }
      case tokens.sign_double_equal: {
        const leftReg = this._getRegisterValue(node.left.id);
        const rightReg = this._getRegisterValue(node.right.id);
        asm.push(new RegisterEmbed('beq', [rightReg, leftReg, 2]));
        asm.push(new RegisterEmbed('mov', [this._getRegisterValue(node.id), 0]));
        asm.push(new RegisterEmbed('jre', [1]));
        asm.push(new RegisterEmbed('mov', [this._getRegisterValue(node.id), 1]));
        this._freeRegisters(node.left.id);
        this._freeRegisters(node.right.id);
        break;
      }
      case tokens.sign_not_equal: {
        const leftReg = this._getRegisterValue(node.left.id);
        const rightReg = this._getRegisterValue(node.right.id);
        asm.push(new RegisterEmbed('benq', [rightReg, leftReg, 2]));
        asm.push(new RegisterEmbed('mov', [this._getRegisterValue(node.id), 0]));
        asm.push(new RegisterEmbed('jre', [1]));
        asm.push(new RegisterEmbed('mov', [this._getRegisterValue(node.id), 1]));
        this._freeRegisters(node.left.id);
        this._freeRegisters(node.right.id);
        break;
      }
      case tokens.sign_double_or: {
        const leftReg = this._getRegisterValue(node.left.id);
        const rightReg = this._getRegisterValue(node.right.id);

        const zeroReg = this._getEmptyRegister();
        const newRegLeft = this._getEmptyRegister();
        const newRegRight = this._getEmptyRegister();
        asm.push(new RegisterEmbed('mov', [zeroReg, 0]));
        asm.push(new RegisterEmbed('slt', [newRegLeft, zeroReg, leftReg]));
        asm.push(new RegisterEmbed('slt', [newRegRight, zeroReg, rightReg]));
        asm.push(new RegisterEmbed('or', [this._getRegisterValue(node.id), newRegLeft, newRegRight]));
        this.freeNonIDRegister(zeroReg);
        this.freeNonIDRegister(newRegLeft);
        this.freeNonIDRegister(newRegRight);
        this._freeRegisters(node.left.id);
        this._freeRegisters(node.right.id);
        break;
      }
      case tokens.sign_double_and: {
        const leftReg = this._getRegisterValue(node.left.id);
        const rightReg = this._getRegisterValue(node.right.id);
        const zeroReg = this._getEmptyRegister();
        const newRegLeft = this._getEmptyRegister();
        const newRegRight = this._getEmptyRegister();
        asm.push(new RegisterEmbed('mov', [zeroReg, 0]));
        asm.push(new RegisterEmbed('slt', [newRegLeft, zeroReg, leftReg]));
        asm.push(new RegisterEmbed('slt', [newRegRight, zeroReg, rightReg]));
        asm.push(new RegisterEmbed('and', [this._getRegisterValue(node.id), newRegLeft, newRegRight]));
        this.freeNonIDRegister(zeroReg);
        this.freeNonIDRegister(newRegLeft);
        this.freeNonIDRegister(newRegRight);
        this._freeRegisters(node.left.id);
        this._freeRegisters(node.right.id);
        break;
      }
    }
  }

  _addSpecialModDivArithmetics(mod = 'div', node, asm) {
    let regInstruction = 'mfhi'
    if(mod == 'div') {
      regInstruction = 'mflo'
    }
    const leftReg = this._getRegisterValue(node.left.id);
    const rightReg = this._getRegisterValue(node.right.id);
    asm.push(new RegisterEmbed('div', [leftReg, rightReg]));
    asm.push(new RegisterEmbed(regInstruction, [this._getRegisterValue(node.id)]));
    this._freeRegisters(node.left.id);
    this._freeRegisters(node.right.id);
  }

  toRegister_t(node, asm) {
    if(node.left == null && node.right == null) {
      asm.push(this.pushAssignationAsm(node));
      return node;
    }
    this.toRegister_t(node.left, asm);
    this.toRegister_t(node.right, asm);
    switch(node.sign) {
      case tokens.sign_plus: {
        this._addArithmeticRegisterToAsm('add', node, asm)
        break;
      }
      case tokens.sign_minus: {
        this._addArithmeticRegisterToAsm('sub', node, asm)
        break;
      }
      case tokens.sign_mul: {
        this._addArithmeticRegisterToAsm('mul', node, asm)
        break;
      }
      case tokens.sign_div: {
        this._addSpecialModDivArithmetics('div', node, asm)
        break;
      }
      case tokens.sign_mod: {
        this._addSpecialModDivArithmetics('mod', node, asm)
        break;
      }
      default: {
        this._addLogicRegisterToAsm(node, asm)
        break;
      }
    }
    return node;
  }

  create(expression) {
    this.registerIDs = {};
    const node = new ExpressionNode();
    this.root = node.parse(expression);
    return this.root;
  }
}

class ExpressionNode {
  constructor() {
    this.left = null;
    this.right = null;
    this.sign = null;
    this.value = null;
    this.id = nodeID++;
  }

  parse(expression) {
    return this.create_tree(expression, [0], 0, [[tokens.sign_double_and, tokens.sign_double_or],
                                                 [tokens.sign_greater, tokens.sign_lower, tokens.sign_double_equal, tokens.sign_not_equal],
                                                 [tokens.sign_plus, tokens.sign_minus],
                                                 [tokens.sign_mul, tokens.sign_div, tokens.sign_mod]]);
  }

  getNode(value, type = null) {
    const currentNode = new ExpressionNode();
    currentNode.value = value;
    currentNode.token = type;
    return currentNode;
  }

  nodeController(exp, index, operations) {
    if(exp[index[0]].token == tokens.sign_open_paranth) {
      index[0]++;
      const resultNode = this.create_tree(exp, index, 0, operations);
      index[0]++;
      return resultNode;
    }
    const node = this.getNode(exp[index[0]].value, exp[index[0]].token);
    index[0] += 1;
    return node;
  }

  get_function(expression, index, depth, operations) {
    if(depth == operations.length) {
      return this.nodeController(expression, index, operations);
    }
    return this.create_tree(expression, index, depth, operations);
  }

  create_tree(expression, index, depth, operations) {
    let parent = this.get_function(expression, index, depth + 1, operations);
    while(index[0] < expression.length && operations[depth].includes(expression[index[0]].token)) {
      const currentSign = expression[index[0]].token;
      index[0]++;
      const nextNode = this.get_function(expression, index, depth + 1, operations);
      const localParent = this.getNode(null);
      localParent.left = parent;
      localParent.right = nextNode;
      localParent.sign = currentSign;
      parent = localParent;
    }
    return parent;
  }
}

class Compiler {
  constructor(code) {
    this.code = code;
    this.errors = [];
    this.variables = new Variables();
    this.expressionTree = new ExpressionTree(this.variables);
    this.asm = []
    this.variableMemory = {};
    this.variableLoaderRegister = 0;
  }

  _isInitializationCorrect(code) {
    if(code.token !== 'initialization') {
      return false;
    }
    if(code.payload.length < 2) {
      this.errors.push("Error, initialization is wrongfully formatted!")
      return false;
    }
    return true;
  }

  _registerVariable(variableName) {
    if(this.variables.isVariableDefined(variableName)) {
      this.errors.push(`Error, variable "${variableName}" is already defined!`)
      return false;
    }
    this.variableMemory[variableName] = this.variables.getVariableMemory(variableName);
    return true;
  }

  _variableMemory(variableName) {
    return this.variables.getVariableMemory(variableName);
  }

  _registerExpression(expression, variableName) {
    this.expressionTree.create(expression)
    const asmIntructions = this.expressionTree.toRegister();
    for(let i = 0, c = asmIntructions.length; i < c; i++) {
      this.asm.push(asmIntructions[i]);
    }
    const resultRegister = this.expressionTree.getExpressionRegisterIndex(asmIntructions);
    if(resultRegister === null) {
      this.errors.push("Error in parsing expression");
      return false;
    }
    this.asm.push(new RegisterEmbed('mov', [`[${this._variableMemory(variableName)}]`, resultRegister])) // do to
    this.expressionTree.freeRegisterByNumber(resultRegister)
    return true;
  }

  _registerExpressionWithoutVariable(expression) {
    this.expressionTree.create(expression)
    const asmIntructions = this.expressionTree.toRegister();
    for(let i = 0, c = asmIntructions.length; i < c; i++) {
      this.asm.push(asmIntructions[i]);
    }
    return this.expressionTree.getExpressionRegisterIndex(asmIntructions);
  }

  _registerInitialization(code) {
    if(this._isInitializationCorrect(code)) {
      if(!this._registerVariable(code.payload[1].payload)) {
        return false;
      }
      if(code.payload.length == 3 && !this._registerExpression(code.payload[2].payload, code.payload[1].payload)) {
        return false;
      }
    }
    return true;
  }

  _isAssignationCorrect(code) {
    if(code.token !== 'assignation') {
      return false;
    }
    if(code.payload.length < 2) {
      this.errors.push("Error, assignation is wrongfully formatted!")
      return false;
    }
    return true;
  }

  _registerAssignation(code) {
    if(this._isAssignationCorrect(code)) {
      if(!this.variables.isVariableDefined(code.payload[0].payload)) {
        this.errors.push(`Error, variable "${code.payload[0].payload}" is undefined`)
        return false;
      }
      this._registerExpression(code.payload[1].payload, code.payload[0].payload)
    }
    return true;
  }

  _isConditionalCorrect(code) {
    if(code.token !== 'condition') {
      return false;
    }
    if(code.payload.length < 1) {
      this.errors.push("Error, conditional cannot be empty")
      return false;
    }
    return true;
  }

  _isLoopCorrect(code) {
    if(code.token !== 'for_loop') {
      return false;
    }
    if(code.payload.length < 3) {
      this.errors.push("Error, for loop should have 3 assignations")
      return false;
    }
    return true;
  }

  _registerForLoop(code) {
    if(this._isLoopCorrect(code)) {
      this._registerAssignation(code.payload[0]);
      const beforeForAddress = this.asm.length;
      const registerIndex = this._registerExpressionWithoutVariable(code.payload[1].payload)
      const ben = new RegisterEmbed('benq', []);
      this._addRegisterEmbed(ben)
      const currentPointer = this.asm.length;
      for(let i = 3; i < code.payload.length; i++) {
        if(!this._registerInitialization(code.payload[i])) {
          return false;
        }
        if(!this._registerAssignation(code.payload[i])) {
          return false;
        }
        if(!this._registerConditional(code.payload[i])) {
          return false;
        }
        if(!this._registerForLoop(code.payload[i])) {
          return false;
        }
      }
      this._registerAssignation(code.payload[2]);
      this._addRegisterEmbed(new RegisterEmbed('j', [beforeForAddress]))
      ben.params = [registerIndex, 1, this.asm.length - currentPointer]
    }
    return true;
  }

  _addRegisterEmbed(register) {
    this.asm.push(register)
  }

  _registerConditional(code) {
    if(this._isConditionalCorrect(code)) {
      const registerIndex = this._registerExpressionWithoutVariable(code.payload[0].payload)
      let equalReg = new RegisterEmbed('benq', [])
      this._addRegisterEmbed(equalReg)
      const currentPointer = this.asm.length;
      for(let i = 1; i < code.payload.length; i++) {
        if(!this._registerInitialization(code.payload[i])) {
          return false;
        }
        if(!this._registerAssignation(code.payload[i])) {
          return false;
        }
        if(!this._registerConditional(code.payload[i])) {
          return false;
        }
        if(!this._registerForLoop(code.payload[i])) {
          return false;
        }
      }
      equalReg.params = [registerIndex, 1, this.asm.length - currentPointer]
    }
    return true;
  }

  compile() {
    const code = this.code;
    for(let i = 0, c = code.length; i < c; i++) {
      if(!this._registerInitialization(code[i])) {
        break;
      }
      if(!this._registerAssignation(code[i])) {
        break;
      }
      if(!this._registerConditional(code[i])) {
        break;
      }
      if(!this._registerForLoop(code[i])) {
        break;
      }
    }
    if(this.errors.length) {
      return false;
    }
    return true;
  }
}

function compile(code) {
  return (new Parser(code)).compile();
}

function run(code) {
  return (new Parser(code)).run();
}