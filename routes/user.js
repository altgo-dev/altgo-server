const routes = require('express').Router()
const authentication = require('../middlewares/authenticationUser')
const ControllerUser = require('../controllers/userController')

routes.use(authentication)
routes.get('/' ,ControllerUser.findOne)
routes.put('/', ControllerUser.update)
routes.get('/all', ControllerUser.findAllUser)
routes.post('/friend', ControllerUser.addFriend)
routes.delete('/friend', ControllerUser.removeFriend)

module.exports = routes