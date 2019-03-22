const User = require('../models/user')
const Friend = require('../models/friend')
const compareHash = require('../helpers/compareHash')
const jwt = require('jsonwebtoken')


class ControllerUser {
  static async findOne(req, res) {
    try {
      let userFound = await User.findOne({  _id: req.userAuthentic._id })
      let userFriend = await Friend.find({ $or: [{ UserId1: req.userAuthentic._id }, { UserId2: req.userAuthentic._id } ]}).populate('UserId1').populate('UserId2')
      res.status(200).json({userFound, userFriend})
    } catch (error) {
      res.status(500).json({err : err.message})
    }
  }

  static async addFriend(req, res) {
    try {
      const searchFriend =
        await Friend.findOne({
          $or: [{
            UserId1: req.userAuthentic._id,
            UserId2 : req.body.friendId
          },{
            UserId2: req.userAuthentic._id,
            UserId1 : req.body.friendId
          }]
        })
      if(!searchFriend) {
        let newFriend = 
          await Friend.create({
            UserId1: req.userAuthentic._id,
            UserId2: req.body.friendId
          })
          res.status(201).json(newFriend)
      } else {
        throw 400
      }
    } catch (error) {
      if(error === 400) {
        res.status(400).json({error : 'Already being Friends'})
      } else {
        res.status(500).json({error : error.message})
      }
    }
  }

  static removeFriend(req, res) {
    Friend.deleteOne({
      $or: [{
        UserId1: req.userAuthentic._id,
        UserId2 : req.body.friendId
      },{
        UserId2: req.userAuthentic._id,
        UserId1 : req.body.friendId
      }]
    })
      .then(friend => {
        res.status(200).json(friend)
      })
      .catch(err => {
        res.status(500).json({err : err.message})
      })
  }

  static register(req, res) {
    let image = req.body.image
    if (req.file) {
      image = req.file.cloudStoragePublicUrl
    }

    User.create({
      name : req.body.name,
      email : req.body.email,
      password : req.body.password,
      image : image
    })
    .then(user => {
      res.status(201).json({user})
    })
    .catch(err => {
      res.status(500).json({err : err.message})
    })
  }


  static update(req, res) {
    if(req.body.image) {
      if (req.file) {
        req.body.image = req.file.cloudStoragePublicUrl
      }  
    }
    User.findOne({
      _id: req.userAuthentic._id,
    })
    .then(user => {
      for(let key in req.body) {
        user.set(key, req.body[key])
      }
      return user.save()
    })
    .then(user => {
      res.status(200).json({user})
    })
    .catch(err => {
      res.status(500).json({err : err.message})
    })
  }

  static login(req, res) {
    let userFound = null
    User.findOne({
      email : req.body.email
    })
    .then(data => {
      userFound = data
      if(data) {
        data = userFound
        return compareHash(req.body.password, userFound.password)
      } else {
        throw '404'
      }
    })
    .then(verified => {
      if(verified){
        const token = jwt.sign({
          _id : userFound._id
        }, process.env.SECRET_JWT)
        res.status(200).json({token, email: userFound.email, name: userFound.name, type: userFound.type})
      } else {
        throw '404'
      }
    })
    .catch(err => {
      if(err == '404') {
        res.status(404).json({err : 'Not Authorized'})
      } else {
        res.status(500).json({err : err.message})
      }
    })
  }

  
}

module.exports = ControllerUser