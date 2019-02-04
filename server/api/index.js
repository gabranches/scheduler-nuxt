const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const firebase = require('../db/firebase.js')
const verify = require('../verify.js')
const logger = require('../logger.js')
const mail = require('../mail.js')

app.use(bodyParser.json())

app.post('/location', function(request, response) {
  db.insertLocation(request.body)
  response.status(200).json({ status: 'success' })
})

app.get('/status', function(request, response) {
  response.send('Running.')
})

app.get('/location', async (request, response) => {
  try {
    const data = await firebase.getLocation()
    response.json(data)
  } catch (error) {
    console.error(error)
    response.sendStatus(500)
  }
})

app.post('/update/status', async (request, response) => {
  try {
    await firebase.updateStatus(request.body.id, request.body.status)
    logger.info(`Status updated: ${JSON.stringify(request.body)}`)
    response.status(200).send('Status updated.')
  } catch (error) {
    console.error(error)
    response.status(500).send('Could not update status due to server error.')
  }
})

app.post('/update/location', async (request, response) => {
  try {
    await firebase.updateLocation(request.body)
    logger.info('Updated location: ' + request.body)
    response.sendStatus(200)
  } catch (error) {
    console.error(error)
    response.sendStatus(500)
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
    }
    const appointment = request.body.appointment
    await firebase.addAppointment(appointment)
    logger.info(`Added appointment ${JSON.stringify(appointment)}`)
    mail.send(appointment)
    response.status(200).send({
      success: true,
      text: 'Appointment added.'
    })
  } catch (error) {
    logger.error(error)
    response.status(500).send({
      success: false,
      text: 'Not able to add appointment due to server error.'
    })
  }
})

app.post('/add/schedule-change', async (request, response) => {
  try {
    await firebase.addScheduleChange(request.body)
    response.status(200).send({
      success: true,
      text: 'Schedule change successful.'
    })
    logger.info(`Schedule changed ${JSON.stringify(request.body)}`)
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
