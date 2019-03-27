const bcrypt = require('bcryptjs')
 
function compareHash (pass, hash) {
  return bcrypt.compare(pass, hash)
}


module.exports = compareHash