<template>
  <div>
    <table>
      <tr>
        <td>
          <button class="btn btn-primary" v-on:click="main()">Update Van Location</button>
        </td>
        <td> {{ lastUpdated }}</td>
    </tr>
    </table>
  </div>

</template>

<script>

import Appointments from './Appointments.vue';

export default {
  components: {
    appointments: Appointments,
  },
  data() {
    return {
      lastUpdated: null,
    };
  },
  methods: {
    main() {
      this.lastUpdated = 'Updating...';
      this.getLocation((location) => {
        this.emit(location);
      });
    },
    getTime(timestamp) {
      const date = new Date(timestamp);
      return `${date.toDateString()} ${date.toTimeString()}`;
    },
    getLocation(callback) {
      navigator.geolocation.getCurrentPosition((location) => {
        callback(location);
      });
    },
    async emit(data) {
      try {
        const location = {
          'coords[latitude]': data.coords.latitude,
          'coords[longitude]': data.coords.longitude,
          'coords[accuracy]': data.coords.accuracy,
          'coords[heading]': data.coords.heading,
          'coords[speed]': data.coords.speed,
          timestamp: data.timestamp,
        };
        console.log(data.coords);
        await this.$http.post(`${process.env.HOST_URL}/update/location`, location);
        this.lastUpdated = `Last update: ${this.getTime(data.timestamp)}`;
      } catch (error) {
        console.error(error);
      }
    },
  },
};

</script>

<style lang="scss" scoped>

@import "~/assets/styles/theme.scss";

td {
  padding: 10px;
}

</style>
