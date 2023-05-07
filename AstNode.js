const { tokens, newRowExpectation, _ } = require('./Token')
const Utils = require('./Utils')

class AstNode {
  constructor(tokenType, variables = null) {
    this.tokenType = tokenType;
    this.children = [];
    this.variables = variables;
    this.payload = null;
  }

  isUndefinedVariable(token) {
    return this.variables.isVariableUndefined(token)
  }

  _parseCode_t(currentNode, string, currentTokenTree, index) {
    let cpyIndex = index;
    const alphaToken = Utils._extractAlphaNumericToken(string, cpyIndex);
    if(currentTokenTree && alphaToken in currentTokenTree) {
      const node = new AstNode(alphaToken, this.variables);
      currentNode.children.push(node);
      this._parseCode_t(node, string, currentTokenTree[alphaToken], cpyIndex);
      return ;
    }
    if(this.isUndefinedVariable(alphaToken)) {
      const tokenType = 'undefined_variable'
      const node = new AstNode(tokenType, this.variables);
      node.payload = alphaToken;
      currentNode.children.push(node);
      if(tokenType in currentTokenTree) {
        this._parseCode_t(node, string, currentTokenTree[tokenType], cpyIndex);
      }
      return ;
    }
    const nonAlphaToken = Utils._extractNonAlphaNumericToken(string, cpyIndex);
    if(currentTokenTree && alphaToken in currentTokenTree) {
      console.log(nonAlphaToken)
    }
  }

  parseCode(string) {
    this._parseCode_t(this, string, newRowExpectation['code_segment'], [0]);
    console.log(this.children[0])
  }
}

module.exports = AstNode;