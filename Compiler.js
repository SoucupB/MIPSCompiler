const ExpressionTree = require('./ExpressionTree');
const { RegisterEmbed } = require('./Register');
const { tokens } = require('./Token')
const { example, expressionExample } = require('./Example')
const Variables = require('./Variables')

class Compiler {
  constructor(code) {
    this.code = code;
    this.errors = [];
    this.variables = new Variables();
    this.expressionTree = new ExpressionTree();
    this.asm = []
  }

  _isInitializationCorrect(code) {
    if(code.token === 'initialization') {
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
    this.variables.defineVariable(variableName);
    return true;
  }

  compile() {
    const code = this.code;
    for(let i = 0, c = code.length; i < c; i++) {
      if(this._isInitializationCorrect(code[i])) {
        if(!this._registerVariable(code[i][1].payload)) {
          break;
        }
      }
    }
    if(this.errors.length) {
      return false;
    }
    return true;
  }
}

const code = new Compiler(example);