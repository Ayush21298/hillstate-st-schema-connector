const axios = require('axios')

const authController = require('./auth')

const baseUrl = 'https://hillstategwanggyo.hthomeservice.com'
const statusUrl = baseUrl + '/proxy/core/device/status/all/get'
const commandUrl = baseUrl + '/proxy/core/homepage/device/command'

const houseLoc = require('../house/location.json')
const devices = require('../house/devices.json')
const capabilityFile = require('../house/capability.json')


module.exports = {
  getStatus: function (req, res) {
    discoveryRequest().then(function (result) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      console.log(result)
      res.write(JSON.stringify(result))
      res.end()
    }).catch(function (error) {
      console.log(error)
      return res.status(500).json({
        message: 'Error getting device status',
        error: error
      })
    })
  },

  setStatus: function (req, res) {
  }
}
