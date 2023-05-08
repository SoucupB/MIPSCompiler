const ExpressionTree = require('./ExpressionTree');
const { RegisterEmbed } = require('./Register');
const { tokens } = require('./Token')
const Compiler = require('./Compiler')

function areRegistersEqual(src, dst) {
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

function isNumber(number) {
  if (!isNaN(Number(number))) {
    return true
  }
  return false;
}

function createExpression(payload) {
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
      default: {
        const isNum = isNumber(payload[i]);
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

function createAssignationPayload(payloadData) {
  return {
    token: 'assignation',
    payload: [
      {
        token: tokens.variable,
        payload: payloadData[0]
      },
      {
        token: tokens.expression,
        payload: createExpression(payloadData.slice(-(payloadData.length - 1)))
      }
    ]
  }
}

function createInitializationPayload(payloadData) {
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
      payload: createExpression(expression)
    })
  }

  return payload
}

test('correct compilation v1', () => {
  const toCompile = [
    createInitializationPayload(['int7_t', 'yolo', '1', '+', '2']),
    createAssignationPayload(['yolo', '5', '+', '36'])
  ]
  const code = new Compiler(toCompile);
  code.compile()
  expect(areRegistersEqual(code.asm, [
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', [4, 2]),
    new RegisterEmbed('add', [5, 3, 4]),
    new RegisterEmbed('mov', ['[0]', 5]),
    new RegisterEmbed('mov', [3, 5]),
    new RegisterEmbed('mov', [4, 36]),
    new RegisterEmbed('add', [5, 3, 4]),
    new RegisterEmbed('mov', ['[0]', 5]),
  ])).toBe(true)
});

test('correct compilation v2', () => {
  const toCompile = [
    createInitializationPayload(['int7_t', 'a', '1', '+', '2', '*', '5', '*', '6']),
  ]
  const code = new Compiler(toCompile);
  code.compile()
  expect(areRegistersEqual(code.asm, [
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', [4, 2]),
    new RegisterEmbed('mov', [5, 5]),
    new RegisterEmbed('mul', [6, 4, 5]),
    new RegisterEmbed('mov', [4, 6]),
    new RegisterEmbed('mul', [5, 6, 4]),
    new RegisterEmbed('add', [4, 3, 5]),
    new RegisterEmbed('mov', ['[0]', 4]),
  ])).toBe(true)
});

test('correct compilation v3', () => {
  const toCompile = [
    createInitializationPayload(['int7_t', 'a', '1']),
    createInitializationPayload(['int7_t', 'b', '3']),
  ]
  const code = new Compiler(toCompile);
  code.compile()
  expect(areRegistersEqual(code.asm, [
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', ['[0]', 3]),
    new RegisterEmbed('mov', [3, 3]),
    new RegisterEmbed('mov', ['[1]', 3]),
  ])).toBe(true)
});

test('correct compilation v4', () => {
  const toCompile = [
    createInitializationPayload(['int7_t', 'a', '1']),
    createInitializationPayload(['int7_t', 'b']),
    createAssignationPayload(['b', '5'])
  ]
  const code = new Compiler(toCompile);
  code.compile()
  expect(areRegistersEqual(code.asm, [
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', ['[0]', 3]),
    new RegisterEmbed('mov', [3, 5]),
    new RegisterEmbed('mov', ['[1]', 3]),
  ])).toBe(true)
});

test('correct expression with variables', () => {
  const toCompile = [
    createInitializationPayload(['int7_t', 'a', '1']),
    createInitializationPayload(['int7_t', 'b', '1', '+', 'a']),
  ]
  const code = new Compiler(toCompile);
  code.compile()
  expect(areRegistersEqual(code.asm, [
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', ['[0]', 3]),
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', [4, '[0]']),
    new RegisterEmbed('add', [5, 3, 4]),
    new RegisterEmbed('mov', ['[1]', 5]),
  ])).toBe(true)
});

test('correct expression with variables v2', () => {
  const toCompile = [
    createInitializationPayload(['int7_t', 'a', '1']),
    createInitializationPayload(['int7_t', 'b', '3', '+', 'a']),
    createInitializationPayload(['int7_t', 'c', '3', '+', 'a', '*', 'b']),
    createInitializationPayload(['int7_t', 'd', '3', '+', 'a', '*', '(', 'b', '+', 'c', ')']),
  ]
  const code = new Compiler(toCompile);
  code.compile()
  expect(areRegistersEqual(code.asm, [
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', ['[0]', 3]),
    new RegisterEmbed('mov', [3, 3]),
    new RegisterEmbed('mov', [4, '[0]']),
    new RegisterEmbed('add', [5, 3, 4]),
    new RegisterEmbed('mov', ['[1]', 5]),

    
    new RegisterEmbed('mov', [3, 3]),
    new RegisterEmbed('mov', [4, '[0]']),
    new RegisterEmbed('mov', [5, '[1]']),
    new RegisterEmbed('mul', [6, 4, 5]),
    new RegisterEmbed('add', [4, 3, 6]),
    new RegisterEmbed('mov', ['[2]', 4]),

    new RegisterEmbed('mov', [3, 3]),
    new RegisterEmbed('mov', [4, '[0]']),
    new RegisterEmbed('mov', [5, '[1]']),
    new RegisterEmbed('mov', [6, '[2]']),

    new RegisterEmbed('add', [7, 5, 6]),
    new RegisterEmbed('mul', [5, 4, 7]),
    new RegisterEmbed('add', [4, 3, 5]),
    new RegisterEmbed('mov', ['[3]', 4]),
  ])).toBe(true)
});