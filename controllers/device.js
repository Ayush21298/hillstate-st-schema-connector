const axios = require('axios')

const authController = require('./auth')

const baseUrl = 'https://hillstategwanggyo.hthomeservice.com'
const statusUrl = baseUrl + '/proxy/core/device/status/all/get'
const commandUrl = baseUrl + '/proxy/core/homepage/device/command'

const houseLoc = require('../house/location.json')
const devices = require('../house/devices.json')
const capabilityFile = require('../house/capability.json')

class TwoWayMap {
  constructor (map) {
    this.map = map
    this.reverseMap = {}
    for (const key in map) {
      const value = map[key]
      this.reverseMap[value] = key
    }
  }

  get (key) { return this.map[key] }
  revGet (key) { return this.reverseMap[key] }
}

const capability = new TwoWayMap(capabilityFile)

function grantCallbackAccess (callbackAuthentication) {
  console.log('grantCallbackAccess token is:', callbackAuthentication.code)
  console.log('grantCallbackAccess clientId is:', callbackAuthentication.clientId)
  return {}
}

function listDevices (inDeviceList) {
  const outDeviceList = []
  for (const inDevice of inDeviceList) {
    if (devices[inDevice.deviceId]) {
      outDeviceList.push({
        externalDeviceId: inDevice.deviceId,
        friendlyName: devices[inDevice.deviceId].friendlyName,
        deviceHandlerType: devices[inDevice.deviceId].deviceHandlerType,
        manufacturerInfo: {
          manufacturerName: 'Ayush21298',
          modelName: inDevice.deviceType,
          hwVersion: inDevice.deviceType,
          swVersion: inDevice.deviceType
        },
        deviceContext: {
          roomName: devices[inDevice.deviceId].roomName,
          categories: devices[inDevice.deviceId].categories
        }
      })
    }
  }
  console.log(outDeviceList)
  return outDeviceList
}

function makeState (inDevice) {
  const response = { externalDeviceId: inDevice.deviceId, states: [] }
  const health = { component: 'main', capability: 'st.healthCheck', attribute: 'healthStatus', value: capability.get(inDevice.deviceState) }
  response.states.push(health)
  for (const props of inDevice.devicePropertyList) {
    const state = { component: 'main', capability: capability.get(props.name), attribute: 'switch', value: props.value }
    response.states.push(state)
  }
  return response
}

function findState (inDeviceList, findDeviceId) {
  for (const inDevice of inDeviceList) {
    if (inDevice.deviceId === findDeviceId) {
      return makeState(inDevice)
    }
  }
}

function discoveryRequest (requestId) {
  return new Promise((resolve, reject) => {
    axios.post(statusUrl, houseLoc, {
      params: {
        access_token: process.env.ACCESS_TOKEN || 'access_token'
      }
    })
      .then(function (response) {
        const out = {
          headers: {
            schema: 'st-schema',
            version: '1.0',
            interactionType: 'discoveryResponse',
            requestId: requestId
          },
          devices: listDevices(response.data.deviceStatusAllList[0].deviceList)
        }
        resolve(out)
      })
      .catch(function (error) {
        console.log(error)
        try {
          if (error.response.statusText === 'Unauthorized') {
            authController.login()
            return discoveryRequest(requestId)
          } else {
            reject(error)
          }
        } catch (err) {
          reject(error)
        }
      })
  })
}



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
