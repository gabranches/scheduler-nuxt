require('dotenv').config();
const firebase = require('firebase');
const self = {};

const projectId = process.env.DB_ID;

// Initialize Firebase
const config = {
  apiKey: "AIzaSyCP4GIk3idTnuAu7sFsdGohxMFgFmfCFxM",
  authDomain: projectId + ".firebaseapp.com",
  databaseURL: "https://" + projectId + ".firebaseio.com",
  projectId: projectId,
  storageBucket: projectId + ".appspot.com",
  messagingSenderId: "856849552430"
};

firebase.initializeApp(config);

self.updateStatus = (id, status) => {
  return new Promise(async (resolve, reject) => {
    const ref = firebase.database().ref('/appointments');
    const appt = ref.child(id);
    // Save check-in time if the update is a
    if (status === 'Checked-In') {
      const time = new Date()
      try {
        await appt.update({ checkInTime: time })
        resolve();  
      } catch (error) {
        reject(error);
      }
    }
    try {
      await appt.child('status').set(status);
      resolve();  
    } catch (error) {
      reject(error);
    }
  })
}

self.getLocation = () => {
  return new Promise((resolve, reject) => {
    const ref = firebase.database().ref('/location');
    ref.on('value', (data) => {
      if(data.val()) {
        resolve(data.val());
      }
      reject('No data.');
    });
  })
}

self.updateLocation = (location) => {
  return new Promise(async (resolve, reject) => {
    const ref = firebase.database().ref('/');
    console.log(location);
    const newLoc = {
      latitude: Number(location['coords[latitude]']),
      longitude: Number(location['coords[longitude]']),
      accuracy: Number(location['coords[accuracy]']),
      heading: Number(location['coords[heading]']),
      speed: Number(location['coords[speed]']),
      timestamp: Number(location.timestamp),
    };

    try {
      await ref.child('location').set(newLoc);
      resolve();
    } catch (error) {
      reject(error);
    }

  })
}

self.addAppointment = (appointment) => {
  return new Promise(async (resolve, reject) => {
    const ref = firebase.database().ref('/appointments');
    try {
      await ref.push(appointment);
      resolve();
    } catch (error) {
      reject(error);
    }
  })
}

self.addScheduleChange = (change) => {
  return new Promise(async (resolve, reject) => {
    const ref = firebase.database().ref('/schedule-changes');
    const query = ref.orderByChild('dateStampRoutine').equalTo(change.dateStampRoutine);

    query.once("child_added", function(snapshot) {
      if (snapshot.hasChildren()) {
        if (change.isRoutine) {
          snapshot.ref.remove();
        } else {
          snapshot.ref.update(change);
        }
      }
    });

    query.once("value", function(snapshot) {
      if (!snapshot.hasChildren()) {
        ref.push(change);
      }
    });
    resolve();
  })
}

module.exports = self;
