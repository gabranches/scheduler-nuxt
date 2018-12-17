import _ from 'lodash';
import scheduleRotation from '~/assets/data/scheduleRotation';
import helpers from '~/assets/modules/helpers';

export default class Scheduler {
  constructor(today, daysAhead) {
    this._schedule = [];
    this.today = today;
    this.daysAhead = daysAhead;
    this._scheduleRotation = scheduleRotation;
  }

  get schedule() {
    return _.sortBy(this._schedule, ['dateStamp']);
  }

  get appointments() {
    return this._scheduledAppointments;
  }

  get rotation() {
    return this.scheduleRotation;
  }

  /**
   * Builds a schedule based on the rotation in scheduleRotation.js
   */
  buildSchedule() {
    return new Promise(async (resolve, reject) => {
      this._schedule = [];
      try {
        this._scheduledAppointments = await Scheduler.fetchAppointments();
      } catch (error) {
        reject(error);
      }
      try {
        this._scheduleChanges = await Scheduler.featchScheduleChanges();
      } catch (error) {
        reject(error);
      }
      let rotationNum = Math.floor((this.today.getTime()/1000/60/60/24) % 14) + 3
      for (let i = 0; i < this.daysAhead; i += 1) {
        const currentDate = helpers.addDays(this.today, i);
        const todayDateStamp = Number(helpers.dateStamp(currentDate));
        const scheduleSlot = _.find(this._scheduleRotation, { day: rotationNum });
        if (scheduleSlot) {
          const newSlot = _.cloneDeep(scheduleSlot);
          newSlot.dateStamp = todayDateStamp.toString();
          newSlot.dateStampRoutine = todayDateStamp.toString();
          newSlot.edited = false;
          this._schedule.push(helpers.addAppointmentProps(newSlot));
        }
        if (rotationNum === 13) {
          rotationNum = 0;
        } else {
          rotationNum += 1;
        }
      }
      this.applyScheduleChanges();
      this.removeBookedSlots();
      resolve();
    });
  }

  /**
   * Replace the routine schedule slots with any changes that have been made
   */
  applyScheduleChanges() {
    this._scheduleChanges.forEach((change) => {
      _.remove(this._schedule, { dateStampRoutine: change.dateStampRoutine });
      this._schedule.push(helpers.addAppointmentProps(change));
    });
  }

  /**
   * Mark the slots in the schedule which have already been booked
   */
  removeBookedSlots() {
    this._schedule.forEach((day) => {
      day.timeSlots.forEach((slot) => {
        const match = this._scheduledAppointments.filter(a => a.dateStamp === day.dateStamp
          && a.location === day.location
          && a.time === slot.start
          && a.status !== 'Canceled');
        if (match.length > 0) {
          slot.booked = match.length.toString();
        } else {
          slot.booked = '0';
        }
      });
    });
  }

  static isRoutine(slot) {
    if (slot.dateStamp !== slot.dateStampRoutine) return false;
    const timeSlotMap = t => ({
      type: t.type,
      start: t.start,
      duration: t.duration,
      open: t.open,
    });
    const slotCompare = {
      day: slot.day,
      location: slot.location,
      timeSlots: slot.timeSlots.map(timeSlotMap),
    };
    const routineDay = _.find(scheduleRotation, { day: slot.day });
    const routineCompare = {
      day: routineDay.day,
      location: routineDay.location,
      timeSlots: routineDay.timeSlots.map(timeSlotMap),
    };
    return _.isEqual(slotCompare, routineCompare);
  }

  /**
   * Fetch the scheduled appointments from the database
   */
  static fetchAppointments() {
    return new Promise(async (resolve, reject) => {
      const apptsArray = [];
      try {
        const data = await fetch(`${process.env.DB_URL}/appointments.json`)
          .then(resp => resp.json());
        _.keys(data).forEach((key) => {
          const val = data[key];
          val.id = key;
          apptsArray.push(val);
        });
        resolve(apptsArray);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Fetch the appointment changes from the database
   */
  static featchScheduleChanges() {
    return new Promise(async (resolve, reject) => {
      const resultArray = [];
      try {
        const data = await fetch(`${process.env.DB_URL}/schedule-changes.json`)
          .then(resp => resp.json());
        _.keys(data).forEach((key) => {
          const val = data[key];
          val.id = key;
          resultArray.push(val);
        });
        resolve(resultArray.filter(t => t.dateStamp >= helpers.dateStamp(new Date())));
      } catch (error) {
        reject(error);
      }
    });
  }
}
