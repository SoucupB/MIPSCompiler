const ExpressionTree = require('./ExpressionTree');
const { RegisterEmbed } = require('./Register');
const { tokens } = require('./Token')
const Compiler = require('./Compiler')

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

test('correct compilation v1', () => {
  const toCompile = [
    {
      token: 'initialization',
      payload: [
        {
          token: tokens.data_type,
          payload: 'int7_t'
        },
        {
          token: tokens.variable,
          payload: 'yolo'
        },
        {
          token: tokens.expression,
          payload: [
            {
              token: tokens.constant_token,
              value: 1
            },
            {
              token: tokens.sign_plus,
            },
            {
              token: tokens.constant_token,
              value: 2
            }
          ]
        }
      ]
    },
    {
      token: 'assignation',
      payload: [
        {
          token: tokens.variable,
          payload: 'yolo'
        },
        {
          token: tokens.expression,
          payload: [
            {
              token: tokens.constant_token,
              value: 5
            },
            {
              token: tokens.sign_plus,
            },
            {
              token: tokens.constant_token,
              value: 36
            }
          ]
        }
      ]
    }
  ]
  const code = new Compiler(toCompile);
  code.compile()
  expect(areRegistersEqual(code.asm, [
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
    {
      token: 'initialization',
      payload: [
        {
          token: tokens.data_type,
          payload: 'int7_t'
        },
        {
          token: tokens.variable,
          payload: 'a'
        },
        {
          token: tokens.expression,
          payload: [
            {
              token: tokens.constant_token,
              value: 1
            },
            {
              token: tokens.sign_plus,
            },
            {
              token: tokens.constant_token,
              value: 2
            },
            {
              token: tokens.sign_mul,
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
              value: 6
            }
          ]
        }
      ]
    },
  ]
  const code = new Compiler(toCompile);
  code.compile()
  expect(areRegistersEqual(code.asm, [
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
    {
      token: 'initialization',
      payload: [
        {
          token: tokens.data_type,
          payload: 'int7_t'
        },
        {
          token: tokens.variable,
          payload: 'a'
        },
        {
          token: tokens.expression,
          payload: [
            {
              token: tokens.constant_token,
              value: 1
            }
          ]
        }
      ]
    },
    {
      token: 'initialization',
      payload: [
        {
          token: tokens.data_type,
          payload: 'int7_t'
        },
        {
          token: tokens.variable,
          payload: 'b'
        },
        {
          token: tokens.expression,
          payload: [
            {
              token: tokens.constant_token,
              value: 3
            }
          ]
        }
      ]
    },
  ]
  const code = new Compiler(toCompile);
  code.compile()
  expect(areRegistersEqual(code.asm, [
    new RegisterEmbed('mov', [3, 1]),
    new RegisterEmbed('mov', ['[0]', 3]),
    new RegisterEmbed('mov', [3, 3]),
    new RegisterEmbed('mov', ['[1]', 3]),
  ])).toBe(true)
});