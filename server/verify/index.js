const axios = require('axios')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.json())

app.get('/', function(request, response) {
  if (
    request.body.captcha === undefined ||
    request.body.captcha === '' ||
    request.body.captcha === null
  ) {
    return response.json({ success: false, body: 'Please complete the captcha.' })
  }

  const secretKey = '6LdRSIwUAAAAAFzWXZ16003wqLgOuP9tvLcGffEx'

  const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${
    request.body.captcha
  }&remoteip=${request.connection.remoteAddress}`

  axios(verifyUrl, (err, response, body) => {
    body = JSON.parse(body)
    if (body.success !== undefined && !body.success) {
      return response.json({ success: false, body: 'Failed to verify captcha.' })
    }
    return response.json({ success: true, body: 'Captcha verified.' })
  })
})

module.exports = {
  path: '/verify',
  handler: app
}
