const axios = require('axios')

const auth_url = 'https://www2.hthomeservice.com'
const login_url = auth_url + '/proxy/htservice/oauth/token'
const username = process.env.HILLSTATE_USERNAME || 'User'
const password = process.env.HILLSTATE_PASSWORD || 'Password'

module.exports = {
  login: function(req, res) {
    axios.post(login_url, {
      username: username,
      password: password
    })
    .then(function(response) {
      console.log(response);
      return res.status(200).json({
        message: "Login Sucessful",
        data: response.data
      })
    })
    .catch(function(error) {
      console.log(error);
      return res.status(500).json({
        message: "Can't Login",
        error: error
      })
    })
  }
}
