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
    payload: [
      {
        token: tokens.constant_token,
        value: 5
      },
    ]
  }
  const expTree = new ExpressionTree();
  expTree.create(expression.payload)
  const asm = expTree.toRegister();
  expect(areRegistersEqual(asm, [
    new RegisterEmbed('mov', [3, 5]),
  ])).toBe(true)
  expect(expTree.getExpressionRegisterIndex(asm) == 2)
});