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
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(41); // yolo
});

test('correct compilation v2', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int7_t', 'a', '1', '+', '2', '*', '5', '*', '6']),
  ]
  const code = new Compiler(toCompile);
  code.compile()
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(61); // a
});

test('correct compilation v3', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int7_t', 'a', '1']),
    Utils.createInitializationPayload(['int7_t', 'b', '3']),
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
    Utils.createInitializationPayload(['int7_t', 'a', '1']),
    Utils.createInitializationPayload(['int7_t', 'b']),
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
    Utils.createInitializationPayload(['int7_t', 'a', '1']),
    Utils.createInitializationPayload(['int7_t', 'b', '1', '+', 'a']),
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
    Utils.createInitializationPayload(['int7_t', 'a', '2']),
    Utils.createInitializationPayload(['int7_t', 'b', '3', '+', 'a']),
    Utils.createInitializationPayload(['int7_t', 'c', '4', '+', 'a', '*', 'b']),
    Utils.createInitializationPayload(['int7_t', 'd', '5', '+', 'a', '*', '(', 'b', '+', 'c', ')']),
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
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(1); // a
  expect(regMem.memory[1]).toBe(1); // c
  expect(regMem.memory[2]).toBe(0); // b
  expect(regMem.memory[3]).toBe(6); // d
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
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(1); // a
  expect(regMem.memory[1]).toBe(1); // c
  expect(regMem.memory[2]).toBe(0); // b
  expect(regMem.memory[3]).toBe(6); // d
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
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(1); // c
  expect(regMem.memory[1]).toBe(0); // b
  expect(regMem.memory[2]).toBe(6); // d
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
  const resp = new RegistersEmbed(code.asm);
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(5); // c
  expect(regMem.memory[1]).toBe(6); // b
  expect(regMem.memory[2]).toBe(11); // a
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
  const regMem = resp.executeMips(resp.toMips());
  expect(regMem.memory[0]).toBe(6); // c
  expect(regMem.memory[1]).toBe(3); // b
  expect(regMem.memory[2]).toBe(8); // a
});

test('loop fibbonachi', () => {
  const toCompile = [
    Utils.createInitializationPayload(['int7_t', 'i']),
    Utils.createInitializationPayload(['int7_t', 'a', '1']),
    Utils.createInitializationPayload(['int7_t', 'b', '1']),
    Utils.createInitializationPayload(['int7_t', 'c']),
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
    Utils.createInitializationPayload(['int7_t', 'i']),
    Utils.createInitializationPayload(['int7_t', 'a', '5']),
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