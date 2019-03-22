const routes = require('express').Router()
const axios = require('axios')
const routeOptimizerURL = process.env.ROUTEOPTIMIZER_URL || 'http://localhost:3001'

routes.post('/', async (req, res) => {
    try {
        let response = await axios({
            baseURL: routeOptimizerURL,
            url: '/api/v1/routeOptimizer',
            method: 'POST',
            data: req.body
        })
        res.status(200).json(response.data)
    } catch (err) {
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
})

module.exports = routes
