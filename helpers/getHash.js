const bcrypt = require('bcryptjs')
const saltRounds = 10
function getBcrypt (password) {
  return bcrypt.hash(password, saltRounds)
}

module.exports = getBcrypt