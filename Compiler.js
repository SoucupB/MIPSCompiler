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

  compile() {
    const code = this.code;
    for(let i = 0, c = code.length; i < c; i++) {
      if(!this._registerInitialization(code[i])) {
        break;
      }
      if(!this._registerAssignation(code[i])) {
        break;
      }
    }
    if(this.errors.length) {
      return false;
    }
    return true;
  }
}

module.exports = Compiler;