require('dotenv').config()
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

self = {}

const defaults = {
  from: 'gxa292@miami.edu',
  subject: 'Your Sylvester Game Changer Appointment'
}

applyHtmlTemplate = appointment => {
  return `
<table class="confirm-list">
<tr>
  <td>
    <span class="bold">First Name:</span>
  </td>
  <td>${appointment.firstName}</td>
</tr>
<tr>
  <td>
    <span class="bold">Last Name:</span>
  </td>
  <td>${appointment.lastName}</td>
</tr>
<tr>
  <td>
    <span class="bold">Email:</span>
  </td>
  <td>${appointment.email}</td>
</tr>
<tr>
  <td>
    <span class="bold">Phone Number:</span>
  </td>
  <td>${appointment.phone}</td>
</tr>
<tr>
  <td>
    <span class="bold">Appointment Type:</span>
  </td>
  <td>${appointment.type}</td>
</tr>
<tr>
  <td>
    <span class="bold">Appointment Location:</span>
  </td>
  <td>${appointment.location}</td>
</tr>
<tr>
  <td>
    <span class="bold">Appointment Date:</span>
  </td>
  <td>${appointment.dateText}</td>
</tr>
<tr>
  <td>
    <span class="bold">Appointment Time:</span>
  </td>
  <td>${appointment.timeText}</td>
</tr>
</table>
`
}

self.send = appointment => {
  const msg = {}
  msg.html = applyHtmlTemplate(appointment)
  sgMail.send({ ...defaults, to: appointment.email, ...msg })
}

module.exports = self
