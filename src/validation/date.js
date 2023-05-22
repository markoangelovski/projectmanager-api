const moment = require("moment");

const checkDate = date => {
  date = date && date.trim();

  // Support for "1584223200000" formats.
  const correctTimestamp = date =>
    date && !isNaN(parseFloat(Number(date))) ? new Date(Number(date)) : date;

  date = correctTimestamp(date);

  // Support for "2015-06-22T13:17:21+0000" formats.
  const correctUTC = date =>
    date && !isNaN(Date.parse(date)) ? new Date(date) : date;

  date = correctUTC(date);

  // Check if input is in valid format
  const formats = [moment.ISO_8601, moment.RFC_2822];
  const dateCheck = date && moment(date, formats, true).isValid();

  if (dateCheck) {
    return date;
  } else {
    return false;
  }
};

const checkDayId = date => {
  date = typeof date === "string" ? date : date.toJSON();

  // date = "YYYY-DD-MM" || "2020-06-11T00:00:00.000Z"
  date = date.split("-");

  const year = parseInt(date[0]);
  const month = parseInt(date[1]);
  const day = parseInt(date[2]);

  const check =
    year >= 2020 &&
    year < 3000 &&
    month > 0 &&
    month <= 12 &&
    day > 0 &&
    day <= 31;

  if (check) {
    return `${year}-${month < 10 ? `0${month}` : month}-${
      day < 10 ? `0${day}` : day
    }`;
  } else {
    return false;
  }
};

module.exports = { checkDate, checkDayId };
