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

  _freeRegisters(node_id) {
    if(!(node_id in this.registerIDs)) {
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

  _addRegisterToAsm(regName, node, asm) {
    const leftReg = this._getRegisterValue(node.left.id);
    const rightReg = this._getRegisterValue(node.right.id);
    asm.push(new RegisterEmbed(regName, [this._getRegisterValue(node.id), leftReg, rightReg]));
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
        this._addRegisterToAsm('add', node, asm)
        break;
      }
      case tokens.sign_minus: {
        this._addRegisterToAsm('sub', node, asm)
        break;
      }
      case tokens.sign_mul: {
        this._addRegisterToAsm('mul', node, asm)
        break;
      }
      case tokens.sign_div: {
        this._addRegisterToAsm('div', node, asm)
        break;
      }
    }
    return node;
  }

  create(expression) {
    this.root = this.root.parse(expression);
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
                                                 [tokens.sign_greater, tokens.sign_lower],
                                                 [tokens.sign_plus, tokens.sign_minus],
                                                 [tokens.sign_mul, tokens.sign_div]]);
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