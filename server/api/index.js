const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const firebase = require('../db/firebase.js')
const azureSQL = require('../db/azureSQL.js')
const verify = require('../verify.js')
const logger = require('../logger.js')
const mail = require('../mail.js')

app.use(bodyParser.json())

app.get('/status', function(request, response) {
  response.send('Running.')
})

app.get('/appointments', (request, response) => {
  azureSQL.getAppointments()
    .then(res => response.json(res))
    .catch(err => console.log(err))
})

app.get('/schedule-changes', (request, response) => {
  azureSQL.getScheduleChanges()
    .then(res => response.json(res))
    .catch(err => console.log(err))
})

app.post('/update/status', async (request, response) => {
  try {
    await azureSQL.updateStatus(request.body.id, request.body.status)
    // logger.info(`Status updated: ${JSON.stringify(request.body)}`)
    response.status(200).send('Status updated.')
  } catch (error) {
    logger.error(error)
    response.status(500).send('Could not update status due to server error.')
  }
})

app.post('/add/appointment', async (request, response) => {
  try {
    const captcha = await verify(request)
    if (!captcha.success) {
      response.status(200).send({
        success: false,
        text: 'Failed to verify captcha.'
      })
      console.log('Captcha failed.')
    } else {
      const appointment = request.body.appointment
      await azureSQL.addAppointment(appointment)
      // logger.info(`Added appointment ${JSON.stringify(appointment)}`)
      await mail.send(appointment)
      response.status(200).send({
        success: true,
        text: 'Appointment added.'
      })
    }
  } catch (error) {
    logger.error(error.toString())
    response.status(500).send({
      success: false,
      text: 'Not able to add appointment due to server error.'
    })
  }
})

app.post('/add/schedule-change', async (request, response) => {
  try {
    await azureSQL.addScheduleChange(request.body)
    response.status(200).send({
      success: true,
      text: 'Schedule change successful.'
    })
    // logger.info(`Schedule changed ${JSON.stringify(request.body)}`)
  } catch (error) {
    logger.error(error)
    response
      .status(500)
      .send('Could not make schedule change due to server error.')
  }
})

module.exports = {
  path: '/api',
  handler: app
}
