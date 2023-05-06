const Utils = require('./Utils');

class MipsAstParser {
  construct(config) {
    this.config = config;
  }

  _extractToken(pointer, index) {
    let token = "";
    while (index < pointer.length && Utils._isTokenCode(pointer.charCodeAt(i))) {
      token += pointer[i];
    }
    return token;
  }

  compile() {
    return 'test'
  }
}

module.exports = MipsAstParser