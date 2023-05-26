const ExpressionTree = require('./ExpressionTree');
const { RegisterEmbed } = require('./Register');
const { tokens } = require('./Token')
const { Utils } = require('./Utils')

test('check if its generates correct expression tree', () => {
  const expression = {
    token: tokens.expression,
    payload: Utils.createExpression(['5', '*', '14', '+', '36', '*', '23'])
  }
  const expTree = new ExpressionTree();
  expTree.create(expression.payload)
  const asm = expTree.toRegister();
  expect(Utils.areRegistersEqual(asm, [
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
    payload: Utils.createExpression(['(', '5', '*', '14', ')'])
  }
  const expTree = new ExpressionTree();
  expTree.create(expression.payload)
  const asm = expTree.toRegister();
  expect(Utils.areRegistersEqual(asm, [
    new RegisterEmbed('mov', [3, 5]),
    new RegisterEmbed('mov', [4, 14]),
    new RegisterEmbed('mul', [5, 3, 4])
  ])).toBe(true)
  expect(expTree.getExpressionRegisterIndex(asm) == 2)
});

test('check if it generates simple trees v1', () => {
  const expression = {
    token: tokens.expression,
    payload: Utils.createExpression(['(', '5', '*', '14', ')'])
  }
  const expTree = new ExpressionTree();
  expTree.create(expression.payload)
  const asm = expTree.toRegister()
  expect(Utils.areRegistersEqual(asm, [
    new RegisterEmbed('mov', [3, 5]),
    new RegisterEmbed('mov', [4, 14]),
    new RegisterEmbed('mul', [5, 3, 4])
  ])).toBe(true)
  expect(expTree.getExpressionRegisterIndex(asm) == 2)
});

test('check if it generates simple trees v2', () => {
  const expression = {
    token: tokens.expression,
    payload: Utils.createExpression(['(', '5', '+', '14', ')', '*', '7'])
  }
  const expTree = new ExpressionTree();
  expTree.create(expression.payload)
  const asm = expTree.toRegister()
  expect(Utils.areRegistersEqual(asm, [
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
    payload: Utils.createExpression(['5'])
  }
  const expTree = new ExpressionTree();
  expTree.create(expression.payload)
  const asm = expTree.toRegister();
  expect(Utils.areRegistersEqual(asm, [
    new RegisterEmbed('mov', [3, 5]),
  ])).toBe(true)
  expect(expTree.getExpressionRegisterIndex(asm) == 2)
});

test('generate if expression', () => {
  const expression = {
    token: tokens.expression,
    payload: Utils.createExpression(['5', '+', '12', '==', '17', '&&', '1', '+', '1', '==', '2'])
  }
  const expTree = new ExpressionTree();
  expTree.create(expression.payload)
  const asm = expTree.toRegister();
  // expect(Utils.areRegistersEqual(asm, [
  //   new RegisterEmbed('mov', [3, 5]),
  //   new RegisterEmbed('mov', [4, 12]),
  //   new RegisterEmbed('add', [5, 3, 4]),
  //   new RegisterEmbed('mov', [3, 17]),
  //   new RegisterEmbed('beq', [3, 5, 2]),
  //   new RegisterEmbed('mov', [4, 0]),
  //   new RegisterEmbed('jre', [1]),
  //   new RegisterEmbed('mov', [4, 1]),
  //   new RegisterEmbed('mov', [3, 1]),
  //   new RegisterEmbed('mov', [5, 1]),
  //   new RegisterEmbed('add', [6, 3, 5]),
  //   new RegisterEmbed('mov', [3, 2]),
  //   new RegisterEmbed('beq', [3, 6, 2]),
  //   new RegisterEmbed('mov', [5, 0]),
  //   new RegisterEmbed('jre', [1]),
  //   new RegisterEmbed('mov', [5, 1]),
  //   new RegisterEmbed('mov', [0, 0]),
  //   new RegisterEmbed('beq', [4, 0, 3]),
  //   new RegisterEmbed('beq', [5, 0, 2]),
  //   new RegisterEmbed('mov', [3, 1]),
  //   new RegisterEmbed('jre', [1]),
  //   new RegisterEmbed('mov', [3, 0]),
  // ])).toBe(true)
});