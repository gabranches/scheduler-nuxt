<template>
  <div>
    <div class="row planner-wrapper">
      <div class="col">
        <div class="row date-pick-wrapper text-center">
          <div class="col-3 text-right">
            <span class="label">Select a schedule date to edit</span>
          </div>
          <div class="col-6 text-left">
            <select v-model="slot" class="form-control" @change="selectTimeSlot()">
              <option
                v-for="day in scheduleTidy"
                v-bind:key="day.dateStampRoutine"
                v-bind:value="day"
                v-bind:selected="slot.dateStampRoutine == day.dateStampRoutine"
              >{{ day.dateText }} - {{ day.locationText }}</option>
            </select>
          </div>
          <div class="col-3">
            <button
              class="btn btn-info"
              v-if="slot.edited"
              v-on:click="submitScheduleChange(slot)"
            >Save Changes</button>
            <button
              class="btn btn-warning"
              disabled
              v-if="slot.isRoutine && !slot.edited"
            >Routine Schedule</button>
          </div>
        </div>
        <div class="row editor-options-wrapper">
          <div class="col editor-bottom-col general-slot-options">
            <div class="row">
              <span class="small-header bold">General Options</span>
            </div>
            <div class="row slot-row">
              <div class="col">
                <span class="bold">Date</span>
                <br>
                <select v-model="slot.dateStamp" class="form-control" v-on:change="editSlot(slot)">
                  <option
                    v-for="date in upcomingDates"
                    v-bind:key="date.id"
                    v-bind:value="date.dateStamp"
                  >{{ date.dateText }}</option>
                </select>
              </div>
            </div>
            <div class="row slot-row">
              <div class="col">
                <span class="bold">Location</span>
                <br>
                <select class="form-control" v-model="slot.location" v-on:change="editSlot(slot)">
                  <option
                    v-for="location in locations"
                    v-bind:key="location.tag"
                    v-bind:value="location.tag"
                  >{{ location.name }}</option>
                </select>
              </div>
            </div>
            <div class="row slot-row">
              <button
                class="btn btn-info add-timeslot-button"
                @click="[addTimeSlot(), editSlot(slot)]"
              >Add Time Slot</button>
            </div>
          </div>
          <div class="col editor-bottom-col timeslot-select">
            <div class="row">
              <span class="small-header bold">Choose a Time Slot to Edit</span>
            </div>
            <div
              class="appt-col text-right row timeslot-button"
              v-bind:key="timeSlot.id"
              v-for="timeSlot in slot.timeSlots"
              v-bind:class="{ selected: isTimeslotSelected(timeSlot), bold: isTimeslotSelected(timeSlot)  }"
              @click="selectTimeSlot(timeSlot)"
            >{{ helpers.getApptShortText(timeSlot.type) }} - {{ helpers.convertMilitary(timeSlot.start)}}</div>
          </div>
          <div class="col editor-bottom-col timeslot-options">
            <div class="row slot-row">
              <div class="col-5 text-right bold">Time Slot Type</div>
              <div class="col-7">
                <select v-model="timeSlot.type" class="form-control" v-on:change="editSlot(slot)">
                  <option
                    v-for="type in slotTypes"
                    v-bind:key="type.type"
                    v-bind:value="type.type"
                  >{{ type.shortText }}</option>
                </select>
              </div>
            </div>
            <div class="row slot-row">
              <div class="col-5 text-right bold">Start Time</div>
              <div class="col-7">
                <select v-model="timeSlot.start" class="form-control" v-on:change="editSlot(slot)">
                  <option
                    v-for="start in scheduleSlots"
                    v-bind:key="start.time"
                    v-bind:value="start.time"
                  >{{ start.text }}</option>
                </select>
              </div>
            </div>
            <div class="row slot-row">
              <div class="col-5 text-right bold">Duration</div>
              <div class="col-7">
                <select
                  class="form-control"
                  v-model="timeSlot.duration"
                  v-on:change="editSlot(slot)"
                >
                  <option value="30">30 Minutes</option>
                  <option value="60">60 Minutes</option>
                  <option value="90">90 Minutes</option>
                </select>
              </div>
            </div>
            <div class="row slot-row">
              <div class="col-5 text-right bold">Total Slots</div>
              <div class="col-7">
                <select class="form-control" v-model="timeSlot.open" v-on:change="editSlot(slot)">
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                </select>
              </div>
            </div>
            <div class="row slot-row">
              <div class="col-5 text-right bold">Booked Slots</div>
              <div class="col-7" v-bind:class="classBooked(timeSlot.booked)">{{ timeSlot.booked }}</div>
            </div>
            <div class="row slot-row">
              <div class="col-5 text-right bold"></div>
              <div class="col-7">
                <div class="row slot-row">
                  <button
                    class="btn btn-danger add-timeslot-button"
                    @click="[deleteTimeSlot(), editSlot(slot)]"
                    v-show="slot.timeSlots.length > 1"
                  >Delete Time Slot</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import axios from 'axios'
import helpers from '~/assets/modules/helpers'
import Scheduler from '~/assets/modules/Scheduler'
import locations from '~/assets/data/locations'
import slotTypes from '~/assets/data/slotTypes'
import globals from '~/assets/data/globals'
import scheduleSlots from '~/assets/data/scheduleSlots'

export default {
  props: {
    scheduler: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      daysAhead: globals.daysAhead,
      today: null,
      filters: {
        upcoming: true
      },
      helpers,
      locations,
      originalSchedule: null,
      slot: null,
      slotTypes,
      scheduleSlots,
      timeSlot: null,
      upcomingDates: []
    }
  },
  created() {
    this.today = new Date()
    this.generateDays()
    this.originalSchedule = _.cloneDeep(this.scheduler.schedule)
    this.slot = this.scheduleTidy[0]
    this.timeSlot = this.slot.timeSlots[0]
  },
  computed: {
    scheduleTidy() {
      return this.scheduler.schedule.map(t => {
        t.date = helpers.dateStampToDate(t.dateStamp)
        t.dateText = helpers.formatDate(t.date)
        t.locationText = _.find(locations, { tag: t.location }).name
        t.isRoutine = Scheduler.isRoutine(t)
        t.timeSlots = _.orderBy(t.timeSlots, 'start', 'asc')
        return t
      })
    }
  },
  methods: {
    selectTimeSlot(timeSlot) {
      if (timeSlot) {
        this.timeSlot = timeSlot
      } else {
        this.timeSlot = this.slot.timeSlots[0]
      }
    },
    isTimeslotSelected(timeSlot) {
      return timeSlot == this.timeSlot
    },
    addTimeSlot() {
      const totalSlots = this.slot.timeSlots.length
      const newSlot = _.cloneDeep(this.slot.timeSlots[totalSlots - 1])
      newSlot.booked = "0"
      this.slot.timeSlots.push(newSlot)
      this.timeSlot = this.slot.timeSlots[totalSlots]
    },
    deleteTimeSlot() {
      this.slot.timeSlots = _.filter(this.slot.timeSlots, timeSlot => {
        return timeSlot !== this.timeSlot
      })
      this.timeSlot = this.slot.timeSlots[0]
    },
    generateDays() {
      const dates = []
      for (let i = 0; i < this.daysAhead; i += 1) {
        const day = helpers.addDays(this.today, i)
        dates.push({
          dateStamp: helpers.dateStamp(day),
          dateText: helpers.formatDate(day, true)
        })
      }
      this.upcomingDates = dates
    },
    classBooked(num) {
      if (num > 0) {
        return 'red'
      }
      return ''
    },
    async updateStatus(appt, status) {
      try {
        await this.$http.post(`${process.env.HOST_URL}/api/update/status`, {
          id: appt.id,
          status
        })
        console.log('Status updated.')
        await this.scheduler.buildSchedule()
      } catch (error) {
        console.error(error)
      }
    },
    editSlot(slot) {
      slot.edited = true
    },
    /**
     * Submit schedule change to backend
     */
    async submitScheduleChange(scheduleSlot) {
      scheduleSlot.timeChanged = new Date()
      try {
        scheduleSlot.edited = false
        await axios.post(
          `${process.env.HOST_URL}/api/add/schedule-change`,
          scheduleSlot
        )
        console.log('Schedule change submitted.')
      } catch (error) {
        scheduleSlot.edited = true
        console.error(error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/styles/theme.scss';
@import '~/assets/styles/mixins.scss';

* {
  font-size: 14px;
}

.slot-row {
  line-height: 30px;
  margin-bottom: 10px;
}

.planner-row {
  margin: 20px 0px;
}

.planner-right > .row > .col {
  border-right: 1px solid #dee2e6;
  padding: 0 20px;
}

.planner-row select {
  min-width: 60px;
}

.planner-left {
  background-color: #dee2e6;
  padding: 20px;
  width: 250px;
}

.planner-left select {
  width: 180px;
}

.planner-right {
  background-color: #f3f3f3;
  padding: 20px;
}

.date-pick-wrapper {
  background-color: #dee2e6;
  div {
    margin: 15px 0;
  }
  .label {
    font-weight: bold;
    line-height: 35px;
  }
}

.editor-options-wrapper {
  background-color: #f3f3f3;
}

.editor-bottom-col {
  padding: 15px;
}

.timeslot-button {
  // font-size: 14px;
  padding: 5px 15px;
  margin: 5px 0px;
  cursor: pointer;
}

.timeslot-select {
  padding-right: 0px;
}

.timeslot-options {
  background-color: rgba(23, 162, 184, 0.22);
  border-left: 5px solid #17a2b8;
  padding: 30px;
  // color: white;
}

.selected {
  background-color: #17a2b8;
  color: white;
}

.general-slot-options {
  padding: 15px 45px;
  select {
    // width: 200px;
  }
}

.small-header {
  font-size: 16px;
  margin-bottom: 10px;
}

.add-timeslot-button {
  margin-top: 15px;
  margin-left: 15px;
}
</style>
