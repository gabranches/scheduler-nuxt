// src/plugins/vue-leaflet.js
import Vue from 'vue'

import Vue2Leaflet from 'vue2-leaflet'

const VueLeaflet = {

  install(Vue, options) {
    Vue.component('l-map', Vue2Leaflet.LMap)
    Vue.component('l-marker', Vue2Leaflet.LMarker)
    Vue.component('l-tile-layer', Vue2Leaflet.LTileLayer)
  }

};

Vue.use(VueLeaflet);

export default VueLeaflet;