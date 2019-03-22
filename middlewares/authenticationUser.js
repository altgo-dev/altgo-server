const jwt = require('jsonwebtoken')

function authentication(req, res, next) {
  try {
    const decode = jwt.verify(req.headers.token, process.env.SECRET_JWT)
    req.userAuthentic = decode
    next()
  } catch(err) {
    console.log(err)
    res.status(401).json({message :'Unauthorized'})
  }
}

module.exports = authentication