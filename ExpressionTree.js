const { example, expressionExample } = require('./Example')
const { tokens } = require('./Token')

class ExpressionTree {
  constructor() {
    this.root = new ExpressionNode();
  }

  create(expression) {
    return this.root.parse(expression);
  }
}

class ExpressionNode {
  constructor() {
    this.left = null;
    this.right = null;
    this.sign = null;
    this.value = null;
  }

  parse(expression) {
    return this.parse_sums_t(expression, 0);
  }

  nodeController(exp, index) {
    if(index + 1 < exp.length && exp[index + 1].token == tokens.sign_mul) {
      return this.parse_mulls_t(exp, index);
    }
    return this.getNode(exp[index].value);
  }

  getNode(value) {
    const currentNode = new ExpressionNode();
    currentNode.value = value
    return currentNode;
  }

  parse_mulls_t(expression, index) {
    let parent = this.getNode(expression[index].value);
    for(let i = index + 2; i < expression.length; i += 2) {
      if(expression[i - 1].token != tokens.sign_mul) {
        return parent;
      }
      const nextNode = this.getNode(expression[i].value);
      const localParent = this.getNode(null);
      localParent.left = parent;
      localParent.right = nextNode;
      localParent.sign = expression[i - 1].token;
      parent = localParent;
    }
    return parent;
  }

  parse_sums_t(expression, index) {
    let parent = this.nodeController(expression, index);
    for(let i = index + 2; i < expression.length; i += 2) {
      const nextNode = this.nodeController(expression, i);
      const localParent = this.getNode(null);
      localParent.left = parent;
      localParent.right = nextNode;
      localParent.sign = expression[i - 1].token;
      parent = localParent;
    }
    return parent;
  }
}

const expTree = new ExpressionTree();
console.log(expTree.create(expressionExample.payload))