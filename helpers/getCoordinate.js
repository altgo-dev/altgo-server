const axios = require('axios')
const redis = require('redis')
const redisClient = redis.createClient()
const GmapKey = 'key=AIzaSyBN6anoHdSlaMME70z1wRzRTntP9CiKRYw'
const GmapGeocodeAPI = 'https://maps.googleapis.com/maps/api/geocode/json'

async function getCoordinate(address) {
    let geocodedAddress = {}
    let redisReply = await new Promise((resolve, reject) => {
        redisClient.get(`geocoding ${address}`, (err, reply) => {
            if (err) reject(err)
            else resolve(reply)
        })
    })
    if (redisReply) {
        geocodedAddress = JSON.parse(redisReply)
    } else {
        let response = await axios.get(`${GmapGeocodeAPI}?address=${address}&${GmapKey}`)
        geocodedAddress = response.data
        redisClient.set(`geocoding ${address}`, JSON.stringify(response.data), 'EX', 3600);
    }
    return geocodedAddress
}

module.exports = { getCoordinate }
