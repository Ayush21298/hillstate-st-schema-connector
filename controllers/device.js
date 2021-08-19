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
    let response
    const { headers, devices, callbackAuthentication } = req.body
    const { interactionType, requestId } = headers
    console.log('request type: ', interactionType)
    try {
      switch (interactionType) {
        case 'discoveryRequest':
          discoveryRequest(requestId).then(function (result) {
            res.send(result)
          }).catch(function (error) {
            return res.status(500).json({
              message: 'Error interacting',
              error: error
            })
          })
          return
        case 'commandRequest':
          commandRequest(requestId, devices).then(function (result) {
            res.send(result)
          }).catch(function (error) {
            return res.status(500).json({
              message: 'Error interacting',
              error: error
            })
          })
          return
        case 'stateRefreshRequest':
          stateRefreshRequest(requestId, devices).then(function (result) {
            res.send(result)
          }).catch(function (error) {
            return res.status(500).json({
              message: 'Error interacting',
              error: error
            })
          })
          return
        case 'grantCallbackAccess':
          response = grantCallbackAccess(callbackAuthentication)
          break
        case 'integrationDeleted':
          console.log('integration to SmartThings deleted')
          break
        default:
          response = 'error. not supported interactionType' + interactionType
          console.log(response)
          break
      }
    } catch (ex) {
      console.log('failed with ex', ex)
    }
    if (response) {
      res.send(response)
    }
  }
}
