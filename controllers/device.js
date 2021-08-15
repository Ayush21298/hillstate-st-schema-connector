const axios = require('axios')

const authController = require('./auth')

const base_url = 'https://hillstategwanggyo.hthomeservice.com'
const status_url = base_url + '/proxy/core/device/status/all/get'
const command_url = base_url + '/proxy/core/homepage/device/command'

const houseLoc = require('../house/location.json')

module.exports = {
  getStatus: function(req, res) {
    axios.post(status_url, houseLoc, {
      params: {
        access_token: process.env.ACCESS_TOKEN || 'access_token'
      },
    })
    .then(function(response) {
      console.log(response);
      return res.status(200).json({
        message: "Device status received",
        data: response.data
      })
    })
    .catch(function(error) {
      console.log(error);
      if(error.response.statusText == 'Unauthorized') {
        authController.login()
        return module.exports.getStatus(req, res)
      } else {
        return res.status(500).json({
          message: "Error getting device status",
          error: error
        })
      }
    })
  },

  setStatus: function(req, res) {
  }
}
