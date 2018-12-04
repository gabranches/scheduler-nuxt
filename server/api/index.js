const bodyParser = require('body-parser')
const express = require('express')
const app = express();
const firebase = require('../db/firebase.js')

app.use( bodyParser.json() );    

app.post('/', function(request, response) {
    db.insertLocation(request.body);
    response.status(200).json({status: 'success'});
  });
  
  app.get('/status', function(request, response) {
    response.send('<html><body>Running.</body><html>');
  });
  
  app.get('/location', async (request, response) => {
    try {
      const data = await firebase.getLocation();
      response.json(data);
    } catch (error) {
      console.error(error);
      response.sendStatus(500);
    }
  });
  
  app.post('/update/status', async (request, response) => {
    try {
      await firebase.updateStatus(request.body.id, request.body.status);
      response.sendStatus(200);
    } catch (error) {
      console.error(error);
      response.sendStatus(500);
    }
  });
  
  app.post('/update/location', async (request, response) => {
    try {
      await firebase.updateLocation(request.body);
      response.sendStatus(200);
    } catch (error) {
      console.error(error);
      response.sendStatus(500);
    }
  });
  
  app.post('/add/appointment', async (request, response) => {
    try {
      await firebase.addAppointment(request.body);
      console.log(request.body)
      response.sendStatus(200);
    } catch (error) {
      console.error(error);
      response.sendStatus(500);
    }
  });
  
  app.post('/add/schedule-change', async (request, response) => {
    try {
      await firebase.addScheduleChange(request.body);
      response.sendStatus(200);
    } catch (error) {
      console.error(error);
      response.sendStatus(500);
    }
  });
  
module.exports = {
    path: '/api',
    handler: app,
}
