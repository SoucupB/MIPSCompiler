const MipsAstParser = require('./Mips_ast');

const codeToCompile1 = `
int ana = 5;
int vasile = 6;

int ionel;
int i;
for(i = 0; i < ana; i++) {
  ionel = ionel + vasile;
}
`

const codeToCompile2 = `
int ana = 5 + 33;
`

const mips = new MipsAstParser({
  addition: 0,
  multiplication: 1,
  logical_or: 2,
  logical_and: 3,
  engine: 'x16',
  code: codeToCompile2
})

console.log(mips.compile())



