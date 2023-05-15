const ExpressionTree = require('./ExpressionTree');
const { RegisterEmbed } = require('./Register');
const { tokens } = require('./Token')
const Compiler = require('./Compiler')
const { Utils } = require('./Utils')

test('correct compilation v1', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int7_t', 'yolo', '1', '+', '2']),
    Utils.createAssignationPayload(['yolo', '5', '+', '36'])
  ]
  const code = new Compiler(toCompile);
  code.compile()
  expect(Utils.areRegistersEqual(code.asm, [
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
    Utils.createInitializationPayload(['int7_t', 'a', '1', '+', '2', '*', '5', '*', '6']),
  ]
  const code = new Compiler(toCompile);
  code.compile()
  expect(Utils.areRegistersEqual(code.asm, [
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
    Utils.createInitializationPayload(['int7_t', 'a', '1']),
    Utils.createInitializationPayload(['int7_t', 'b', '3']),
  ]
  const code = new Compiler(toCompile);
  code.compile()
  expect(Utils.areRegistersEqual(code.asm, [
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', ['[0]', 3]),
    new RegisterEmbed('mov', [3, 3]),
    new RegisterEmbed('mov', ['[1]', 3]),
  ])).toBe(true)
});

test('correct compilation v4', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int7_t', 'a', '1']),
    Utils.createInitializationPayload(['int7_t', 'b']),
    Utils.createAssignationPayload(['b', '5'])
  ]
  const code = new Compiler(toCompile);
  code.compile()
  expect(Utils.areRegistersEqual(code.asm, [
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', ['[0]', 3]),
    new RegisterEmbed('mov', [3, 5]),
    new RegisterEmbed('mov', ['[1]', 3]),
  ])).toBe(true)
});

test('correct expression with variables', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int7_t', 'a', '1']),
    Utils.createInitializationPayload(['int7_t', 'b', '1', '+', 'a']),
  ]
  const code = new Compiler(toCompile);
  code.compile()
  expect(Utils.areRegistersEqual(code.asm, [
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
    Utils.createInitializationPayload(['int7_t', 'a', '1']),
    Utils.createInitializationPayload(['int7_t', 'b', '3', '+', 'a']),
    Utils.createInitializationPayload(['int7_t', 'c', '4', '+', 'a', '*', 'b']),
    Utils.createInitializationPayload(['int7_t', 'd', '5', '+', 'a', '*', '(', 'b', '+', 'c', ')']),
  ]
  const code = new Compiler(toCompile);
  code.compile()
  expect(Utils.areRegistersEqual(code.asm, [
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', ['[0]', 3]),
    new RegisterEmbed('mov', [3, 3]),
    new RegisterEmbed('mov', [4, '[0]']),
    new RegisterEmbed('add', [5, 3, 4]),
    new RegisterEmbed('mov', ['[1]', 5]),

    new RegisterEmbed('mov', [3, 4]),
    new RegisterEmbed('mov', [4, '[0]']),
    new RegisterEmbed('mov', [5, '[1]']),
    new RegisterEmbed('mul', [6, 4, 5]),
    new RegisterEmbed('add', [4, 3, 6]),
    new RegisterEmbed('mov', ['[2]', 4]),

    new RegisterEmbed('mov', [3, 5]),
    new RegisterEmbed('mov', [4, '[0]']),
    new RegisterEmbed('mov', [5, '[1]']),
    new RegisterEmbed('mov', [6, '[2]']),

    new RegisterEmbed('add', [7, 5, 6]),
    new RegisterEmbed('mul', [5, 4, 7]),
    new RegisterEmbed('add', [4, 3, 5]),
    new RegisterEmbed('mov', ['[3]', 4]),
  ])).toBe(true)
});

test('conditional expression', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int7_t', 'a', '1']),
    Utils.createInitializationPayload(['int7_t', 'c', '1']),
    Utils.createConditionalPayload(Utils.createExpression(['1', '+', '3', '==', '2']), [
      Utils.createInitializationPayload(['int7_t', 'b', '1']),
      Utils.createAssignationPayload(['c', 'b', '+', '2'])
    ]),
    Utils.createInitializationPayload(['int7_t', 'd', '5', '+', 'c'])
  ]
  // console.log(JSON.stringify(toCompile, null, "  "))
  const code = new Compiler(toCompile);
  code.compile()
  console.log(code.asm)
  // expect(Utils.areRegistersEqual(code.asm, [
  //   new RegisterEmbed('mov', [3, 1]),
  //   new RegisterEmbed('mov', ['[0]', 3]),
  //   new RegisterEmbed('mov', [3, 3]),
  //   new RegisterEmbed('mov', [4, '[0]']),
  //   new RegisterEmbed('add', [5, 3, 4]),
  //   new RegisterEmbed('mov', ['[1]', 5]),

  //   new RegisterEmbed('mov', [3, 4]),
  //   new RegisterEmbed('mov', [4, '[0]']),
  //   new RegisterEmbed('mov', [5, '[1]']),
  //   new RegisterEmbed('mul', [6, 4, 5]),
  //   new RegisterEmbed('add', [4, 3, 6]),
  //   new RegisterEmbed('mov', ['[2]', 4]),

  //   new RegisterEmbed('mov', [3, 5]),
  //   new RegisterEmbed('mov', [4, '[0]']),
  //   new RegisterEmbed('mov', [5, '[1]']),
  //   new RegisterEmbed('mov', [6, '[2]']),

  //   new RegisterEmbed('add', [7, 5, 6]),
  //   new RegisterEmbed('mul', [5, 4, 7]),
  //   new RegisterEmbed('add', [4, 3, 5]),
  //   new RegisterEmbed('mov', ['[3]', 4]),
  // ])).toBe(true)
});