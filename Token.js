const tokens = {
  int7_t: 0,
  undefined_variable: 1,
  for: 2,
  if: 3,
  open_paranth: 4,
  close_paranth: 5,
  semicolon: 6,
  equal: 7,
  double_equal: 8,
  expression: 9,
  defined_variable: 10,
  sign: 11,
  open_bracket: 12,
  close_bracket: 13,
  code_segment: 14 // special token
}

const newRowExpectation = {
  code_segment: {
    int7_t: {
      undefined_variable: {
        equal: {
          expression: {
            semicolon: {}
          }
        }
      }
    },
    defined_variable: {  // (defined_variable) = (test + 1)(;)
      equal: {
        expression: {
          semicolon: {}
        }
      }
    },
    if: {
      open_paranth: {
        expression: {
          close_paranth: {
            open_bracket: {
              code_segment: {
                close_bracket: {}
              }
            }
          }
        }
      }
    }
  }
}

module.exports = { tokens, newRowExpectation };