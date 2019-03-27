const express = require('express')
const router = express.Router()
const MeetupController = require('../controllers/MeetupController')

router.get('/', MeetupController.findAll)
router.post('/', MeetupController.create)
router.put('/:id', MeetupController.update)

module.exports = router