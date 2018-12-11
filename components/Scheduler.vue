<template>
  <div id="scheduler-wrapper">
    <div v-if="!filledOut" class="row">
      <div class="col form-header">Schedule an Appointment</div>
    </div>
    <div v-if="!filledOut" class="row">
      <div id="form-wrapper" class="col">
        <div class="row">
          <div class="col">
            <form>
              <div class="form-section">
                <div class="form-section-title">
                  <p>Step 1: Select a location</p>
                </div>
                <div class="form-group">
                  <label for="appt-location">Appointment Location:</label>
                  <select
                    v-model="appointment.location"
                    v-on:change="updateLocation()"
                    class="form-control"
                    id="appt-location"
                  >
                    <option
                      v-bind:key="loc.tag"
                      v-for="loc in locations"
                      v-bind:value="loc.tag"
                    >{{ loc.name }}</option>
                  </select>
                </div>
                <div v-if="steps.one" class="address">
                  <p>
                    <strong>You've selected this location:</strong>
                  </p>
                  {{ location.name }}
                  <br>
                  {{ location.address }}
                  <br>
                  {{ location.city }}, {{ location.state }} {{ location.zip }}
                </div>
              </div>

              <div class="form-section" v-bind:class="{dim: steps.one === false}">
                <div class="form-section-title">
                  <p>Step 2: Pick an appointment time</p>
                </div>
                <div class="form-group">
                  <label for="appt-time">Appointment Time:</label>
                  <input
                    v-bind:placeholder="getTimeInputText()"
                    class="form-control"
                    type="text"
                    disabled
                    readonly
                  >
                </div>
              </div>
              <div class="form-section" v-bind:class="{dim: steps.two === false}">
                <div class="form-section-title">Step 3: Enter your personal information</div>

                <div class="form-group">
                  <label for="first-name">First Name:</label>
                  <input
                    v-bind:disabled="steps.two === false"
                    v-model="appointment.firstName"
                    type="text"
                    class="form-control"
                    id="first-name"
                  >
                </div>
                <div class="form-group">
                  <label for="last-name">Last Name:</label>
                  <input
                    v-bind:disabled="steps.two === false"
                    v-model="appointment.lastName"
                    type="text"
                    class="form-control"
                    id="last-name"
                  >
                </div>
                <div class="form-group">
                  <label for="email">Email Address:</label>
                  <input
                    v-bind:disabled="steps.two === false"
                    v-model="appointment.email"
                    type="email"
                    class="form-control"
                    id="email"
                  >
                </div>
                <div class="form-group">
                  <label for="phone">Phone Number:</label>
                  <input
                    v-bind:disabled="steps.two === false"
                    v-model="appointment.phone"
                    type="tel"
                    class="form-control"
                    id="phone"
                  >
                </div>
                <div class="form-group">
                  <label for="appt-type">Appointment Type:</label>
                  <select
                    v-bind:disabled="steps.two === false"
                    v-model="appointment.type"
                    class="form-control"
                    id="appt-type"
                  >
                    <option>First Visit</option>
                    <option>Follow-Up</option>
                  </select>
                </div>
              </div>
              <div class="form-section" v-if="errors.length">
                <b>Please correct the following error(s):</b>
                <ul>
                  <li v-for="error in errors" v-bind:key="error">{{ error }}</li>
                </ul>
              </div>
              <div class="form-section" v-bind:class="{dim: steps.three === false}">
                <button
                  v-bind:disabled="steps.three === false || steps.two === false"
                  v-on:click="checkFields()"
                  type="button"
                  class="btn btn-primary"
                >Submit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="col" v-bind:class="{dim: steps.one === false}">
        <div class="row time-picker-wrapper">
          <div class="col">
            <div class="row picker-header">
              <div class="col-2 date-button">
                <button v-if="scheduleIndex > 0" v-on:click="addDays(-1)" class="btn btn-light">-</button>
              </div>
              <div class="col-8 noselect">{{ dateText }}</div>
              <div class="col-2 date-button">
                <button
                  v-if="scheduleIndex < scheduleFiltered.length - 1"
                  class="btn btn-light"
                  v-on:click="addDays(1)"
                >+</button>
              </div>
            </div>
            <div class="row">
              <div class="col location-indicator text-center">{{ location.name }}</div>
            </div>
            <div class="row dates-wrapper">
              <div class="col">
                <div
                  class="row noselect time-slot"
                  v-for="slot in scheduleSlots"
                  v-bind:key="slot.index"
                >
                  <div class="col time-slot-time">{{ slot.text }}</div>
                  <div
                    class="col time-slot-space"
                    v-bind:class="getAppointmentClass('appt', slot.time)"
                    v-on:click="setAppointmentTimeText('appt', slot.time)"
                  >{{ getAppointmentText('appt', slot.time) }}</div>
                  <div
                    class="col time-slot-space"
                    v-bind:class="getAppointmentClass('walkin', slot.time)"
                  >{{ getAppointmentText('walkin', slot.time) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="filledOut" class="row confirmation-wrapper">
      <div class="col">
        <div class="row">
          <div class="col form-header">Please Confirm your Appointment</div>
        </div>
        <div class="row">
          <div class="col">
            <table class="confirm-list">
              <tr>
                <td>
                  <span class="bold">First Name:</span>
                </td>
                <td>{{ appointment.firstName }}</td>
              </tr>
              <tr>
                <td>
                  <span class="bold">Last Name:</span>
                </td>
                <td>{{ appointment.lastName }}</td>
              </tr>
              <tr>
                <td>
                  <span class="bold">Email:</span>
                </td>
                <td>{{ appointment.email }}</td>
              </tr>
              <tr>
                <td>
                  <span class="bold">Phone Number:</span>
                </td>
                <td>{{ appointment.phone }}</td>
              </tr>
              <tr>
                <td>
                  <span class="bold">Appointment Type:</span>
                </td>
                <td>{{ appointment.type }}</td>
              </tr>
              <tr>
                <td>
                  <span class="bold">Appointment Location:</span>
                </td>
                <td>{{ location.name }}</td>
              </tr>
              <tr>
                <td>
                  <span class="bold">Appointment Date:</span>
                </td>
                <td>{{ appointment.dateText }}</td>
              </tr>
              <tr>
                <td>
                  <span class="bold">Appointment Time:</span>
                </td>
                <td>{{ appointment.timeText }}</td>
              </tr>
            </table>
            <button v-on:click="confirm(false)" type="button" class="btn btn-default">Go Back</button>
            <router-link
              to="/confirm"
              v-on:click.native="submit()"
              tag="button"
              class="btn btn-primary"
            >Confirm</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import scheduleSlots from '~/assets/data/scheduleSlots'
import scheduleRotation from '~/assets/data/scheduleRotation'
import locations from '~/assets/data/locations'
import globals from '~/assets/data/globals'
import helpers from '~/assets/modules/helpers'
import Scheduler from '~/assets/modules/Scheduler'
import axios from 'axios'

export default {
  data() {
    return {
      appointment: {
        status: 'Booked'
      },
      appointmentSlots: null,
      date: null,
      dateRotation: null,
      dateStamp: null,
      dateText: null,
      daysAhead: globals.daysAhead,
      errors: [],
      filledOut: false,
      locations,
      openSlotsPerAppointment: 1,
      rotation: scheduleRotation,
      schedule: null,
      scheduler: null,
      scheduleFiltered: [],
      scheduleIndex: 0,
      scheduledAppointments: [],
      stepTwo: false,
      today: null
    }
  },
  created() {
    this.today = new Date()
    this.createSchedule()
  },
  computed: {
    location() {
      if (this.appointment.location) {
        return _.find(locations, { tag: this.appointment.location })
      }
      return {
        name: '',
        address: '',
        city: '',
        state: '',
        zip: ''
      }
    },
    /**
     * Filter the schedule slots so that it only shows time slots near the appointments
     */
    scheduleSlots() {
      if (this.appointmentSlots) {
        const start = Number(this.appointmentSlots[0].start) - 100
        const end = Number(
          _.maxBy(this.appointmentSlots, o => Number(o.start)).start
        )
        return scheduleSlots.filter(
          s => Number(s.time) >= start && Number(s.time) <= end + 200
        )
      }
      return scheduleSlots
    },
    steps() {
      const one = this.appointment.location || false
      let three = false
      if (
        this.appointment.firstName &&
        this.appointment.lastName &&
        this.appointment.phone &&
        this.appointment.email &&
        this.appointment.type
      ) {
        three = true
      }
      return {
        one,
        two: this.stepTwo,
        three
      }
    }
  },
  methods: {
    async createSchedule() {
      const scheduler = new Scheduler(this.today, this.daysAhead)
      await scheduler.buildSchedule()
      this.schedule = scheduler.schedule
    },
    /**
     * Runs every time the date changes
     */
    updateSchedule() {
      this.setAppointmentSlots()
      this.setDateProps()
    },
    /**
     * Runs every time the location changes
     */
    updateLocation() {
      this.scheduleIndex = 0
      this.updateSchedule()
      this.appointment.timeText = null
      this.steps.two = false
    },
    /**
     * Picks the appointment slots for the selected day
     */
    setAppointmentSlots() {
      if (this.appointment.location) {
        this.scheduleFiltered = this.schedule.filter(
          s => s.location === this.appointment.location
        )
      } else {
        this.scheduleFiltered = this.schedule
      }
      this.appointmentSlots = this.scheduleFiltered[
        this.scheduleIndex
      ].timeSlots
    },
    /**
     * Sets the relevant date properties when the schedule loads or date changes
     */
    setDateProps() {
      this.dateStamp = this.scheduleFiltered[this.scheduleIndex].dateStamp
      this.dateRotation = this.dateStamp % 14
      this.date = helpers.dateStampToDate(this.dateStamp)
      this.dateText = helpers.formatDate(this.date)
    },
    // Checks if the steps on the form have been completed
    // manually for step 2 which doesn't work in computed
    updateSteps() {
      const two = this.appointment.time || false
      this.stepTwo = two
    },
    confirm(state) {
      this.filledOut = state
    },
    /**
     * Adds or removes days from the scheduleIndex
     */
    addDays(num) {
      this.scheduleIndex += num
      this.updateSchedule()
    },
    /**
     * Finds an appointment for a specific time slot, if it exists
     */
    getAppointment(type, time) {
      const appt = _.find(
        this.appointmentSlots,
        s => s.type === type && s.slots.includes(time)
      )
      return appt
    },
    /**
     * Determines the class for the time slot
     */
    getAppointmentClass(type, time) {
      const appt = this.getAppointment(type, time)
      if (appt) {
        if (type === 'walkin') return 'walkin'
        if (type === 'appt') {
          if (Number(appt.open) - Number(appt.booked) > 0) {
            return 'appt-open'
          }
          if (Number(appt.open) - Number(appt.booked) <= 0) {
            return 'appt-booked'
          }
        }
      }
      return 'empty-slot'
    },
    /**
     * Generates the date/time text for the form when the user clicks an appointment
     */
    getTimeInputText() {
      if (this.appointment.timeText) {
        return `${this.appointment.dateText} at ${this.appointment.timeText}`
      }
      return 'Please select a time slot by clicking the schedule on the right...'
    },
    /**
     * Set the time properties for an appointment
     */
    setAppointmentTimeText(type, time) {
      if (this.steps.one === false) return
      if (type === 'appt') {
        let slot = this.getAppointmentSlot(time)
        const appt = this.getAppointment('appt', slot.time)
        slot = this.getAppointmentSlot(appt.start)
        if (appt && Number(appt.open) - Number(appt.booked) > 0) {
          this.appointment.time = appt.start
          this.appointment.timeText = slot.text
          this.appointment.dateStamp = this.dateStamp
          this.appointment.dateText = this.dateText
        }
      }
      this.$forceUpdate()
      this.updateSteps()
    },
    /**
     * Finds the appointment text for a time slot
     */
    getAppointmentText(type, time) {
      const appt = this.getAppointment(type, time)
      if (appt) {
        if (Number(appt.open) - Number(appt.booked) > 0) {
          if (appt.start === time)
            return `${appt.text}\n${helpers.convertMilitary(appt.start)}`
        }
        if (Number(appt.open) - Number(appt.booked) <= 0) {
          if (appt.start === time)
            return `Time Slot Booked\n${helpers.convertMilitary(appt.start)}`
        }
      }
      return ''
    },
    /**
     * Finds the slot for a specific time
     */
    getAppointmentSlot(time) {
      const slot = _.find(this.scheduleSlots, s => s.time === time)
      return slot
    },
    /**
     * Form validation
     */
    checkFields() {
      this.errors = []
      if (!this.validEmail(this.appointment.email)) {
        this.errors.push('Please enter a valid email address.')
      }
      if (!this.validPhone(this.appointment.phone)) {
        this.errors.push('Please enter a valid phone number.')
      }

      if (this.errors.length === 0) {
        this.confirm(true)
      }
    },
    validEmail: function(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return re.test(email)
    },
    validPhone: function(phone) {
      var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
      return re.test(phone)
    },
    // Submit the data to the backend
    async submit() {
      const apptData = this.appointment
      console.log(apptData)
      axios
        .post(`${process.env.HOST_URL}/api/add/appointment`, apptData)
        .then(function(response) {
          console.log(response)
        })
        .catch(function(error) {
          console.log(error)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/styles/theme.scss';
@import '../assets/styles/mixins.scss';

#scheduler-wrapper {
  margin-top: 50px;
}

.address {
  padding: 20px;
  background-color: #e9ecef;
  margin-bottom: 15px;
}

.picker-header {
  font-size: 24px;
  text-align: center;
}

.time-slot {
  border-left: 1px solid $border-color;
  border-right: 1px solid $border-color;
  // border-bottom: 1px solid $border-color;
  height: 50px;
}

.time-slot-space {
  margin-right: 15px;
  width: 100%;
  font-size: 14px;
}

.date-button {
  cursor: pointer;
}

.btn-light {
  font-weight: bold;
  font-size: 20px;
}

.walkin {
  background-color: rgb(169, 206, 241);
  @include box-shadow-google(1);
}

.empty-slot,
.time-slot-time {
  border-bottom: 1px solid $border-color;
}

.appt-open {
  background-color: rgb(199, 224, 199);
  cursor: pointer;
  @include box-shadow-google(1);
}

.appt-booked {
  background-color: rgb(194, 194, 194);
  @include box-shadow-google(1);
}

#form-wrapper {
  margin-right: 30px;
}

.bold {
  font-weight: bold;
}

.confirm-list {
  margin-bottom: 30px;
}

.confirm-list td {
  padding: 5px 10px;
}

.noselect {
  @include noselect();
}

.form-section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.form-header {
  margin-bottom: 30px;
}

.dim {
  opacity: 0.2;
}

.dates-wrapper {
  border-top: 1px solid $border-color;
}

.location-indicator {
  font-size: 16px;
  vertical-align: middle;
  margin-bottom: 10px;
}
</style>