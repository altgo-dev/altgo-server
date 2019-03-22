const express = require('express')
const app = express()
const cors = require('cors')
const routes = require('./routes')
const mongoose = require('mongoose')
require('dotenv').config()

let environment = process.env.NODE_ENV || ''
let mongodb_srv = process.env.MONGODB_SRV || 'mongodb://localhost/h8-p2-portocombo1'
mongodb_srv += environment
mongoose.connect(mongodb_srv, { useNewUrlParser: true })
app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.set('port', process.env.PORT || 3000);
app.use('/', routes)

if (environment !== 'test') {
    app.listen(app.get('port'), function () {
        console.log('Express server is listening on port ' + app.get('port'))
    })
}

module.exports = app
