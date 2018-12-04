export default class helpers {
  static timestampToStringFull = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toDateString()} ${date.toLocaleTimeString()}`;
  };

  static dateStampToDate = (datestamp) => {
    const year = datestamp.substring(0, 4);
    const month = Number(datestamp.substring(4, 6));
    const day = datestamp.substring(6, 8);
    return new Date(year, month - 1, day);
  };

  static formatDate = (date, short) => {
    let monthNames = [];
    if (short) {
      monthNames = [
        'Jan', 'Feb', 'Mar',
        'Apr', 'May', 'Jun', 'Jul',
        'Aug', 'Sep', 'Oct',
        'Nov', 'Dec',
      ];
    } else {
      monthNames = [
        'January', 'February', 'March',
        'April', 'May', 'June', 'July',
        'August', 'September', 'October',
        'November', 'December',
      ];
    }
    const weekNames = [
      'Sunday', 'Monday', 'Tuesday',
      'Wednesday', 'Thursday', 'Friday',
      'Saturday', 'Sunday',
    ];
    const weekIndex = date.getDay();
    const day = date.getDate();
    const monthIndex = date.getMonth();
    // const year = date.getFullYear();
    return `${weekNames[weekIndex]}, ${monthNames[monthIndex]} ${day}`;
  };

  static addDays = (date, days) => {
    const dateMillis = date.getTime() + days * 86400 * 1000;
    return new Date(dateMillis);
  };

  static dateStamp = (d) => {
    let month = (d.getMonth() + 1).toString();
    let day = d.getDate().toString();
    const year = d.getFullYear().toString();
    month = helpers.zerofy(month, 2);
    day = helpers.zerofy(day, 2);
    return [year, month, day].join('');
  };

  static zerofy = (num) => {
    if (num.toString().length < 2) return `0${num.toString()}`;
    return num;
  }

  static convertMilitary = (time) => {
    let timeString = time.toString();
    let suffix = 'AM';
    if (timeString.length < 4) {
      timeString = helpers.zerofy(timeString);
    }
    let hour = Number(time.substring(0, 2));
    const minute = time.substring(2, 4);
    if (hour > 11) {
      hour -= 12;
      suffix = 'PM';
    }
    if (hour === 0) {
      hour = 12;
    }
    return `${hour}:${minute} ${suffix}`;
  }

  static addAppointmentProps = (appt) => {
    appt.timeSlots.forEach((slot) => {
      if (slot.type === 'appt') {
        slot.text = 'Appointment Available';
      }
      if (slot.type === 'walkin') {
        slot.text = 'Open for Walk-Ins';
      }
      const firstTwoDigits = Number(slot.start.substring(0, 2));
      switch (slot.duration) {
        case '30':
          slot.slots = [slot.start];
          break;
        case '60':
          // Check if start time ends in 00 or 30
          if (slot.start.substring(2, 4) === '30') {
            slot.slots = [
              slot.start,
              `${helpers.zerofy(firstTwoDigits + 1)}00`,
            ];
          } else {
            slot.slots = [
              slot.start,
              `${helpers.zerofy(slot.start.substring(0, 2))}30`,
            ];
          }
          break;
        case '90':
          // Check if start time ends in 00 or 30
          if (slot.start.substring(2, 4) === '30') {
            slot.slots = [
              slot.start,
              `${helpers.zerofy(firstTwoDigits + 1)}00`,
              `${helpers.zerofy(firstTwoDigits + 1)}30`,
            ];
          } else {
            slot.slots = [
              slot.start,
              `${helpers.zerofy(slot.start.substring(0, 2))}30`,
              `${helpers.zerofy(firstTwoDigits + 1)}00`,
            ];
          }
          break;
        default:
          slot.slots = [];
      }
    });
    return appt;
  };
}
