const ExpressionTree = require('./ExpressionTree');
const { Register, RegisterEmbed, RegistersEmbed } = require('./Register');
const { tokens } = require('./Token')
const Compiler = require('./Compiler')
const { Utils } = require('./Utils')

test('correct compilation v1', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int', 'yolo', '1', '+', '2']),
    Utils.createAssignationPayload(['yolo', '5', '+', '36'])
  ]
  const code = new Compiler(toCompile);
  code.compile()
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(41); // yolo
});

test('correct compilation v2', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int', 'a', '1', '+', '2', '*', '5', '*', '6']),
  ]
  const code = new Compiler(toCompile);
  code.compile()
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(61); // a
});

test('correct compilation v3', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int', 'a', '1']),
    Utils.createInitializationPayload(['int', 'b', '3']),
  ]
  const code = new Compiler(toCompile);
  code.compile()
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(1); // a
  expect(regMem.memory[1]).toBe(3); // b
});

test('correct compilation v4', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int', 'a', '1']),
    Utils.createInitializationPayload(['int', 'b']),
    Utils.createAssignationPayload(['b', '5'])
  ]
  const code = new Compiler(toCompile);
  code.compile()
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(1); // a
  expect(regMem.memory[1]).toBe(5); // b
});

test('correct expression with variables', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int', 'a', '1']),
    Utils.createInitializationPayload(['int', 'b', '1', '+', 'a']),
  ]
  const code = new Compiler(toCompile);
  code.compile()
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(1); // a
  expect(regMem.memory[1]).toBe(2); // b
});

test('correct expression with variables v2', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int', 'a', '2']),
    Utils.createInitializationPayload(['int', 'b', '3', '+', 'a']),
    Utils.createInitializationPayload(['int', 'c', '4', '+', 'a', '*', 'b']),
    Utils.createInitializationPayload(['int', 'd', '5', '+', 'a', '*', '(', 'b', '+', 'c', ')']),
  ]
  const code = new Compiler(toCompile);
  code.compile()
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(2); // a
  expect(regMem.memory[1]).toBe(5); // b
  expect(regMem.memory[2]).toBe(14); // c
  expect(regMem.memory[3]).toBe(43); // d
});

test('conditional expression', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int', 'a', '1']),
    Utils.createInitializationPayload(['int', 'c', '1']),
    Utils.createConditionalPayload(Utils.createExpression(['1', '+', '3', '==', '2']), [
      Utils.createInitializationPayload(['int', 'b', '1']),
      Utils.createAssignationPayload(['c', 'b', '+', '2'])
    ]),
    Utils.createInitializationPayload(['int', 'd', '5', '+', 'c'])
  ]
  const code = new Compiler(toCompile);
  code.compile()
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(1); // a
  expect(regMem.memory[1]).toBe(1); // c
  expect(regMem.memory[2]).toBe(0); // b
  expect(regMem.memory[3]).toBe(6); // d
});

test('conditional expression v2', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int', 'a', '1']),
    Utils.createInitializationPayload(['int', 'c', '1']),
    Utils.createConditionalPayload(Utils.createExpression(['1', '+', '3', '==', '2']), [
      Utils.createInitializationPayload(['int', 'b', '1']),
      Utils.createAssignationPayload(['c', 'b', '+', '2']),
      Utils.createConditionalPayload(Utils.createExpression(['5', '+', '3', '==', '2']), [
        Utils.createAssignationPayload(['b', '15']),
        Utils.createAssignationPayload(['a', 'b', '+', '2'])
      ]),
    ]),
    Utils.createInitializationPayload(['int', 'd', '5', '+', 'c'])
  ]
  const code = new Compiler(toCompile);
  code.compile()
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(1); // a
  expect(regMem.memory[1]).toBe(1); // c
  expect(regMem.memory[2]).toBe(0); // b
  expect(regMem.memory[3]).toBe(6); // d
});

test('conditional expression v3', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int', 'c', '1']),
    Utils.createConditionalPayload(Utils.createExpression(['1', '+', '3', '<', '2']), [
      Utils.createInitializationPayload(['int', 'b', '1']),
    ]),
    Utils.createInitializationPayload(['int', 'd', '5', '+', 'c'])
  ]
  const code = new Compiler(toCompile);
  code.compile()
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(1); // c
  expect(regMem.memory[1]).toBe(0); // b
  expect(regMem.memory[2]).toBe(6); // d
});

test('loop expression v1', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int', 'c']),
    Utils.createInitializationPayload(['int', 'b', '1']),
    Utils.createForLoopPayload([Utils.createAssignationPayload(['c', '0']), Utils.createExpression(['c', '<', '5']), Utils.createAssignationPayload(['c', 'c', '+', '1'])], [
      Utils.createAssignationPayload(['b', 'b', '+', '1']),
    ]),
    Utils.createInitializationPayload(['int', 'a', '5', '+', 'b'])
  ]
  const code = new Compiler(toCompile);
  code.compile()
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(5); // c
  expect(regMem.memory[1]).toBe(6); // b
  expect(regMem.memory[2]).toBe(11); // a
});

test('loop expression v2', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int', 'c']),
    Utils.createInitializationPayload(['int', 'b', '1']),
    Utils.createForLoopPayload([Utils.createAssignationPayload(['c', '0']), Utils.createExpression(['c', '+', '1', '<', '5']), Utils.createAssignationPayload(['c', 'c', '+', '3'])], [
      Utils.createAssignationPayload(['b', 'b', '+', '1']),
    ]),
    Utils.createInitializationPayload(['int', 'a', '5', '+', 'b'])
  ]
  const code = new Compiler(toCompile);
  code.compile()
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(6); // c
  expect(regMem.memory[1]).toBe(3); // b
  expect(regMem.memory[2]).toBe(8); // a
});

test('loop fibbonachi', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int', 'i']),
    Utils.createInitializationPayload(['int', 'a', '1']),
    Utils.createInitializationPayload(['int', 'b', '1']),
    Utils.createInitializationPayload(['int', 'c']),
    Utils.createForLoopPayload([Utils.createAssignationPayload(['i', '0']), Utils.createExpression(['i', '<', '8']), Utils.createAssignationPayload(['i', 'i', '+', '1'])], [
      Utils.createAssignationPayload(['c', 'a', '+', 'b']),
      Utils.createAssignationPayload(['a', 'b']),
      Utils.createAssignationPayload(['b', 'c']),
    ]),
  ]
  const code = new Compiler(toCompile);
  code.compile()
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(8); // i
  expect(regMem.memory[1]).toBe(34); // a
  expect(regMem.memory[2]).toBe(55); // b
  expect(regMem.memory[3]).toBe(55); // c
});

test('loop with if', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int', 'i']),
    Utils.createInitializationPayload(['int', 'a', '5']),
    Utils.createForLoopPayload([Utils.createAssignationPayload(['i', '0']), Utils.createExpression(['i', '<', '5']), Utils.createAssignationPayload(['i', 'i', '+', '1'])], [
      Utils.createConditionalPayload(Utils.createExpression(['i', '==', '1', '||', 'i', '==', '3', '||', 'i', '==', '4']), [
        Utils.createAssignationPayload(['a', 'a', '+', 'i']),
      ])
    ]),
  ]
  const code = new Compiler(toCompile);
  code.compile()
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(5); // i
  expect(regMem.memory[1]).toBe(13); // a
});

test('loop with sum/mod', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int', 'i']),
    Utils.createInitializationPayload(['int', 'a', '0']),
    Utils.createInitializationPayload(['int', 'b', '0']),
    Utils.createForLoopPayload([Utils.createAssignationPayload(['i', '0']), Utils.createExpression(['i', '<', '10']), Utils.createAssignationPayload(['i', 'i', '+', '1'])], [
      Utils.createConditionalPayload(Utils.createExpression(['i', '%', '2', '==', '0']), [
        Utils.createAssignationPayload(['a', 'a', '+', 'i']),
      ]),
      Utils.createConditionalPayload(Utils.createExpression(['i', '%', '2', '!=', '0']), [
        Utils.createAssignationPayload(['b', 'b', '+', 'i']),
      ])
    ]),
  ]
  const code = new Compiler(toCompile);
  code.compile()
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(10); // i
  expect(regMem.memory[1]).toBe(20); // a
  expect(regMem.memory[2]).toBe(25); // b
});

test('sum of digits', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int', 'i']),
    Utils.createInitializationPayload(['int', 'a', '932141']),
    Utils.createInitializationPayload(['int', 'count', '0']),
    Utils.createInitializationPayload(['int', 'sum', '0']),
    Utils.createForLoopPayload([Utils.createAssignationPayload(['i', '0']), Utils.createExpression(['i', '==', '0']), Utils.createAssignationPayload(['a', 'a', '/', '10'])], [
      Utils.createConditionalPayload(Utils.createExpression(['a', '==', '0']), [
        Utils.createAssignationPayload(['i', '1']),
      ]),
      Utils.createAssignationPayload(['sum', 'sum', '+', 'a', '%', '10']),
      Utils.createAssignationPayload(['count', 'count', '+', '1']),
    ]),
  ]
  const code = new Compiler(toCompile);
  code.compile()
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[2]).toBe(7); // i
  expect(regMem.memory[1]).toBe(0); // a
  expect(regMem.memory[3]).toBe(20); // sum
});

test('failing test', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int', 'b']),
    Utils.createInitializationPayload(['int', 'a', '0']),
    Utils.createInitializationPayload(['int', 'c', '3']),
    Utils.createForLoopPayload([Utils.createAssignationPayload(['b', '0']), Utils.createExpression(['b', '<', '5']), Utils.createAssignationPayload(['b', 'b', '+', '1'])], [
      Utils.createAssignationPayload(['a', 'a', '+', '1']),
      Utils.createAssignationPayload(['c', 'a', '+', '3']),
    ]),
    Utils.createInitializationPayload(['int', 'd', '9']),
    Utils.createConditionalPayload(Utils.createExpression(['d', '>', '10']), [
      Utils.createAssignationPayload(['c', '1']),
    ]),
  ]
  const code = new Compiler(toCompile);
  code.compile()
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(5); // i
  expect(regMem.memory[1]).toBe(5); // a
  expect(regMem.memory[2]).toBe(8); // a
  expect(regMem.memory[3]).toBe(9); // sum
});