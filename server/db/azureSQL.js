const Connection = require('tedious').Connection
const Request = require('tedious').Request

const self = {}

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
        request.on('doneProc', (rowCount, more) => {
          resolve(resultArr)
        })
        connection.execSql(request)
      }
    })
  })
}

// queryDatabase('SELECT * FROM appointments')
//   .then(result => {
//     console.log(result)
//   })
//   .catch(err => {
//     console.log(err)
//   })

const testAppt = {
  dateText: 'date',
  email: 'email',
  created: new Date().toISOString()
}

self.addAppointment = appointment => {
  return new Promise(async (resolve, reject) => {
    appointment.created = new Date().toISOString()
    const keys = Object.keys(appointment).join(', ')
    const values = Object.values(appointment)
      .map(v => `'${v}'`)
      .join(', ')
    const query = `INSERT INTO appointments (${keys}) VALUES (${values})`
    try {
      const res = await queryDatabase(query)
      resolve(res)
    } catch (error) {
      reject(new Error(`Could not add apointment: ${error}`))
    }
  })
}

// self.addAppointment(testAppt)
//   .then((res) => {
//     console.log('Appt added.')
//     process.exit()
//   })
//   .catch(err => {
//     console.log(err)
//   })

module.exports = self
