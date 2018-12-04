<template>
  <div id="map-wrapper">
    <div class="row text-center">
      <div id="map-container" class="col">
        <div id="map"></div>
      </div>
    </div>
    <div class="row">
      <div id="last-update" class="col"></div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import helpers from '~/assets/modules/helpers'

export default {
  data() {
    return {
      map: null
    }
  },

  mounted() {
    this.map = this.initializeMap()
    this.createLocation(this.map)
  },

  methods: {
    createLocation(map) {
      this.getCurrentLocation(data => {
        window.locationData = data
        map.setView([data.latitude, data.longitude], map.getZoom())
        document.getElementById(
          'last-update'
        ).innerHTML = `Van location last updated: ${helpers.timestampToStringFull(
          data.timestamp
        )}`
        map.myMarker = L.marker([data.latitude, data.longitude]).addTo(map)
        map.myBoundary = L.circle([data.latitude, data.longitude], {
          color: '#0077b3',
          fillColor: '#0077b3',
          fillOpacity: 0.2,
          radius: data.accuracy,
          weight: 1
        }).addTo(map)
        console.log('Updated location')
      })
    },
    updateLocation(map) {
      this.getCurrentLocation(data => {
        window.locationData = data
        map.setView([data.latitude, data.longitude], map.getZoom())
        document.getElementById(
          'last-update'
        ).innerHTML = `Van location last updated: ${helpers.timestampToStringFull(
          data.timestamp
        )}`
        map.myMarker.setLatLng([data.latitude, data.longitude]).update()
        map.removeLayer(map.myBoundary)
        map.myBoundary = L.circle([data.latitude, data.longitude], {
          color: '#0077b3',
          fillColor: '#0077b3',
          fillOpacity: 0.2,
          radius: data.accuracy,
          weight: 1
        }).addTo(map)
        console.log('Updated location')
      })
    },
    getCurrentLocation(fn) {
      $.ajax({
        url: `${process.env.HOST_URL}/api/location`,
        success: data => {
          fn(data)
        },
        error: err => {
          console.log(err.status)
        }
      })
    },
    initializeMap() {
      const map = L.map('map')
      map.setZoom(14)
      L.tileLayer(
        'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
        {
          maxZoom: 18,
          id: 'mapbox.streets',
          accessToken:
            'pk.eyJ1IjoiZ2FicmFuY2hlcyIsImEiOiJjamlrb3lyZGMyN2d0M2twbnB3dnRqNmh4In0.eg8QZCEMG_kx7LRhwzc4Lw'
        }
      ).addTo(map)
      setInterval(() => {
        map.invalidateSize()
      }, 500)
      return map
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/styles/theme.scss';

#map {
  height: 580px;
  width: 100%;
}

#map-container {
  margin-top: $margin;
  margin-bottom: $margin;
}

#last-update {
  font-size: 12px;
  padding: 15px;
}
</style>
