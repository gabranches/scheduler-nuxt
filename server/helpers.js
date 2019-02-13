import _ from 'lodash';
import locations from '../data/locations';

module.exports = {
  locationShort: (location) => {
    return _.find(locations, {tag : location}).short
  }
}
