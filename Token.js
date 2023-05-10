const tokens = {
  initialization: 0,
  sign_plus: 1,
  sign_minus: 2,
  sign_mul: 3,
  constant_token: 4,
  sign_div: 5,
  sign_open_paranth: 6,
  sign_close_paranth: 7,
  variable: 8,
  data_type: 9,
  expression: 10,
  sign_double_and: 11,
  sign_double_or: 12,
  sign_greater: 13,
  sign_lower: 14,
  sign_double_equal: 15,
  if_instruction: 16
}

module.exports = { tokens };