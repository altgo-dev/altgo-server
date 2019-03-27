const routes = require('express').Router()
const userController = require('../controllers/userController')
const UserRoutes = require('../routes/user')
const MeetupsRoutes = require('./meetups')
const PlacesController = require('../controllers/PlacesController')
const images = require('../helpers/images.js')

routes.post('/register', images.multer.single('image'), images.sendUploadToGCS, userController.register)
routes.post('/login', userController.login)
routes.post('/recommendations', PlacesController.getReccomendedByCity)
routes.post('/autocomplete', PlacesController.getAutocomplete)

routes.use('/meetups', MeetupsRoutes)
routes.use('/users', UserRoutes)
routes.use('/route', require('./routeOptimizer'))

module.exports = routes