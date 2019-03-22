const routes = require('express').Router()
const userController = require('../controllers/userController')
const UserRoutes = require('../routes/user')
const images = require('../helpers/images.js')

routes.post('/register', images.multer.single('image') , images.sendUploadToGCS , userController.register)
routes.post('/login', userController.login)

routes.use('/users', UserRoutes)
routes.use('/routeOptimizer', require('./routeOptimizer'))

module.exports = routes
