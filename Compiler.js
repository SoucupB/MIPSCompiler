const ExpressionNode = require('./ExpressionTree');
const { RegisterEmbed } = require('./Register');
const { tokens } = require('./Token')
const { example, expressionExample } = require('./Example')

class Compiler {
  constructor(code) {
    this.code = code;
  }


  compile() {
    const code = this.code;
    for(let i = 0, c = code.length; i < c; i++) {
      if(code[i].token === 'initialization') {
        
      }
    }
  }
}

const code = new Compiler(example);