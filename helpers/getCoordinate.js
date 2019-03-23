const axios = require('axios')
const GmapKey = 'key=AIzaSyBN6anoHdSlaMME70z1wRzRTntP9CiKRYw'
const GmapGeocodeAPI = 'https://maps.googleapis.com/maps/api/geocode/json'

function getCoordinate(address) {
    return axios
        .get(`${GmapGeocodeAPI}?address=${address}&${GmapKey}`)
}

module.exports = { getCoordinate }
