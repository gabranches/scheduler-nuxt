<template>
  <div class="container">
    <!-- <map-vue></map-vue> -->
    <scheduler></scheduler>
  </div>
</template>

<script>
import Scheduler from '~/components/Scheduler.vue'
import MapVue from '~/components/Map.vue'

export default {
  components: {
    'map-vue': MapVue,
    scheduler: Scheduler
  }
}
</script>

<style scoped>
</style>
