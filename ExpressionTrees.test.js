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

test('check if its generates correct expression tree', () => {
  const expression = {
    token: tokens.expression,
    payload: [
      {
        token: tokens.constant_token,
        value: 5
      },
      {
        token: tokens.sign_mul,
      },
      {
        token: tokens.constant_token,
        value: 14
      },
      {
        token: tokens.sign_plus,
      },
      {
        token: tokens.constant_token,
        value: 36
      },
      {
        token: tokens.sign_mul,
      },
      {
        token: tokens.constant_token,
        value: 23
      },
    ]
  }
  const expTree = new ExpressionTree();
  expTree.create(expression.payload)
  expect(areRegistersEqual(expTree.toRegister(), [
    new RegisterEmbed('mov', [0, 5]),
    new RegisterEmbed('mov', [1, 14]),
    new RegisterEmbed('mul', [2, 0, 1]),
    new RegisterEmbed('mov', [0, 36]),
    new RegisterEmbed('mov', [1, 23]),
    new RegisterEmbed('mul', [3, 0, 1]),
    new RegisterEmbed('add', [0, 2, 3]),
  ])).toBe(true)
  expect(expTree.getExpressionRegisterIndex() == 0)
});

test('check if it generates simple trees', () => {
  const expression = {
    token: tokens.expression,
    payload: [
      {
        token: tokens.constant_token,
        value: 5
      },
      {
        token: tokens.sign_mul,
      },
      {
        token: tokens.constant_token,
        value: 14
      }
    ]
  }
  const expTree = new ExpressionTree();
  expTree.create(expression.payload)
  expect(areRegistersEqual(expTree.toRegister(), [
    new RegisterEmbed('mov', [0, 5]),
    new RegisterEmbed('mov', [1, 14]),
    new RegisterEmbed('mul', [2, 0, 1])
  ])).toBe(true)
  expect(expTree.getExpressionRegisterIndex() == 2)
});

test('check if it generates simple trees v1', () => {
  const expression = {
    token: tokens.expression,
    payload: [
      {
        token: tokens.sign_open_paranth
      },
      {
        token: tokens.constant_token,
        value: 5
      },
      {
        token: tokens.sign_mul,
      },
      {
        token: tokens.constant_token,
        value: 14
      },
      {
        token: tokens.sign_close_paranth
      },
    ]
  }
  const expTree = new ExpressionTree();
  expTree.create(expression.payload)
  expect(areRegistersEqual(expTree.toRegister(), [
    new RegisterEmbed('mov', [0, 5]),
    new RegisterEmbed('mov', [1, 14]),
    new RegisterEmbed('mul', [2, 0, 1])
  ])).toBe(true)
  expect(expTree.getExpressionRegisterIndex() == 2)
});

test('check if it generates simple trees v2', () => {
  const expression = {
    token: tokens.expression,
    payload: [
      {
        token: tokens.sign_open_paranth
      },
      {
        token: tokens.constant_token,
        value: 5
      },
      {
        token: tokens.sign_plus,
      },
      {
        token: tokens.constant_token,
        value: 14
      },
      {
        token: tokens.sign_close_paranth
      },
      {
        token: tokens.sign_mul,
      },
      {
        token: tokens.constant_token,
        value: 7
      },
    ]
  }
  const expTree = new ExpressionTree();
  expTree.create(expression.payload)
  expect(areRegistersEqual(expTree.toRegister(), [
    new RegisterEmbed('mov', [0, 5]),
    new RegisterEmbed('mov', [1, 14]),
    new RegisterEmbed('add', [2, 0, 1]),
    new RegisterEmbed('mov', [0, 7]),
    new RegisterEmbed('mul', [1, 2, 0])
  ])).toBe(true)
  expect(expTree.getExpressionRegisterIndex() == 1)
});