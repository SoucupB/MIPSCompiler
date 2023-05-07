
const { tokens } = require('./Token')

const example = [
  {
    token: 'initizalization',
    payload: [
      {
        token: tokens.data_type,
        payload: 'int7_t'
      },
      {
        token: tokens.undefined_variable,
        payload: 'yolo'
      },
      {
        token: tokens.expression,
        payload: [
          {
            token: tokens.constant_token,
            value: '5'
          },
          {
            token: tokens.sign_plus,
          },
          {
            token: tokens.constant_token,
            value: '33'
          }
        ]
      }
    ]
  },
  {
    token: 'assignation',
    payload: [
      {
        token: tokens.defined_variable,
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

const expressionExample = {
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
    },
    {
      token: tokens.sign_minus,
    },
    {
      token: tokens.constant_token,
      value: 11
    },
  ]
}


module.exports = { example, expressionExample };