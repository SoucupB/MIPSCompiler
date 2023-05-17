const ExpressionTree = require('./ExpressionTree');
const { Register, RegisterEmbed, RegistersEmbed } = require('./Register');
const { tokens } = require('./Token')
const Compiler = require('./Compiler')
const { Utils } = require('./Utils')

function codeToString(asm) {
  let stre = ""
  for (let i = 0; i < asm.length; i++) {
    stre += `new RegisterEmbed('${asm[i].type}', ${JSON.stringify(asm[i].params)}),\n`;
  }
  console.log(stre)
}

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
  const code = new Compiler(toCompile);
  code.compile()
  expect(Utils.areRegistersEqual(code.asm, [
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', ["[0]", 3]),
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', ["[1]", 3]),
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', [4, 3]),
    new RegisterEmbed('add', [5, 3, 4]),
    new RegisterEmbed('mov', [3, 2]),
    new RegisterEmbed('beq', [3, 5, 2]),
    new RegisterEmbed('mov', [4, 0]),
    new RegisterEmbed('jre', [1]),
    new RegisterEmbed('mov', [4, 1]),
    new RegisterEmbed('benq', [4, 1, 6]),
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', ["[2]", 3]),
    new RegisterEmbed('mov', [3, "[2]"]),
    new RegisterEmbed('mov', [5, 2]),
    new RegisterEmbed('add', [6, 3, 5]),
    new RegisterEmbed('mov', ["[1]", 6]),
    new RegisterEmbed('mov', [3, 5]),
    new RegisterEmbed('mov', [5, "[1]"]),
    new RegisterEmbed('add', [6, 3, 5]),
    new RegisterEmbed('mov', ["[3]", 6]),
  ])).toBe(true)
});

test('conditional expression v2', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int7_t', 'a', '1']),
    Utils.createInitializationPayload(['int7_t', 'c', '1']),
    Utils.createConditionalPayload(Utils.createExpression(['1', '+', '3', '==', '2']), [
      Utils.createInitializationPayload(['int7_t', 'b', '1']),
      Utils.createAssignationPayload(['c', 'b', '+', '2']),
      Utils.createConditionalPayload(Utils.createExpression(['5', '+', '3', '==', '2']), [
        Utils.createAssignationPayload(['b', '15']),
        Utils.createAssignationPayload(['a', 'b', '+', '2'])
      ]),
    ]),
    Utils.createInitializationPayload(['int7_t', 'd', '5', '+', 'c'])
  ]
  const code = new Compiler(toCompile);
  code.compile()
  expect(Utils.areRegistersEqual(code.asm, [
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', ["[0]", 3]),
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', ["[1]", 3]),
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', [4, 3]),
    new RegisterEmbed('add', [5, 3, 4]),
    new RegisterEmbed('mov', [3, 2]),
    new RegisterEmbed('beq', [3, 5, 2]),
    new RegisterEmbed('mov', [4, 0]),
    new RegisterEmbed('jre', [1]),
    new RegisterEmbed('mov', [4, 1]),
    new RegisterEmbed('benq', [4, 1, 21]),
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', ["[2]", 3]),
    new RegisterEmbed('mov', [3, "[2]"]),
    new RegisterEmbed('mov', [5, 2]),
    new RegisterEmbed('add', [6, 3, 5]),
    new RegisterEmbed('mov', ["[1]", 6]),
    new RegisterEmbed('mov', [3, 5]),
    new RegisterEmbed('mov', [5, 3]),
    new RegisterEmbed('add', [6, 3, 5]),
    new RegisterEmbed('mov', [3, 2]),
    new RegisterEmbed('beq', [3, 6, 2]),
    new RegisterEmbed('mov', [5, 0]),
    new RegisterEmbed('jre', [1]),
    new RegisterEmbed('mov', [5, 1]),
    new RegisterEmbed('benq', [5, 1, 6]),
    new RegisterEmbed('mov', [3, 15]),
    new RegisterEmbed('mov', ["[2]", 3]),
    new RegisterEmbed('mov', [3, "[2]"]),
    new RegisterEmbed('mov', [6, 2]),
    new RegisterEmbed('add', [7, 3, 6]),
    new RegisterEmbed('mov', ["[0]", 7]),
    new RegisterEmbed('mov', [3, 5]),
    new RegisterEmbed('mov', [6, "[1]"]),
    new RegisterEmbed('add', [7, 3, 6]),
    new RegisterEmbed('mov', ["[3]", 7]),
  ])).toBe(true)
});

test('conditional expression v3', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int7_t', 'c', '1']),
    Utils.createConditionalPayload(Utils.createExpression(['1', '+', '3', '<', '2']), [
      Utils.createInitializationPayload(['int7_t', 'b', '1']),
    ]),
    Utils.createInitializationPayload(['int7_t', 'd', '5', '+', 'c'])
  ]
  const code = new Compiler(toCompile);
  code.compile()
  expect(Utils.areRegistersEqual(code.asm, [
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', ["[0]", 3]),
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', [4, 3]),
    new RegisterEmbed('add', [5, 3, 4]),
    new RegisterEmbed('mov', [3, 2]),
    new RegisterEmbed('slt', [4, 3, 5]),
    new RegisterEmbed('benq', [4, 1, 2]),
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', ["[1]", 3]),
    new RegisterEmbed('mov', [3, 5]),
    new RegisterEmbed('mov', [5, "[0]"]),
    new RegisterEmbed('add', [6, 3, 5]),
    new RegisterEmbed('mov', ["[2]", 6]),
  ])).toBe(true)
});

test('loop expression v1', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int7_t', 'c']),
    Utils.createInitializationPayload(['int7_t', 'b', '1']),
    Utils.createForLoopPayload([Utils.createAssignationPayload(['c', '0']), Utils.createExpression(['c', '<', '5']), Utils.createAssignationPayload(['c', 'c', '+', '1'])], [
      Utils.createAssignationPayload(['b', 'b', '+', '1']),
    ]),
    Utils.createInitializationPayload(['int7_t', 'a', '5', '+', 'b'])
  ]
  const code = new Compiler(toCompile);
  code.compile()
  expect(Utils.areRegistersEqual(code.asm, [
    new RegisterEmbed('mov', [3,1]),
    new RegisterEmbed('mov', ["[1]",3]),
    new RegisterEmbed('mov', [3,0]),
    new RegisterEmbed('mov', ["[0]",3]),
    new RegisterEmbed('mov', [3,"[0]"]),
    new RegisterEmbed('mov', [4,5]),
    new RegisterEmbed('slt', [5,4,3]),
    new RegisterEmbed('benq', [5,1,9]),
    new RegisterEmbed('mov', [3,"[1]"]),
    new RegisterEmbed('mov', [4,1]),
    new RegisterEmbed('add', [6,3,4]),
    new RegisterEmbed('mov', ["[1]",6]),
    new RegisterEmbed('mov', [3,"[0]"]),
    new RegisterEmbed('mov', [4,1]),
    new RegisterEmbed('add', [6,3,4]),
    new RegisterEmbed('mov', ["[0]",6]),
    new RegisterEmbed('j', [4]),
    new RegisterEmbed('mov', [3,5]),
    new RegisterEmbed('mov', [4,"[1]"]),
    new RegisterEmbed('add', [6,3,4]),
    new RegisterEmbed('mov', ["[2]",6]),
  ])).toBe(true)
});

test('loop expression v2', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int7_t', 'c']),
    Utils.createInitializationPayload(['int7_t', 'b', '1']),
    Utils.createForLoopPayload([Utils.createAssignationPayload(['c', '0']), Utils.createExpression(['c', '+', '1', '<', '5']), Utils.createAssignationPayload(['c', 'c', '+', '3'])], [
      Utils.createAssignationPayload(['b', 'b', '+', '1']),
    ]),
    Utils.createInitializationPayload(['int7_t', 'a', '5', '+', 'b'])
  ]
  const code = new Compiler(toCompile);
  code.compile()
  const resp = new RegistersEmbed(code.asm);
  console.log(resp.toMips(), resp.executeMips(resp.toMips()))
  // expect(Utils.areRegistersEqual(code.asm, [
  //   new RegisterEmbed('mov', [3,1]),
  //   new RegisterEmbed('mov', ["[1]",3]),
  //   new RegisterEmbed('mov', [3,0]),
  //   new RegisterEmbed('mov', ["[0]",3]),
  //   new RegisterEmbed('mov', [3,"[0]"]),
  //   new RegisterEmbed('mov', [4,5]),
  //   new RegisterEmbed('slt', [5,4,3]),
  //   new RegisterEmbed('benq', [5,1,9]),
  //   new RegisterEmbed('mov', [3,"[1]"]),
  //   new RegisterEmbed('mov', [4,1]),
  //   new RegisterEmbed('add', [6,3,4]),
  //   new RegisterEmbed('mov', ["[1]",6]),
  //   new RegisterEmbed('mov', [3,"[0]"]),
  //   new RegisterEmbed('mov', [4,1]),
  //   new RegisterEmbed('add', [6,3,4]),
  //   new RegisterEmbed('mov', ["[0]",6]),
  //   new RegisterEmbed('j', [4]),
  //   new RegisterEmbed('mov', [3,5]),
  //   new RegisterEmbed('mov', [4,"[1]"]),
  //   new RegisterEmbed('add', [6,3,4]),
  //   new RegisterEmbed('mov', ["[2]",6]),
  // ])).toBe(true)
});