
const { tokens } = require('./Token')

const example = [
  {
    token: 'initialization',
    payload: [
      {
        token: tokens.data_type,
        payload: 'int'
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
            value: 5
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
        payload: 'int'
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
  },
  {
    token: 'condition',
    payload: [
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
      },
      {
        token: 'assignation',
        payload: [
          {
            token: tokens.variable,
            payload: 'a'
          },
          {
            token: tokens.expression,
            payload: [
              {
                token: tokens.constant_token,
                value: 3
              },
            ]
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
      token: tokens.sign_mul,
    },
    {
      token: tokens.constant_token,
      value: 14
    },
    {
      token: tokens.sign_plus,
    },
    {
      token: tokens.constant_token,
      value: 36
    },
    {
      token: tokens.sign_mul,
    },
    {
      token: tokens.constant_token,
      value: 23
    },
  ]
}


module.exports = { example, expressionExample };