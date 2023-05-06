class Utils {
  static _isAlphaNumericTokenCode(code) {
    if((code > 47 && code < 58) || // numeric (0-9)
      (code > 64 && code < 91) || // upper alpha (A-Z)
      (code > 96 && code < 123)) {
      return true;
    }
    return false;
  }

  _extractAlphaNumericToken(pointer, index) {
    let token = "";
    while (index < pointer.length && Utils._isAlphaNumericTokenCode(pointer.charCodeAt(index[0]))) {
      token += pointer[index[0]];
      index[0]++;
    }
    return token;
  }

  static _isBraketTokenCode(code) {
    if(code == 40 || code == 41) {
      return true;
    }
    return false;
  }

  static _iterateThroughNonTokens(string, index) {
    while(index[0] < string.length && (string[index[0]] == '\n' || string[index[0]] == '\t' || string[index[0]] == '\t\n' || string[index[0]] == ' ')) {
      index[0]++;
    }
  }
}

module.exports = Utils;