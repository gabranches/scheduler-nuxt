const Connection = require('tedious').Connection,
  Request = require('tedious').Request,
  SqlString = require('sqlstring'),
  self = {}

// Create connection to database
const config = {
  server: 'gamechanger-scheduler.database.windows.net',
  authentication: {
    type: 'default',
    options: {
      userName: 'gxa292',
      password: 'GameChangerAdmin0'
    }
  },
  options: {
    database: 'gamechanger-scheduler',
    encrypt: true
  }
}

const queryDatabase = query => {
  return new Promise((resolve, reject) => {
    const connection = new Connection(config)
    connection.on('connect', err => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        console.log(query)
        const request = new Request(query, err => {
          if (err) reject(err)
        })
        const resultArr = []
        request.on('row', function(columns) {
          const rowObj = {}
          columns.forEach(function(column) {
            rowObj[column.metadata.colName] = column.value
          })
          resultArr.push(rowObj)
        })
        request.on('done', (rowCount, more) => {
          resolve(resultArr)
          connection.close()
        })
        request.on('doneProc', (rowCount, more) => {
          resolve(resultArr)
          connection.close()
        })
        request.on('error', function(err) {
          reject(err)
          connection.close()
        })
        connection.execSql(request)
      }
    })
  })
}

self.addAppointment = appointment => {
  return new Promise(async (resolve, reject) => {
    appointment.created = new Date().toISOString()
    appointment.status = 'Booked'
    const query = `INSERT INTO appointments ${insertString(appointment)}`
    try {
      const res = await queryDatabase(query)
      resolve(res)
    } catch (error) {
      reject(new Error(`Could not add apointment: ${error}`))
    }
  })
}

self.addScheduleChange = scheduleSlot => {
  return new Promise(async (resolve, reject) => {
    scheduleSlot.timeChanged = new Date().toISOString()
    scheduleSlot.timeSlots = JSON.stringify(scheduleSlot.timeSlots)
    scheduleSlot.edited = scheduleSlot.edited === true ? 1 : 0
    scheduleSlot.isRoutine = scheduleSlot.isRoutine === true ? 1 : 0
    const query = `IF EXISTS
    (SELECT 1 FROM schedule_changes WHERE dateStampRoutine = ${
      scheduleSlot.dateStampRoutine
    })
    UPDATE schedule_changes
    ${updateString(scheduleSlot)}
    WHERE dateStampRoutine = ${scheduleSlot.dateStampRoutine}
    ELSE
    INSERT INTO schedule_changes ${insertString(scheduleSlot)}`
    try {
      const res = await queryDatabase(query)
      resolve(res)
    } catch (error) {
      reject(new Error(`Could not add schedule change: ${error}`))
    }
  })
}

self.getAppointments = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM appointments'
    queryDatabase(query)
      .then(res => resolve(res))
      .catch(err => reject(err))
  })
}

self.getScheduleChanges = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM schedule_changes'
    queryDatabase(query)
      .then(res => {
        res.forEach(slot => {
          slot.timeSlots = JSON.parse(slot.timeSlots.replace(/\\/g, ''))
        })
        resolve(res)
      })
      .catch(err => reject(err))
  })
}

self.updateStatus = (id, status) => {
  return new Promise(async (resolve, reject) => {
    const query = `UPDATE appointments
    SET status = ${SqlString.escape(status)}
    WHERE id = ${id}`
    try {
      const res = await queryDatabase(query)
      resolve(res)
    } catch (error) {
      reject(new Error(`Could not update status: ${error}`))
    }
  })
}

updateString = obj => {
  let string = 'SET '
  Object.keys(obj).forEach(key => {
    string += `${key} = ${SqlString.escape(obj[key])}, `
  })
  return string.slice(0, -2)
}

insertString = obj => {
  const keys = Object.keys(obj).join(', ')
  const values = Object.values(obj)
    .map(v => SqlString.escape(v))
    .join(', ')
  return `(${keys}) VALUES (${values})`
}

const testAppt = {
  dateText: 'date',
  email: 'email',
  created: new Date().toISOString()
}

const testChange = {
  date: '2019-04-09T04:00:00.000Z',
  dateStamp: '20190419',
  dateStampRoutine: '20200419',
  dateText: 'Tuesday, April 11',
  day: 5,
  edited: false,
  isRoutine: false,
  location: 'wic-florida-city',
  locationText: 'Homestead Florida City WIC Office',
  timeSlots: [
    {
      test: 1
    },
    {
      test: 2
    }
  ]
}

// self.addAppointment(testAppt)
//   .then((res) => {
//     console.log('Appt added.')
//     process.exit()
//   })
//   .catch(err => {
//     console.log(err)
//   })

// self
//   .addScheduleChange(testChange)
//   .then(res => {
//     console.log('Change added.')
//     process.exit()
//   })
//   .catch(err => {
//     console.log(err)
//   })

// queryDatabase('SELECT * FROM appointments')
//   .then(result => {
//     console.log(result)
//   })
//   .catch(err => {
//     console.log(err)
//   })

module.exports = self
