const axios = require('axios')
const APIkey = 'AIzaSyBN6anoHdSlaMME70z1wRzRTntP9CiKRYw'//nanti taroh .env
const GmapJsApi = `https://maps.googleapis.com/maps/api/geocode/json?key=${APIkey}`
const GmapNearby = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'

const Meetup = require('../models/Meetup')

class MeetupController {
  static findAll(req, res) {
    Meetup
      .find()
      .then(meetup => {
        res
          .status(200)
          .json({
            msg: 'fetch success',
            data: meetup
          })
      })
      .catch(err => {
        res
          .status(400)
          .json({
            msg: 'not found',
            err
          })
      })
  }

  static create(req, res) {
    const arrLat = []
    const arrLong = []
    req.body.origins.forEach(coords => {
      arrLat.push(Number(coords.lat))
      arrLong.push(Number(coords.long))
    });

    const centerLat = arrLat.reduce(function (a, b) { return a + b; }) / req.body.origins.length
    const centerLong = arrLong.reduce(function (a, b) { return a + b; }) / req.body.origins.length

    var reccommendations = []
    axios
      .get(`${GmapNearby}?location=${centerLat},${centerLong}&radius=2000&type=restaurant&key=${APIkey}`)
      .then(({ data }) => {
        data.results.forEach(result => {
          var body =  {
            coordinate: {
              lat: result.geometry.location.lat,
              long: result.geometry.location.lng,
            },
            name: result.name,
            rating: result.rating,
            types: result.types,
            location: result.vicinity
          }

          if(result.photos){
            body.photo_path = result.photos[0].photo_reference
          }

          reccommendations.push(body)
        })
        return Meetup
          .create({
            origins: req.body.origins,
            centerpoint: { lat: centerLat, long: centerLong },
            reccommendations: reccommendations
          })
      })
      .then(meetup => {
        res
          .status(201)
          .json({
            msg: "create success",
            data: meetup
          })
      })
      .catch(err => {
        res
          .status(400)
          .json({
            msg: "create failed",
            err
          })
      })
  }

  static update(req, res) {
    Meetup
      .findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
      .then(updatedMeetup => {
        res
          .status(200)
          .json({
            msg: "update success",
            data: updatedMeetup
          })
      })
      .catch(err => {
        res
          .status(400)
          .json({
            msg: "update failed",
            err
          })
      })
  }
}

module.exports = MeetupController