const axios = require('axios')
const updateDotenv = require('update-dotenv')

const authUrl = 'https://www2.hthomeservice.com'
const loginUrl = authUrl + '/proxy/htservice/oauth/token'

const username = process.env.HILLSTATE_USERNAME || 'User'
const password = process.env.HILLSTATE_PASSWORD || 'Password'

module.exports = {
  login: function (req, res) {
    axios.post(loginUrl, {
      username: username,
      password: password
    })
      .then(function (response) {
        updateDotenv({
          ACCESS_TOKEN: response.data.access_token
        }).then((newEnv) => console.log('Updated ACCESS_TOKEN!', newEnv))
        if (res) {
          return res.status(200).json({
            message: 'Login Sucessful',
            data: response.data
          })
        }
      })
      .catch(function (error) {
        console.log(error)
        if (res) {
          return res.status(500).json({
            message: "Can't Login",
            error: error
          })
        }
      })
  }
}
