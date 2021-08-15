const express = require('express')
const router = express.Router()

const deviceController = require('../controllers/device')

router.get('/', deviceController.getStatus)
router.post('/', deviceController.setStatus)

module.exports = router
