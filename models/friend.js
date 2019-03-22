const mongoose = require('mongoose')
const Schema = mongoose.Schema

const firendSchema = new Schema({
  UserId1 : { type : Schema.Types.ObjectId, ref :'User'},
  UserId2 : { type : Schema.Types.ObjectId, ref :'User'}
})

const Friend = mongoose.model('Friend', firendSchema)

module.exports = Friend