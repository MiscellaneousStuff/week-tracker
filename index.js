const ical = require("node-ical");
const Moment = require("moment");
const MomentRange = require("moment-range");
const moment = MomentRange.extendMoment(Moment);

const events = ical.sync.parseFile("basic.ics");

const eventList = Object.values(events).filter(a => a.type == "VEVENT").filter(event => {
    const eventStart = moment(event.start);
    const eventEnd = moment(event.end);
    let eventDuration = moment.duration(eventEnd.diff(eventStart)).asHours();
    if (eventDuration < 24) {
        return event;
    }
});

const startWeekRange = moment("04/01/2021", "DD/MM/YYYY");
const endWeekRange = moment(startWeekRange).add(1, 'week');
const currentWeekRange = moment.range(startWeekRange, endWeekRange);

console.log(moment(), startWeekRange, endWeekRange);

let projectTotals = {};

let category_re = /\b\w+:/;

const thisWeeksEvents = eventList.filter(event => {
    const eventStart = moment(event.start);
    const eventEnd = moment(event.end);
    const currentEventRange = moment.range(eventStart, eventEnd);
    let categories = event.summary.match(category_re);
    if (currentEventRange.overlaps(currentWeekRange, { adjacent: false })) {
        // Get actual event duration in hours
        let eventDuration = moment.duration(eventEnd.diff(eventStart)).asHours();

        // Trim excess hours
        if (eventStart < startWeekRange) {
            eventDuration -= moment.duration(startWeekRange.diff(eventStart)).asHours();
        }
        if (eventEnd > endWeekRange) {
            eventDuration -= moment.duration(eventEnd.diff(endWeekRange)).asHours();
        }

        // Sum categories evenly
        categories.forEach(category => {
            if (!projectTotals.hasOwnProperty(category)) {
                projectTotals[category] = 0;
            }
            projectTotals[category] += eventDuration / categories.length;
        });
    }
});

let countTotal = Object.values(projectTotals).reduce((a, b) => a + b, 0);
console.log(projectTotals, countTotal);