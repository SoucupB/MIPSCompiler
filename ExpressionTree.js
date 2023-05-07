const { tokens } = require('./Token')
const { Register, RegisterEmbed } = require('./Register')

let nodeID = 0;

class ExpressionTree {
  constructor() {
    this.root = new ExpressionNode();
    this.registers = new Register();
    this.asm = [];
    this.registerIDs = {};
  }

  _getRegisterValue(node) {
    if(node.id in this.registerIDs) {
      return this.registerIDs[node.id];
    }
    const newReg = this.registers.getEmptyRegister();
    this.registerIDs[node.id] = newReg
    return newReg;
  }

  _freeRegisters(node) {
    if(!(node.id in this.registerIDs)) {
      return ;
    }
    const currentReg = this.registerIDs[node.id];
    delete this.registerIDs[node.id];
    this.registers.freeRegister(currentReg);
  }

  toRegister() {
    this.toRegister_t(this.root);
    return this.asm;
  }

  getExpressionRegisterIndex() {
    if(!this.asm.length) {
      return null;
    }
    return this.asm[this.asm.length - 1].params[0];
  }

  toRegister_t(node) {
    if(node.left == null && node.right == null) {
      return node;
    }
    const left = this.toRegister_t(node.left);
    if(left.value) {
      this.asm.push(new RegisterEmbed('mov', [this._getRegisterValue(left), left.value]));
    }
    const right = this.toRegister_t(node.right);
    if(right.value) {
      this.asm.push(new RegisterEmbed('mov', [this._getRegisterValue(right), right.value]));
    }
    switch(node.sign) {
      case tokens.sign_plus: {
        const leftReg = this._getRegisterValue(left);
        const rightReg = this._getRegisterValue(right);
        this.asm.push(new RegisterEmbed('add', [this._getRegisterValue(node), leftReg, rightReg]));
        this._freeRegisters(left);
        this._freeRegisters(right);
        break;
      }
      case tokens.sign_minus: {
        const leftReg = this._getRegisterValue(left);
        const rightReg = this._getRegisterValue(right);
        this.asm.push(new RegisterEmbed('sub', [this._getRegisterValue(node), leftReg, rightReg]));
        this._freeRegisters(left);
        this._freeRegisters(right);
        break;
      }
      case tokens.sign_mul: {
        const leftReg = this._getRegisterValue(left);
        const rightReg = this._getRegisterValue(right);
        this.asm.push(new RegisterEmbed('mul', [this._getRegisterValue(node), leftReg, rightReg]));
        this._freeRegisters(left);
        this._freeRegisters(right);
        break;
      }
      case tokens.sign_div: {
        const leftReg = this._getRegisterValue(left);
        const rightReg = this._getRegisterValue(right);
        this.asm.push(new RegisterEmbed('div', [this._getRegisterValue(node), leftReg, rightReg]));
        this._freeRegisters(left);
        this._freeRegisters(right);
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
    return this.parse_sums_t(expression, [0]);
  }

  nodeController(exp, index) {
    if(exp[index[0]].token == tokens.sign_open_paranth) {
      index[0]++;
      const resultNode = this.parse_sums_t(exp, index);
      index[0]++;
      return resultNode;
    }
    const node = this.getNode(exp[index[0]].value);
    index[0] += 1;
    return node;
  }

  getNode(value) {
    const currentNode = new ExpressionNode();
    currentNode.value = value
    return currentNode;
  }

  parse_mulls_t(expression, index) {
    let parent = this.nodeController(expression, index);
    while(index[0] < expression.length && (expression[index[0]].token == tokens.sign_mul || expression[index[0]].token == tokens.sign_div)) {
      const currentSign = expression[index[0]].token;
      index[0]++;
      const nextNode = this.nodeController(expression, index);
      const localParent = this.getNode(null);
      localParent.left = parent;
      localParent.right = nextNode;
      localParent.sign = currentSign;
      parent = localParent;
    }
    return parent;
  }

  parse_sums_t(expression, index) {
    let parent = this.parse_mulls_t(expression, index);
    while(index[0] < expression.length && (expression[index[0]].token == tokens.sign_plus || expression[index[0]].token == tokens.sign_minus)) {
      const currentSign = expression[index[0]].token;
      index[0]++;
      const nextNode = this.parse_mulls_t(expression, index);
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