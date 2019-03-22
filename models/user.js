const mongoose = require('mongoose')
const getHash = require('../helpers/getHash')
const Schema = mongoose.Schema

const userSchema = new Schema({
  name : String,
  email : {
    type: String,
    trim: true,
    lowercase: true,
    required: 'Email harus diisi',
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Contoh email : email@mail.com'],
    validate : {
      validator (value){
        return new Promise((resolve, reject) => {
          User.findOne({
            email : value
          })
          .then(user => {
            if(user != undefined && String(user._id) !== String(this._id)) {
              throw err
            } else {
              resolve()
            }
          })
          .catch(err => {
            reject(err)
          })
        })
      }, message : 'Gunakan Email lain'
    }
  },
  password : {
    type: String,
    minlength : [5, 'password minimal 8 karakter'],
    maxlength : [20, 'password minimal 20 karakter']
  },
  profilePicture: String
})

userSchema.post('validate', function(result) {
  return getHash(result.password)
  .then(data => {
    result.password = data
  })
  .catch(err => {
    throw new Error(err)
  })
})

const User = mongoose.model('User', userSchema)




module.exports = User