const ExpressionTree = require('./ExpressionTree');
const { RegisterEmbed } = require('./Register');
const { tokens } = require('./Token')

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

test('check if its generates correct expression tree', () => {
  const expression = {
    token: tokens.expression,
    payload: createExpression(['5', '*', '14', '+', '36', '*', '23'])
  }
  const expTree = new ExpressionTree();
  expTree.create(expression.payload)
  const asm = expTree.toRegister();
  expect(areRegistersEqual(asm, [
    new RegisterEmbed('mov', [3, 5]),
    new RegisterEmbed('mov', [4, 14]),
    new RegisterEmbed('mul', [5, 3, 4]),
    new RegisterEmbed('mov', [3, 36]),
    new RegisterEmbed('mov', [4, 23]),
    new RegisterEmbed('mul', [6, 3, 4]),
    new RegisterEmbed('add', [3, 5, 6]),
  ])).toBe(true)
  expect(expTree.getExpressionRegisterIndex(asm) == 0)
});

test('check if it generates simple trees', () => {
  const expression = {
    token: tokens.expression,
    payload: createExpression(['(', '5', '*', '14', ')'])
  }
  const expTree = new ExpressionTree();
  expTree.create(expression.payload)
  const asm = expTree.toRegister();
  expect(areRegistersEqual(asm, [
    new RegisterEmbed('mov', [3, 5]),
    new RegisterEmbed('mov', [4, 14]),
    new RegisterEmbed('mul', [5, 3, 4])
  ])).toBe(true)
  expect(expTree.getExpressionRegisterIndex(asm) == 2)
});

test('check if it generates simple trees v1', () => {
  const expression = {
    token: tokens.expression,
    payload: createExpression(['(', '5', '*', '14', ')'])
  }
  const expTree = new ExpressionTree();
  expTree.create(expression.payload)
  const asm = expTree.toRegister()
  expect(areRegistersEqual(asm, [
    new RegisterEmbed('mov', [3, 5]),
    new RegisterEmbed('mov', [4, 14]),
    new RegisterEmbed('mul', [5, 3, 4])
  ])).toBe(true)
  expect(expTree.getExpressionRegisterIndex(asm) == 2)
});

test('check if it generates simple trees v2', () => {
  const expression = {
    token: tokens.expression,
    payload: createExpression(['(', '5', '+', '14', ')', '*', '7'])
  }
  const expTree = new ExpressionTree();
  expTree.create(expression.payload)
  const asm = expTree.toRegister()
  expect(areRegistersEqual(asm, [
    new RegisterEmbed('mov', [3, 5]),
    new RegisterEmbed('mov', [4, 14]),
    new RegisterEmbed('add', [5, 3, 4]),
    new RegisterEmbed('mov', [3, 7]),
    new RegisterEmbed('mul', [4, 5, 3])
  ])).toBe(true)
  expect(expTree.getExpressionRegisterIndex(asm) == 1)
});

test('generate 1 node tree', () => {
  const expression = {
    token: tokens.expression,
    payload: createExpression(['5'])
  }
  const expTree = new ExpressionTree();
  expTree.create(expression.payload)
  const asm = expTree.toRegister();
  expect(areRegistersEqual(asm, [
    new RegisterEmbed('mov', [3, 5]),
  ])).toBe(true)
  expect(expTree.getExpressionRegisterIndex(asm) == 2)
});