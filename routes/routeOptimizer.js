const routes = require('express').Router()
const Route = require('../controllers/routeController')

routes.post('/routeOptimizer', Route.routeOptimizer)
routes.post('/getCoordinates', Route.getCoordinates)

module.exports = routes
