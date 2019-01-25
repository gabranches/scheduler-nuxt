const request = require('request')

module.exports = req => {
  return new Promise((resolve, reject) => {
    if (
      req.body.captcha === undefined ||
      req.body.captcha === '' ||
      req.body.captcha === null
    ) {
      resolve({
        success: false,
        body: 'Please complete the captcha.'
      })
    }

    const secretKey = process.env.CAPTCHA_SECRET

    const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${
      req.body.captcha
    }&remoteip=${req.connection.remoteAddress}`

    request(verifyUrl, (err, response, body) => {
      body = JSON.parse(body)
      if (body.success !== undefined && !body.success) {
        resolve({
          success: false,
          body: 'Failed to verify captcha.'
        })
      }
      resolve({ success: true, body: 'Captcha verified.' })
    })
  })
}
