const axios = require('axios')
const { getCoordinate } = require('../helpers/getCoordinate')
const { putFurthestToLast } = require('../helpers/rearanggeAddress')
const routeOptimizerURL = process.env.ROUTEOPTIMIZER_URL || 'http://localhost:3000'

class Route {
    static async routeOptimizer(req, res) {
        try {
            let routingType = req.body.routingType || 'AtoZ'
            let departureTime = req.body.departureTime || new Date().getTime()
            let addresses = req.body.addresses || []
            addresses = Array.from(new Set(addresses))
            if (routingType === 'Straight') {
                addresses = await putFurthestToLast(addresses)
                routingType = 'AtoZ'
            }
            let routeOptimizerRequest = {
                departureTime,
                routingType,
                home: {},
                tasks: []
            }
            let id = 0
            for (let address of addresses) {
                let coordinate = await getCoordinate(address)
                if (coordinate.status == 'OK') {
                    id++
                    let task = {
                        id,
                        lat: coordinate.results[0].geometry.location.lat,
                        lng: coordinate.results[0].geometry.location.lng,
                        duration: 1,
                        geocodingData: coordinate.results[0],
                        addressSearchQuery: address,
                    }
                    routeOptimizerRequest.tasks.push(task)
                    if (id == 1) {
                        routeOptimizerRequest.home = task
                    }
                }
            }
            let response = await axios({
                baseURL: routeOptimizerURL,
                url: '/api/v1/routeOptimizer',
                method: 'POST',
                data: routeOptimizerRequest
            })
            let optimizedRoute = {
                status: 'OK',
                totalTime: response.data.result.totalTime,
                route: response.data.result.schedule.map(e => {
                    return {
                        ...routeOptimizerRequest.tasks.filter(f => f.id == e.id)[0],
                        startsAt: e.startsAt,
                        endsAt: e.endsAt,
                    }
                })
            }
            res.status(200).json(optimizedRoute)
        } catch (err) {
            Route.handleError(err, req, res)
        }
    }

    static async getCoordinates(req, res) {
        try {
            let addresses = req.body.addresses
            let geocodingData = []
            for (let address of addresses) {
                geocodingData.push(await getCoordinate(address))
            }
            res.status(200).json(geocodingData)
        } catch (err) {
            Route.handleError(err, req, res)
        }
    }

    static handleError(err, req, res) {
        if (err.response) {
            res.status(err.response.status).json(err.response.data)
        } else {
            res.status(500).send({
                status: 'INTERNAL_SERVER_ERROR',
                errno: err.errno,
                code: err.code,
                syscall: err.syscall,
            })
        }
    }
}

module.exports = Route