const { tokens, newRowExpectation } = require('./Token')
const Utils = require('./Utils')

class AstNode {
  constructor(tokenType) {
    this.tokenType = tokenType;
    this.children = [];
  }

  _parseCode_t(string, currentTokenTree, index) {
    for(let i = 0, c = currentTokenTree.length; i < c; i++) {
      let cpyIndex = index;
      const alphaToken = Utils._extractAlphaNumericToken(string, [cpyIndex]);
      if()
    }
  }

  parseCode(string) {
    this._parseCode_t(string, newRowExpectation['code_segment'], 0);
  }
}