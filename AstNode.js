const { tokens, newRowExpectation } = require('./Token')
const Utils = require('./Utils')

class AstNode {
  constructor(tokenType, variables = null) {
    this.tokenType = tokenType;
    this.children = [];
    this.variables = variables;
  }

  _parseCode_t(currentNode, string, currentTokenTree, index) {
    let cpyIndex = index;
    const alphaToken = Utils._extractAlphaNumericToken(string, [cpyIndex]);
    if(currentTokenTree && alphaToken in currentTokenTree) {
      const node = new AstNode(alphaToken, this.variables);
      currentNode.children.push(node);
      this._parseCode_t(node, string, currentTokenTree[alphaToken], cpyIndex);
    }
  }

  parseCode(string) {
    this._parseCode_t(this, string, newRowExpectation['code_segment'], 0);
    console.log(this)
  }
}

module.exports = AstNode;