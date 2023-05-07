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
    this.variableMemory = {};
    this.variableLoaderRegister = 0;
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
    this.variableMemory[variableName] = this.variables.getVariableMemory(variableName);
    return true;
  }

  _variableMemory(variableName) {
    return this.variables.getVariableMemory(variableName);
  }

  _registerExpression(expression, variableName) {
    if(code.payload.length === 3) {
      this.expressionTree.create(expression)
      const asmIntructions = this.expressionTree.toRegister();
      for(let i = 0, c = asmIntructions.length; i < c; i++) {
        this.asm.push(asmIntructions[i]);
      }
      const resultRegister = this.expressionTree.getExpressionRegisterIndex();
      if(resultRegister === null) {
        this.errors.push("Error in parsing expression");
        return false;
      }
      this.asm.push(new RegisterEmbed('mov', [`[${this._variableMemory(variableName)}]`, resultRegister]))
      return true;
    }
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