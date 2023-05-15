// if((code > 47 && code < 58) || // numeric (0-9)
//   (code > 64 && code < 91) || // upper alpha (A-Z)
//   (code > 96 && code < 123) ||
//   code == 95) {
//   return true;
// }
// return false;
const { tokens } = require('./Token')

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

  static isNumber(number) {
    if (!isNaN(Number(number))) {
      return true
    }
    return false;
  }
  
  static createExpression(payload) {
    let response = [];
    for(let i = 0; i < payload.length; i++) {
      switch(payload[i]) {
        case '+': {
          response.push({
            token: tokens.sign_plus
          })
          break;
        }
        case '-': {
          response.push({
            token: tokens.sign_minus
          })
          break;
        }
        case '*': {
          response.push({
            token: tokens.sign_mul
          })
          break;
        }
        case '/': {
          response.push({
            token: tokens.sign_div
          })
          break;
        }
        case '(': {
          response.push({
            token: tokens.sign_open_paranth
          })
          break;
        }
        case ')': {
          response.push({
            token: tokens.sign_close_paranth
          })
          break;
        }
        case '&&': {
          response.push({
            token: tokens.sign_double_and
          })
          break;
        }
        case '||': {
          response.push({
            token: tokens.sign_double_or
          })
          break;
        }
        case '>': {
          response.push({
            token: tokens.sign_greater
          })
          break;
        }
        case '<': {
          response.push({
            token: tokens.sign_lower
          })
          break;
        }
        case '==': {
          response.push({
            token: tokens.sign_double_equal
          })
          break;
        }
        default: {
          const isNum = Utils.isNumber(payload[i]);
          response.push({
            token: isNum ? tokens.constant_token : tokens.variable,
            value: isNum ? parseInt(payload[i]) : payload[i]
          })
          break;
        }
      }
    }
    return response;
  }

  static areRegistersEqual(src, dst) {
    if(src.length !== dst.length) {
      return false;
    }
    for(let i = 0; i < src.length; i++) {
      if(src[i].type !== dst[i].type || JSON.stringify(src[i].params) !== JSON.stringify(dst[i].params)) {
        return false;
      }
    }
    return true;
  }

  static createAssignationPayload(payloadData) {
    return {
      token: 'assignation',
      payload: [
        {
          token: tokens.variable,
          payload: payloadData[0]
        },
        {
          token: tokens.expression,
          payload: Utils.createExpression(payloadData.slice(-(payloadData.length - 1)))
        }
      ]
    }
  }

  static createConditionalPayload(condictionExpression, instructions) {
    const payload = {
      token: 'condition',
      payload: []
    };
    if(condictionExpression) {
      payload.payload.push({
        token: tokens.expression,
        payload: condictionExpression
      })
    }
    for(let i = 0; i < instructions.length; i++) {
      payload.payload.push(instructions[i])
    }
    return payload
  }
  
  static createInitializationPayload(payloadData) {
    const payload = {
      token: 'initialization',
      payload: [
        {
          token: tokens.data_type,
          payload: payloadData[0]
        },
        {
          token: tokens.variable,
          payload: payloadData[1]
        },
      ]
    };
    const expression = payloadData.slice(-(payloadData.length - 2));
    if(payloadData.length > 2) {
      payload.payload.push({
        token: tokens.expression,
        payload: Utils.createExpression(expression)
      })
    }
  
    return payload
  }
}

module.exports = { Utils };