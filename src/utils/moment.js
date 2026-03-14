const moment = require("moment");

const momentISOFormat = () => {
    let startDate = moment().startOf('day').toDate();
    let endDate = moment().endOf('day').toDate();
    return {
        startOfTheDay: startDate,
        endOfTheDay: endDate
    }
};

module.exports = { momentISOFormat };