<template>
  <div>
    <div class="row">
      <div class="col">
        <ul class="nav nav-tabs">
          <li class="nav-item clickable noselect" v-on:click="setUpcoming('upcoming')">
            <a id="upcoming-tab" class="nav-link active">Upcoming Appointments</a>
          </li>
          <li class="nav-item clickable noselect" v-on:click="setUpcoming('past')">
            <a id="past-tab" class="nav-link">Past Appointments</a>
          </li>
        </ul>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Location</th>
              <th>Time</th>
              <th>Name</th>
              <th>Status</th>
              <th>Type</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-bind:key="appt.id" v-for="appt in apptsFiltered">
              <td class="align-middle">{{appt.dateText}}</td>
              <td class="align-middle">{{ helpers.locationShort(appt.location) }}</td>
              <td class="align-middle">{{appt.timeText}}</td>
              <td class="align-middle clickable">
                <div v-on:click="toggleDetails(appt)">{{appt.firstName}} {{appt.lastName}}</div>
                <div v-on:click="toggleDetails(appt)" v-if="showDetails">{{appt.phone}}</div>
                <div v-on:click="toggleDetails(appt)" v-if="showDetails">{{appt.email}}</div>
              </td>
              <td class="align-middle" v-bind:class="classStatus(appt.status)">{{appt.status}}</td>
              <td class="align-middle">{{appt.type}}</td>
              <td class="align-middle">
                <button
                  v-if="appt.status === 'Booked'"
                  v-on:click="updateStatus(appt, 'Checked-In')"
                  class="btn btn-info"
                >Check-In</button>
                <button
                  v-if="appt.status === 'Checked-In'"
                  v-on:click="updateStatus(appt, 'Booked')"
                  class="btn btn-light"
                >Undo Check-In</button>
              </td>
              <td class="align-middle">
                <button
                  v-if="appt.status === 'Booked' || appt.status === 'Checked-In'"
                  v-on:click="updateStatus(appt, 'Canceled')"
                  class="btn btn-danger"
                >Cancel</button>
                <button
                  v-if="appt.status === 'Canceled'"
                  v-on:click="updateStatus(appt, 'Booked')"
                  class="btn btn-light"
                >Undo Cancel</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import $ from 'jquery'
import axios from 'axios'
import helpers from '~/assets/modules/helpers'

export default {
  props: {
    scheduler: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      today: null,
      helpers,
      filters: {
        upcoming: true
      },
      showDetails: false,
    }
  },
  created() {
    this.today = new Date()
  },
  computed: {
    apptsFiltered() {
      const order = this.filters.upcoming ? 'asc' : 'desc'
      const dateStamp = helpers.dateStamp(this.today)
      let appts = null
      if (this.filters.upcoming) {
        appts = _.filter(
          this.scheduler.appointments,
          a => a.dateStamp >= dateStamp
        )
      } else {
        appts = _.filter(
          this.scheduler.appointments,
          a => a.dateStamp < dateStamp
        )
      }
      return _.orderBy(appts, ['dateStamp', 'time'], [order, order])
    }
  },
  methods: {
    toggleDetails(appt) {
      if (this.showDetails) {
        this.showDetails = false
      } else {
        this.showDetails = true
      }
    },
    setUpcoming(name) {
      $('.nav-link').removeClass('active')
      $(`#${name}-tab`).addClass('active')
      if (name === 'upcoming') {
        this.filters.upcoming = true
      } else {
        this.filters.upcoming = false
      }
    },
    classStatus(status) {
      if (status === 'Booked') {
        return 'green'
      }
      if (status === 'Checked-In') {
        return 'teal'
      }
      return 'red'
    },
    async updateStatus(appt, status) {
      try {
        await axios.post(`${process.env.HOST_URL}/api/update/status`, {
          id: appt.id,
          status
        })
        console.log('Status updated.')
        await this.scheduler.buildSchedule()
      } catch (error) {
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

li > a {
  font-size: 16px;
  font-weight: bold;
}
</style>
