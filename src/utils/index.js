const jwt = require('jsonwebtoken')
const decodedToken = (req, requireAuth = true) => {
  // const header = req.headers.authorization

  // if (header) {
  //   const token = header.replace('Bearer ', '')
  //   const decoded = jwt.verify(token, 'kol-task')
  //   return decoded
  // }
  // if (requireAuth) {
  //   throw new Error('Login in to access resource')
  // }
  return null
}
module.exports = { decodedToken }