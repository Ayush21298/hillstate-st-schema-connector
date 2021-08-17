const axios = require('axios')

const authController = require('./auth')

const baseUrl = 'https://hillstategwanggyo.hthomeservice.com'
const statusUrl = baseUrl + '/proxy/core/device/status/all/get'
const commandUrl = baseUrl + '/proxy/core/homepage/device/command'

const houseLoc = require('../house/location.json')
const devices = require('../house/devices.json')

module.exports = {
  getStatus: function (req, res) {
    axios.post(statusUrl, houseLoc, {
      params: {
        access_token: process.env.ACCESS_TOKEN || 'access_token'
      }
    })
      .then(function (response) {
        console.log(response)
        const out = {
          headers: {
            schema: 'st-schema',
            version: '1.0',
            interactionType: 'discoveryResponse',
            requestId: 'abc-123-456'
          },
          devices: [{
            externalDeviceId: 'fake-c2c-dimmer',
            friendlyName: 'Virtual Switch',
            deviceHandlerType: 'c2c-dimmer',
            manufacturerInfo: {
              manufacturerName: 'SmartThings',
              modelName: 'Virtual SmartThings device',
              hwVersion: 'v1 US bulb',
              swVersion: '23.123.231'
            }
          }]
        }
        return res.status(200).json({
          message: 'Device status received',
          data: response.data.deviceStatusAllList[0].deviceList
        })
      })
      .catch(function (error) {
        console.log(error)
        if (error.response.statusText === 'Unauthorized') {
          authController.login()
          return module.exports.getStatus(req, res)
        } else {
          return res.status(500).json({
            message: 'Error getting device status',
            error: error
          })
        }
      })
  },

  setStatus: function (req, res) {
  }
}
