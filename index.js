const MipsAstParser = require('./Mips_ast');

const codeToCompile1 = `
int7_t ana = 5;
int7_t vasile = 6;

int7_t ionel;
int7_t i;
for(i = 0; i < ana; i++) {
  ionel = ionel + vasile;
}
`

const codeToCompile2 = `
int7_t ana = 5 + 33;
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



