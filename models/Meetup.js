const mongoose = require('mongoose')

const MeetupSchema = new mongoose.Schema({
  origins: [{
    lat: Number,
    long: Number
  }], 
  centerpoint: {
    lat: Number,
    long: Number
  },
  reccommendations: [{
    name: String, 
    rating: Number, 
    open_now: Boolean, 
    types: [String],
    location: String,
    photo_path: String, 
    coordinate: {
      lat: Number, 
      long: Number
    }
  }],
  status: {
    type: String,
    default: "Ongoing"
  }
})

const Meetup = mongoose.model('Meetup', MeetupSchema)

module.exports = Meetup