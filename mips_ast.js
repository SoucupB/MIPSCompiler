const Utils = require('./Utils');
const AstNode = require('./AstNode');
const { tokens, newRowExpectation } = require('./Token')
const Variables = require('./Variables')

class MipsAstParser {
  constructor(config) {
    this.config = config;
    this.AstNode = new AstNode('code_segment', new Variables());
  }

  compile() {
    this.AstNode.parseCode(this.config.code);
    return 'test'
  }
}

module.exports = MipsAstParser