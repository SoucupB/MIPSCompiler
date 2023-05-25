const { Utils } = require('./Utils')

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
    return chr == '|' || chr == '-' || chr == '+' || chr == '*' || chr == '/' || chr == '%' || chr == '&';
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
    while(currentIndex[0] < str.length && this._isSign(str[currentIndex[0]])) {
      instructions.push(str[currentIndex[0]++])
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

  parseInstructions(str, index, toParse) {
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
          tokens = tokens.concat(this.expectExpression(str, newIndex))
          continue;
        }
        default: {
          break;
        }
      }
      if(!this._jump(str, newIndex, toParse[i])) {
        return false
      }
      tokens.push(toParse[i]);
    }
    index[0] = newIndex[0];
    console.log(tokens)
    return tokens;
  }

  parseInitialization(str, index) {
    let isExpression = this.expectInitialization(str, index);
    if(isExpression) {
      let toExpect = ['int', '$var', '=', '$expression', ';']
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
    return null;
  }

  expectExpression(str, index) {
    let instructions = [];
    this.expectExpression_t(str, index, instructions)
    return instructions;
  }

  parse() {
    let codePointer = [0];
    let response = [];
    while(codePointer[0] < this.code.length) {
      let tokens = this.parseInitialization(this.code, codePointer);
      console.log(JSON.stringify(tokens))
      if(!tokens) {
        return null;
      }
      response.push(tokens)
    }
    return this.expectExpression(this.code, codePointer)
  }
}

const codeToCompile1 = `
int ana = 5;
int vasile = 6;

int ionel;
int i;
for(i = 0; i < ana; i++) {
  ionel = ionel + vasile;
}
`

const codeToCompile2 = `
int b;
`

const parse = new Parser(codeToCompile2);
console.log(parse.parse());