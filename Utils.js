// if((code > 47 && code < 58) || // numeric (0-9)
//   (code > 64 && code < 91) || // upper alpha (A-Z)
//   (code > 96 && code < 123) ||
//   code == 95) {
//   return true;
// }
// return false;

class Utils {
  static _iterateThroughNonTokensSeparators(string, index) {
    while(index[0] < string.length && (string[index[0]] == '\n' || string[index[0]] == '\t' || string[index[0]] == '\t\n' || string[index[0]] == ' ')) {
      index[0]++;
    }
  }

  static _equals(a, b, index, expectedIndex) {
    return index < a.length && expectedIndex < b.length && a[index] == b[expectedIndex];
  }

  static _toTest(token, expected) {
    return token === expected;
  }

  static expectString(string, expected, index) {
    let expectedIndex = 0;
    Utils._iterateThroughNonTokensSeparators(string, index);
    let i = index[0];
    let toCompare = Utils._equals;
    let testCondition = Utils._toTest;
    let token = "";
    if(expected.type == 'dynamic') {
      toCompare = expected.comparer;
      testCondition = expected.testCondition;
    }
    while(toCompare(string, expected.payload, i, expectedIndex)) {
      token += string[i];
      i++;
    }
    if(testCondition(token, expected.payload)) {
      index[0] = i;
      return true;
    }
    return false;
  }
}

module.exports = Utils;