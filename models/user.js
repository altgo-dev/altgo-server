const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
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
      }, message : 'Email already taken'
    }
  },
  password : {
    type: String
  },
  profilePicture: String,
  friends : [{ type: Schema.Types.ObjectId, ref: 'User' }]
})

userSchema.pre('save', function(next) {
  let user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();
  
  // hash the password
  bcrypt.hash(user.password, 1, function (err, hash) {
      // if (err) return next(err)
      // override the cleartext password with the hashed one
      user.password = hash;
      next();
  });
})

const User = mongoose.model('User', userSchema)




module.exports = User