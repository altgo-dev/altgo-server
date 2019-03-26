const chai = require('chai'),
  chaiHttp = require('chai-http'),
  {
    expect
  } = chai,
  app = require('../app'),
  User = require('../models/user')
Friend = require('../models/friend')


chai.use(chaiHttp)






describe('User', () => {

  let user2
  let usertoken

  before(function (done) {
    User.deleteMany({})
      .then(function () {
        return User.deleteMany({})
      })
      .then(function () {
        return Friend.deleteMany({})
      })
      .then(data => {
        return User.create({
          name: 'user2',
          email: 'user2@mail.com',
          password: 'user2'
        })
      })
      .then(data => {
        user2 = data
      })
    done()
  })


  const user = {
    name: 'user1',
    email: 'user1@mail.com',
    password: 'userno1'
  }

  it('should registering new User', function (done) {
    chai
      .request(app)
      .post('/register')
      .send(user)
      .end(function (err, res) {
        expect(err).to.be.null
        expect(res).to.have.status(201)
        expect(res).to.be.json
        expect(res.body).to.have.nested.property('user')
          .that.includes.all.keys(['_id', 'email', 'password'])
        done()
      })
  })

  it('should login user', function (done) {
    const userLogin = {
      email: 'user1@mail.com',
      password: 'userno1'
    }
    chai
      .request(app)
      .post('/login')
      .send(userLogin)
      .end(function (err, res) {
        usertoken = res.body.token
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res).to.be.json
        expect(res.body).to.have.nested.property('token')
        done()
      })
  })

  it('should get list all user', function (done) {
    chai
      .request(app)
      .get('/users/all')
      .set('token', usertoken)
      .end(function (err, res) {
        expect(err).to.be.null
        expect(res.body.users).to.be.an('array')
        expect(res.body.users).to.have.lengthOf(2)
        expect(res).to.be.json
        done()
      })
  })

  it('should failed get list all user', function (done) {
    chai
      .request(app)
      .get('/users/all')
      .end(function (err, res) {
        expect(err).to.be.null
        expect(res.body.message).to.equal('Unauthorized')
        expect(res).to.be.json
        done()
      })
  })

  it('should failed login user, beacuse email or password is wrong', function (done) {
    const userLogin = {
      email: 'user1@mail.com',
      password: 'user'
    }
    chai
      .request(app)
      .post('/login')
      .send(userLogin)
      .end(function (err, res) {
        expect(res.body.err).to.equal('Not Authorized')
        done()
      })
  })

  it('should add friend', function (done) {
    const friend = {
      friendId: user2._id
    }
    chai
      .request(app)
      .post('/users/friend')
      .send(friend)
      .set('token', usertoken)
      .end(function (err, res) {
        expect(err).to.be.null
        expect(res).to.be.json
        done()
      })
  })


  it('should not add friend because already being friends', function (done) {
    const friend = {
      friendId: user2._id
    }
    chai
      .request(app)
      .post('/users/friend')
      .send(friend)
      .set('token', usertoken)
      .end(function (err, res) {
        expect(res.body.error).to.equal('Already being Friends')
        done()
      })
  })

  it('should add friend', function (done) {
    const friend = {
      friendId: '9'
    }
    chai
      .request(app)
      .post('/users/friend')
      .send(friend)
      .set('token', usertoken)
      .end(function (err, res) {
        expect(err).to.be.null
        expect(res).to.be.json
        expect(res.body.error).to.equal('Cast to ObjectId failed for value "9" at path "UserId1" for model "Friend"')
        done()
      })
  })

  it('should not add friend', function (done) {
    const friend = {

    }
    chai
      .request(app)
      .post('/users/friend')
      .send(friend)
      .set('token', usertoken)
      .end(function (err, res) {
        console.log(res.body)
        expect(err).to.be.null
        expect(res).to.be.json
        // expect(res.body.error).to.equal('Cast to ObjectId failed for value "9" at path "UserId1" for model "Friend"')
        done()
      })
  })

  it('should not add friend because friendId is not exist', function (done) {
    const friend = {
      friendId: '9'
    }
    chai
      .request(app)
      .post('/users/friend')
      .send(friend)
      .set('token', usertoken)
      .end(function (err, res) {
        expect(err).to.be.null
        expect(res).to.be.json
        expect(res.body.error).to.equal('Cast to ObjectId failed for value "9" at path "UserId1" for model "Friend"')
        done()
      })
  })


  it('should get user data', function (done) {
    chai
      .request(app)
      .get('/users')
      .set('token', usertoken)
      .end(function (err, res) {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res).to.be.json
        expect(res.body).to.have.nested.property('userFound')
        expect(res.body).to.have.nested.property('userFriend')
        expect(res.body.userFriend).to.be.an('array')
        expect(res.body.userFriend).to.have.lengthOf(1)
        expect(res.body.userFriend[0]).to.have.nested.that.includes.all.keys(['_id', 'UserId1', 'UserId2'])
        done()
      })
  })

  it('should remove friend', function (done) {
    const friend = {
      friendId: user2._id
    }
    chai
      .request(app)
      .delete('/users/friend')
      .send(friend)
      .set('token', usertoken)
      .end(function (err, res) {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res).to.be.json
        done()
      })
  })


  it('should remove friend', function (done) {
    const friend = {
      friendId: user2._id
    }
    chai
      .request(app)
      .delete('/users/friend')
      .send(friend)
      .end(function (err, res) {
        expect(err).to.be.null
        expect(res.body.message).to.equal('Unauthorized')
        expect(res).to.be.json
        done()
      })
  })

  it('shold return user data with no list friend', function (done) {
    chai
      .request(app)
      .get('/users')
      .set('token', usertoken)
      .end(function (err, res) {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res).to.be.json
        expect(res.body).to.have.nested.property('userFound')
        expect(res.body).to.have.nested.property('userFriend')
        expect(res.body.userFriend).to.be.an('array')
        expect(res.body.userFriend).to.have.lengthOf(0)
        done()
      })
  })

  it('should update user profile', function (done) {
    const updatedUser = {
      name: 'user1-Updated',
      email: 'user1@mail.com'
    }
    chai
      .request(app)
      .put('/users')
      .send(updatedUser)
      .set('token', usertoken)
      .end(function (err, res) {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res).to.be.json
        done()
      })
  })

  it('should get an error because user not login', function (done) {
    const updatedUser = {
      name: 'user1-Updated',
      email: 'user1@mail.com'
    }
    chai
      .request(app)
      .put('/users')
      .send(updatedUser)
      .end(function (err, res) {
        expect(err).to.be.null
        expect(res).to.have.status(401)
        expect(res).to.be.json
        done()
      })
  })

  it('should get an error because pasword not valid', function (done) {
    const updatedUser2 = {
      name: 'user1-Updated',
      email: 'user1@mail.com',
      password: '123'
    }
    chai
      .request(app)
      .put('/users')
      .send(updatedUser2)
      .set('token', usertoken)
      .end(function (err, res) {
        expect(err).to.be.null
        expect(res).to.have.status(400)
        expect(res).to.be.json
        done()
      })
  })

  it('should not registering new User, because email already taken', function (done) {
    chai
      .request(app)
      .post('/register')
      .send(user)
      .end(function (err, res) {
        expect(res).to.have.status(500)
        expect(res.body.err).to.have
        expect(err).to.be.null
        expect(res.body.err).to.equal('User validation failed: email: Email already taken')
        done()
      })
  })


})

describe('Route', () => {
  it('should return optimized route', function (done) {
    chai
      .request(app)
      .post('/route/routeOptimizer')
      .send({
        addresses: ['jakarta', 'semarang', 'surabaya'],
        routingType: "Straight",
      })
      .end(function (err, res) {
        expect(res).to.have.status(200)
        done()
      })
  })

  it('should return error', function (done) {
    chai
      .request(app)
      .post('/route/routeOptimizer')
      .send({})
      .end(function (err, res) {
        expect(res).to.not.have.status(200)
        done()
      })
  })

  it('should return geocoding data', function (done) {
    chai
      .request(app)
      .post('/route/getCoordinates')
      .send({
        addresses: ['jakarta']
      })
      .end(function (err, res) {
        expect(res).to.have.status(200)
        done()
      })
  })
})

describe('Places', () => {
  it('should return recomendations', function (done) {
    chai
      .request(app)
      .post('/recommendations')
      .send({
        type: 'restaurant',
        city: 'jakarta'
      })
      .end(function (err, res) {
        expect(res).to.have.status(200)
        done()
      })
  })

  it('should return error', function (done) {
    chai
      .request(app)
      .post('/recommendations')
      .send({
        city: 'jflasjdlkasjlasdjfasjdkfajsdlkfjasdfjaosidfjoiwejfoi3982uro2hgoiwhvoihw9h329hfo2ihgoiwfjoi3fu2fiosdjffjalfk'
      })
      .end(function (err, res) {
        expect(res).to.not.have.status(200)
        done()
      })
  })

  it('should return autocomplete', function (done) {
    chai
      .request(app)
      .post('/autocomplete')
      .send({
        input: 'jakarta'
      })
      .end(function (err, res) {
        expect(res).to.have.status(200)
        done()
      })
  })
})

describe('Meetup', () => {
  it('should return meetup data', function (done) {
    chai
      .request(app)
      .get('/meetups')
      .send({})
      .end(function (err, res) {
        expect(res).to.have.status(200)
        done()
      })
  })

  let meetupId = ''

  it('should add new meetup data', function (done) {
    chai
      .request(app)
      .post('/meetups')
      .send({
        origins: [{
          lat: "-6.265700",
          long: "106.782727",
        }, {
          lat: "-6.265700",
          long: "106.782727",
        }, {
          lat: "-6.265700",
          long: "106.782727",
        }]
      })
      .end(function (err, res) {
        expect(res).to.have.status(201)
        meetupId = res.body.data._id
        done()
      })
  })


  it('should not add new meetup data', function (done) {
    chai
      .request(app)
      .post('/meetups')
      .send({})
      .end(function (err, res) {
        expect(res).to.not.have.status(200)
        done()
      })
  })

  it('should update meetup data', function (done) {
    chai
      .request(app)
      .put('/meetups/' + meetupId)
      .send({})
      .end(function (err, res) {
        expect(res).to.have.status(200)
        done()
      })
  })

  it('should not update meetup data', function (done) {
    chai
      .request(app)
      .put('/meetups/a')
      .send({})
      .end(function (err, res) {
        expect(res).to.not.have.status(200)
        done()
      })
  })
})