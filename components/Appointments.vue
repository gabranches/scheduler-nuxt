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
              <th>Type</th>
              <th>Status</th>
              <th>Administrator Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr class="filter-row">
              <td>
                <select
                  v-model="filters.dropdowns.dateStamp"
                  class="form-control form-control-sm filter-select"
                >
                  <option>All</option>
                  <option
                    v-for="item in helpers.getSet('dateStamp', apptsPrimed)"
                    :key="item"
                    v-bind:value="item"
                  >{{ helpers.formatDate(helpers.dateStampToDate(item), true) }}</option>
                </select>
              </td>
              <td>
                <select
                  v-model="filters.dropdowns.location"
                  class="form-control form-control-sm filter-select"
                >
                  <option>All</option>
                  <option
                    v-for="item in helpers.getSet('location', apptsPrimed)"
                    :key="item"
                    v-bind:value="item"
                  >{{ helpers.locationShort(item) }}</option>
                </select>
              </td>
              <td>
                <select
                  v-model="filters.dropdowns.timeText"
                  class="form-control form-control-sm filter-select"
                >
                  <option>All</option>
                  <option
                    v-for="item in helpers.getSet('timeText', apptsPrimed)"
                    :key="item"
                    v-bind:value="item"
                  >{{ item }}</option>
                </select>
              </td>
              <td>
                <input
                  v-model="filters.inputs.name"
                  class="form-control form-control-sm filter-select"
                >
              </td>
              <td>
                <select
                  v-model="filters.dropdowns.type"
                  class="form-control form-control-sm filter-select"
                >
                  <option>All</option>
                  <option
                    v-for="item in helpers.getSet('type', apptsPrimed)"
                    :key="item"
                    v-bind:value="item"
                  >{{ item }}</option>
                </select>
              </td>
              <td>
                <select
                  v-model="filters.dropdowns.status"
                  class="form-control form-control-sm filter-select"
                >
                  <option>All</option>
                  <option
                    v-for="item in helpers.getSet('status', apptsPrimed)"
                    :key="item"
                    v-bind:value="item"
                  >{{ item }}</option>
                </select>
              </td>
              <td>
                <button @click="clearFilters()" class="btn btn-light">Clear Filters</button>
              </td>
            </tr>
            <tr v-bind:key="appt.id" v-for="appt in apptsFiltered">
              <td
                class="align-middle"
              >{{ helpers.formatDate(helpers.dateStampToDate(appt.dateStamp), true) }}</td>
              <td class="align-middle">{{ helpers.locationShort(appt.location) }}</td>
              <td class="align-middle">{{appt.timeText}}</td>
              <td class="align-middle clickable" v-on:click="toggleDetails(appt)">
                <div>{{appt.firstName}} {{appt.lastName}}</div>
                <div v-if="showDetails">{{appt.phone}}</div>
                <div v-if="showDetails">{{appt.email}}</div>
              </td>
              <td class="align-middle">{{appt.type}}</td>
              <td class="align-middle" v-bind:class="classStatus(appt.status)">{{appt.status}}</td>
              <td class="align-middle">
                <button
                  v-if="appt.status === 'Booked'"
                  v-on:click="updateStatus(appt, 'Checked-In')"
                  class="btn btn-info"
                >Check-In</button>
                <button
                  v-if="appt.status === 'Booked'"
                  v-on:click="updateStatus(appt, 'No-Show')"
                  class="btn btn-secondary"
                >No-Show</button>
                <button
                  v-if="appt.status === 'Checked-In'"
                  v-on:click="updateStatus(appt, 'Booked')"
                  class="btn btn-light"
                >Undo Check-In</button>
                <button
                  v-if="appt.status === 'No-Show'"
                  v-on:click="updateStatus(appt, 'Booked')"
                  class="btn btn-light"
                >Undo No-Show</button>
                <button
                  v-if="appt.status === 'Canceled'"
                  v-on:click="updateStatus(appt, 'Booked')"
                  class="btn btn-light"
                >Undo Cancel</button>
                <button
                  v-if="appt.status === 'Pending Delete'"
                  v-on:click="updateStatus(appt, 'Canceled')"
                  class="btn btn-light"
                >Go Back</button>
                <!-- </td>
                <td class="align-middle">-->
                <button
                  v-if="appt.status === 'Canceled'"
                  v-on:click="updateStatus(appt, 'Pending Delete')"
                  class="btn btn-dark"
                >DELETE</button>
                <button
                  v-if="appt.status === 'Pending Delete'"
                  v-on:click="updateStatus(appt, 'Deleted')"
                  class="btn btn-dark"
                >CONFIRM DELETE</button>
                <button
                  v-if="appt.status === 'Booked'"
                  v-on:click="updateStatus(appt, 'Canceled')"
                  class="btn btn-danger"
                >Cancel</button>
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
        upcoming: true,
        dropdowns: {
          dateStamp: 'All',
          location: 'All',
          timeText: 'All',
          type: 'All',
          status: 'All'
        },
        inputs: {
          name: ''
        }
      },
      showDetails: false
    }
  },
  created() {
    this.today = new Date()
  },
  computed: {
    // Apply initial filters
    apptsPrimed() {
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
      return appts.filter(a => a.status !== 'Deleted')
    },
    // Apply dropdown filters
    apptsFiltered() {
      const order = this.filters.upcoming ? 'asc' : 'desc'
      let appts = this.applyFilters(this.apptsPrimed)
      appts = appts.filter(a => {
        const name = `${a.firstName} ${a.lastName}`
        return name
          .toLowerCase()
          .includes(this.filters.inputs.name.toLowerCase())
      })
      return _.orderBy(appts, ['dateStamp', 'time'], [order, order])
    }
  },
  methods: {
    applyFilters(list) {
      Object.entries(this.filters.dropdowns).forEach(entry => {
        const [key, value] = entry
        if (value && value !== 'All') {
          list = list.filter(t => t[key] === value)
        }
      })
      return list
    },
    clearFilters() {
      this.filters.dropdowns.dateStamp = 'All'
      this.filters.dropdowns.location = 'All'
      this.filters.dropdowns.timeText = 'All'
      this.filters.dropdowns.type = 'All'
      this.filters.dropdowns.status = 'All'
      this.filters.inputs.name = ''
    },
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
      if (status === 'No-Show') {
        return 'dark-grey'
      }
      return 'red'
    },
    async updateStatus(appt, status) {
      await axios
        .post(`${process.env.HOST_URL}/api/update/status`, {
          id: appt.id,
          status
        })
        .then(async res => {
          await this.scheduler.buildSchedule()
          console.log(res.data)
          
        })
        .catch(err => {
          console.log(error)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/styles/theme.scss';
@import '~/assets/styles/mixins.scss';

* {
  font-size: 14px;
  select,
  button {
    font-size: 12px;
  }
}

li > a {
  font-size: 16px;
  font-weight: bold;
}

.filter-row {
  background-color: rgb(222, 226, 230) !important;
}
</style>
