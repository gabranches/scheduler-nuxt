<template>
  <div class="container">
    <div class="row" v-if="!secure">
      <div class="col">
        <input v-model="pass" placeholder="Enter password" type="password" v-on:keyup="runHash()">
      </div>
    </div>
    <div class="row" v-if="secure">
      <div class="col form-header">Scheduled Appointments</div>
    </div>
    <div class="spacer"></div>
    <appointments v-if="scheduler && secure" v-bind:scheduler="scheduler"></appointments>
    <div class="spacer"></div>
    <!-- <location-emitter v-if="scheduler && secure"></location-emitter>
    <div class="spacer"></div> -->
    <div class="row" v-if="secure">
      <div class="col form-header">Schedule Editor</div>
    </div>
    <editor v-if="scheduler && secure" v-bind:scheduler="scheduler"></editor>
    
    <!-- <div class="spacer"></div>
    <div class="row" v-if="secure">
      <div class="col form-header">Schedule Planner</div>
    </div>
    <planner v-if="scheduler && secure" v-bind:scheduler="scheduler"></planner> -->
  </div>
</template>

<script>
import sha256 from 'js-sha256'
import Appointments from '~/components/Appointments.vue'
import Planner from '~/components/Planner.vue'
import Editor from '~/components/Editor.vue'
import globals from '~/assets/data/globals'
import LocationEmitter from '~/components/LocationEmitter.vue'
import Scheduler from '~/assets/modules/Scheduler'

export default {
  components: {
    appointments: Appointments,
    editor: Editor,
    planner: Planner,
    'location-emitter': LocationEmitter
  },
  data() {
    return {
      scheduler: null,
      today: null,
      daysAhead: globals.daysAhead,
      filters: {
        upcoming: true
      },
      hash: '03124d452842ec6bc34dfb23351af30329e6701234570bd82e07c107c430db50',
      secure: false,
      pass: 'gamechanger'
    }
  },
  created() {
    this.today = new Date()
    this.createSchedule()
    this.runHash()
  },
  methods: {
    async createSchedule() {
      const scheduler = new Scheduler(this.today, this.daysAhead)
      await scheduler.buildSchedule()
      this.scheduler = scheduler
    },
    runHash() {
      if (sha256(this.pass) === this.hash) {
        this.secure = true
      } else {
        this.secure = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/styles/theme.scss';
@import '~/assets/styles/mixins.scss';

.container-fixed {
  padding: 30px;
}

.spacer {
  height: 20px;
}
</style>
