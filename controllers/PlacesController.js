const coordinateApi = 'http://h8-p2-portocombo1.app.dev.arieseptian.com/route/getCoordinates'
const axios = require('axios')
const GmapNearby = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
const APIkey = 'AIzaSyBN6anoHdSlaMME70z1wRzRTntP9CiKRYw' //nanti taroh .env

class PlacesController {
  static async getReccomendedByCity(req, res) {
    try {
      var {
        type,
        city
      } = req.body
      var getCoordinates = await axios.post(`${coordinateApi}`, {
        addresses: [city]
      })
      var cityCoordinate = getCoordinates.data[0].results[0].geometry.location
      var getPlaces = await axios.get(`${GmapNearby}?location=${cityCoordinate.lat},${cityCoordinate.lng}&radius=20000&type=${type}&key=${APIkey}`)
      // res.status(200).json({cityCoordinate})
      var recomendations = getPlaces.data.results.sort((a, b) => (a.rating < b.rating) ? 1 : ((b.rating < a.rating) ? -1 : 0))
      // res.status(200).json({results: getPlaces.data})
      res.status(200).json({
        results: recomendations.slice(0, 10)
      })

    } catch (error) {
      //console.log(error.response)
      res.status(500).json(error.response)
    }
  }

  static async getAutocomplete(req, res) {
    try {
      const gmapAutocomplete = `https://maps.googleapis.com/maps/api/place/autocomplete/json`
      let response = await axios({
        url: `${gmapAutocomplete}?key=${APIkey}&input=${req.body.input}`
      })
      res.status(200).json(response.data)
    } catch (error) {
      //console.log(error.response)
      res.status(500).json(error.data)
    }
  }
}

module.exports = PlacesController