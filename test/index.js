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
        return User.create({ name: 'user2', email: 'user2@mail.com', password: 'user2' })
      })
      .then(data => {
        user2 = data
      })
    done()
  })


  const user = {
    name: 'user1',
    email: 'user1@mail.com',
    password: 'user1'
  }

  it('should registering new User', function(done) {
    chai
      .request(app)
      .post('/register')
      .send(user)
      .end(function(err, res) {
        expect(err).to.be.null
        expect(res).to.have.status(201)
        expect(res).to.be.json
        expect(res.body).to.have.nested.property('user')
          .that.includes.all.keys(['_id', 'email', 'password'])
        done()
      })
  })

  it('should login user', function(done) {
    const userLogin = {
      email: 'user1@mail.com',
      password: 'user1'
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
  
  it('should add friend', function(done) {
    const friend = {
      friendId : user2._id
    }
    chai
      .request(app)
      .post('/users/friend')
      .send(friend)
      .set('token', usertoken)
      .end(function(err, res) {
        expect(err).to.be.null
        expect(res).to.have.status(201)
        expect(res).to.be.json
        expect(res.body).to.have.nested.property('UserId1')
        expect(res.body).to.have.nested.property('UserId2')
        done()
      })
  })

  it('should get user data', function(done) {
    chai 
      .request(app)
      .get('/users')
      .set('token', usertoken)
      .end(function(err, res) {
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

  it('should remove friend', async function() {
    const friend = {
      friendId : user2._id
    }
    const response = await chai
      .request(app)
      .delete('/users/friend')
      .send(friend)
      .set('token', usertoken)
      // .end(function(err, res) {
      //   expect(err).to.be.null
      //   expect(res).to.have.status(200)
      //   expect(res).to.be.json
      //   done()
      // })
      expect(res).to.have.status(200)
      expect(res).to.be.json
  })

  it('shold return user data with no list friend', function(done) {
    chai 
      .request(app)
      .get('/users')
      .set('token', usertoken)
      .end(function(err, res) {
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
})


it('should update user profile', function(done) {
  const updatedUser = {
    name: 'user1-Updated',
    email: 'user1@mail.com'
  }

  chai
    .request(app)
    .put('/users')
    .send(updatedUser)
    .set('token', usertoken)
    .end(function(err, res) {

    })
})

