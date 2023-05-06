class Utils {
  static _isTokenCode(code) {
    if((code > 47 && code < 58) || // numeric (0-9)
      (code > 64 && code < 91) || // upper alpha (A-Z)
      (code > 96 && code < 123)) {
      return true;
    }
    return false;
  }
}

module.exports = Utils;