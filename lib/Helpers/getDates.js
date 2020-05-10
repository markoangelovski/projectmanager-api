const moment = require("moment");

const getDates = (startDate, endDate) => {
  // Support for "1584223200000" formats.
  const correctTimestamp = date =>
    date && !isNaN(parseFloat(Number(date))) ? new Date(Number(date)) : date;

  startDate = correctTimestamp(startDate);
  endDate = correctTimestamp(endDate);

  // Support for "2015-06-22T13:17:21+0000" formats.
  const correctUTC = date =>
    date && !isNaN(Date.parse(date)) ? new Date(date) : date;

  startDate = correctUTC(startDate);
  endDate = correctUTC(endDate);

  // Check if input is in valid format
  const formats = [moment.ISO_8601, moment.RFC_2822];
  const startCheck = startDate && moment(startDate, formats, true).isValid();
  const endCheck = endDate && moment(endDate, formats, true).isValid();

  const start = startCheck
    ? moment(startDate).format()
    : moment().startOf("month").format();
  const end = endCheck
    ? moment(endDate).format()
    : moment().endOf("month").format();

  // If no dates are passed
  if (!startDate && !startCheck && !endDate && !endCheck) {
    return { start, end };
  }
  // If both dates are passed
  if (startCheck && endCheck) {
    return { start, end };
  }
  // If only start date is passed
  if (startDate && !endDate && startCheck && !endCheck) {
    return { start, end };
  }
  // If only end date is passed
  if (!startDate && endDate && !startCheck && endCheck) {
    return { start, end };
  } else {
    throw new Error(
      "Start and End dates need to be in the proper time format."
    );
  }
};

module.exports = { getDates };
