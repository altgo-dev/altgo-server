const User = require('../models/user')
const Friend = require('../models/friend')
const compareHash = require('../helpers/compareHash')
const jwt = require('jsonwebtoken')


class ControllerUser {
  static async findOne(req, res) {
    try {
      let userFound = await User.findOne({ _id: req.userAuthentic._id })
      let userFriend = await Friend.find({ $or: [{ UserId1: req.userAuthentic._id }, { UserId2: req.userAuthentic._id }] }).populate('UserId1').populate('UserId2')
      res.status(200).json({ userFound, userFriend })
    } catch (error) {
      res.status(500).json({ err: err.message })
    }
  }

  static findAllUser(req, res) {
    User.find({}).populate('friends')
      .then(users => {
        res.status(200).json({ users })
      })
      .catch(err => {
        res.status(500).json({ err: err.message })
      })
  }

  static async addFriend(req, res) {
    try {
      const searchFriend =
        await Friend.findOne({
          $or: [{
            UserId1: req.userAuthentic._id,
            UserId2: req.body.friendId
          }, {
            UserId2: req.userAuthentic._id,
            UserId1: req.body.friendId
          }]
        })
      const friendExist = await User.findById(req.body.friendId)
      if (!searchFriend && friendExist) {
        let newFriend =
          await Friend.create({
            UserId1: req.userAuthentic._id,
            UserId2: req.body.friendId
          })

        let updateFriend2 =
          await User.findOneAndUpdate({
            _id: req.body.friendId
          }, {
              $push: {
                friends: req.userAuthentic._id
              }
            }, {
              new: true
            }).populate('friends')

        let updateFriend1 =
          await User.findOneAndUpdate({
            _id: req.userAuthentic._id
          }, {
              $push: {
                friends: req.body.friendId
              }
            }, {
              new: true
            }).populate('friends')
        res.status(201).json(updateFriend1)
      } else {
        throw 400
      }
    } catch (error) {
      if (error === 400) {
        res.status(400).json({ error: 'Already being Friends' })
      } else {
        res.status(500).json({ error: error.message })
      }
    }
  }

  static async removeFriend(req, res) {
    try {
      const remove =
        await Friend.deleteOne({
          $or: [{
            UserId1: req.userAuthentic._id,
            UserId2: req.body.friendId
          }, {
            UserId2: req.userAuthentic._id,
            UserId1: req.body.friendId
          }]
        })
      let updateFriend2 =
        await User.findOneAndUpdate({
          _id: req.body.friendId
        }, {
            $pull: {
              friends: req.userAuthentic._id
            }
          }, {
            new: true
          }).populate('friends')

      let updateFriend1 =
        await User.findOneAndUpdate({
          _id: req.userAuthentic._id
        }, {
            $pull: {
              friends: req.body.friendId
            }
          }, {
            new: true
          }).populate('friends')
      res.status(200).json(updateFriend1)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  static register(req, res) {
    let image = req.body.image ? req.body.image : ''
    if (req.file) {
      image = req.file.cloudStoragePublicUrl
    }
    if (req.body.password.length < 5 || req.body.password.length > 20) {
      throw 400
    }
    User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      profilePicture: image
    })
      .then(user => {
        const token = jwt.sign({
          _id: user._id
        }, process.env.SECRET_JWT)
        res.status(201).json({ token, user })
      })
      .catch(err => {
        if (err == 400) {
          res.status(400).json({ err: 'Password Invalid' })
        } else {
          res.status(500).json({ err: err.message })
        }
      })
  }

  static update(req, res) {
    if (req.body.image) {
      if (req.file) {
        req.body.image = req.file.cloudStoragePublicUrl
      }
    }
    User.findOne({
      _id: req.userAuthentic._id,
    })
      .then(user => {
        for (let key in req.body) {
          if (key === 'password' && (req.body.password.length < 5 || req.body.password.length > 20)) {

            throw '400'
          }
          user.set(key, req.body[key])
        }
        return user.save()
      })
      .then(user => {
        res.status(200).json({ user: user })
      })
      .catch(err => {
        if (err == 400) {
          res.status(400).json({ err: 'Password Invalid' })
        } else {
          res.status(500).json({ err: err.message })

        }
      })
  }

  static login(req, res) {
    let userFound = null
    User.findOne({
      email: req.body.email
    })
      .then(data => {
        userFound = data
        if (data) {
          data = userFound
          return compareHash(req.body.password, userFound.password)
        } else {
          throw '404'
        }
      })
      .then(verified => {
        
        if (verified) {
          const token = jwt.sign({
            _id: userFound._id
          }, process.env.SECRET_JWT)
          res.status(200).json({ token, id: userFound._id, email: userFound.email, name: userFound.name, type: userFound.type })
        } else {
          throw '404'
        }
      })
      .catch(err => {
        if (err == '404') {
          res.status(404).json({ err: 'Not Authorized' })
        } else {
          res.status(500).json({ err: err.message })
        }
      })
  }


}

module.exports = ControllerUser