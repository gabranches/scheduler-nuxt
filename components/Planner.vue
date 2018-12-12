<template>
  <div>
    <div class="row planner-row" v-bind:key="slot.dateStampRoutine" v-for="slot in scheduleTidy">
      <div class="planner-left">
        <div class="row slot-row">
          <div class="col">Date:
            <br>
            <select v-model="slot.dateStamp" v-on:change="editSlot(slot)">
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
            <div class="row slot-row">
              <div class="col">Location:
                <br>
                <select v-model="slot.location" v-on:change="editSlot(slot)">
                  <option
                    v-for="location in locations"
                    v-bind:key="location.tag"
                    v-bind:value="location.tag"
                  >{{ location.name }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="row slot-row">
          <div class="col">
            <button
              class="btn btn-danger"
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
      </div>
      <div class="planner-right">
        <div class="row">
          <div
            class="appt-col text-right col"
            v-bind:key="timeSlot.start"
            v-for="timeSlot in slot.timeSlots"
          >
            <div class="row slot-row">
              <div class="col">Type:</div>
              <div class="col">
                <select v-model="timeSlot.type" v-on:change="editSlot(slot)">
                  <option
                    v-for="type in slotTypes"
                    v-bind:key="type.type"
                    v-bind:value="type.type"
                  >{{ type.shortText }}</option>
                </select>
              </div>
            </div>
            <div class="row slot-row">
              <div class="col">Start Time:</div>
              <div class="col">
                <select v-model="timeSlot.start" v-on:change="editSlot(slot)">
                  <option
                    v-for="start in scheduleSlots"
                    v-bind:key="start.time"
                    v-bind:value="start.time"
                  >{{ start.text }}</option>
                </select>
              </div>
            </div>
            <div class="row slot-row">
              <div class="col">Duration:</div>
              <div class="col">
                <select v-model="timeSlot.duration" v-on:change="editSlot(slot)">
                  <option value="0">Remove Slot</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">60 Minutes</option>
                  <option value="90">90 Minutes</option>
                </select>
              </div>
            </div>
            <div class="row slot-row">
              <div class="col">Total Slots:</div>
              <div class="col">
                <select v-model="timeSlot.open" v-on:change="editSlot(slot)">
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
              <div class="col">Booked Slots:</div>
              <div class="col" v-bind:class="classBooked(timeSlot.booked)">{{ timeSlot.booked }}</div>
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
      locations,
      originalSchedule: null,
      slotTypes,
      scheduleSlots,
      upcomingDates: []
    }
  },
  created() {
    this.today = new Date()
    this.generateDays()
    this.originalSchedule = _.cloneDeep(this.scheduler.schedule)
  },
  computed: {
    scheduleTidy() {
      return this.scheduler.schedule.map(t => {
        t.date = helpers.dateStampToDate(t.dateStamp)
        t.dateText = helpers.formatDate(t.date)
        t.locationText = _.find(locations, { tag: t.location }).name
        t.isRoutine = Scheduler.isRoutine(t)
        return t
      })
    }
  },
  methods: {
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
  line-height: 40px;
}

.planner-row {
  // margin: 0px 0;
  margin-bottom: 15px;
}

// .planner-mid > .row {
//   overflow-x: auto;
//   white-space: nowrap;
// }
.planner-right > .row > .col {
  border-right: 1px solid #dee2e6;
  padding: 0 20px;
}

.planner-row select {
  min-width: 60px;
}

.planner-left {
  background-color: #dee2e6;
  padding: 15px;
  // width: 250px;
}

.planner-left select {
  width: 180px;
}

.planner-right {
  background-color: #f3f3f3;
  padding: 15px;
}
</style>
