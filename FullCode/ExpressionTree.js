const { tokens } = require('./Token')
const { Register, RegisterEmbed } = require('./Register')

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

module.exports = ExpressionTree;