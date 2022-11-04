// Utility methods for Event objects.

// TODO: Once we generate the client SDK, these all need to be refactored  
// into methods of the SDK's classes.

/**
 * Returns true if there is at least one valid combination of lectures. Groups lectures by courseId.
 * @param {Array} lectures A list of lectures
 */
export function allCombinationsOfLecturesConflict(lectures) {
    if (lectures.length <= 1) {
        return false;
    }

    const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
    const cartesian = (a, b, ...c) => (b ? cartesian(f(a, b), ...c) : a);  // https://stackoverflow.com/a/43053803/10265855

    const groupedLectures = groupBy(lectures, a => a.courseId);
    const allCombinations = cartesian(...groupedLectures); // Add custom events

    const allConflict = allCombinations
        .map(combination => anyEventsConflict(combination)) // This needs to return the boolean and an id for the conflicts
        .every(boolean => boolean);
    
    return allConflict // Return ids
}

/**
 * Groups the array, xs, into an array of arrays. The key for grouping is decided by the method f
 * @param {Array} xs The array of objects 
 * @param {*} f A method that provides a key
 */
function groupBy(xs, f) {
    return Object.values(
        xs.reduce((r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), {}))
}

/**
 * Returns true if any event in the list conflicts with any other event.
 * @param {Array} events A list of event objects
 */
export function anyEventsConflict(events) {
    if (events.length <= 1) {
        return false;  // A single event cannot conflict with itself
    }

    for (let i = 0; i < events.length; i++) {
        for (let j = i+1; j < events.length; j++) {
            let event1 = events[i];
            let event2 = events[j];
            if (eventsConflict(event1, event2)) {
                return true;  // TODO, return obj with ids
            }
        }
    }

    return false;  // By this point, there are no conflicts;
}

/**
 * Returns true if the two events conflict. 
 * @param {Object} event1 An event object 
 * @param {Object} event2 Another event object
 */
function eventsConflict(event1, event2) {
    return event1
        .timeLocations
        .flatMap((timeLocation1) => {
            return event2
                .timeLocations
                .map((timeLocation2) => timeLocationsConflict(timeLocation1, timeLocation2))
        })
        .some(possibleConflict => possibleConflict); // Should this be .every() or .some()?
}

/**
 * Returns true if the two timeLocations conflict.
 * @param {Object} timeLocation1 
 * @param {Object} timeLocation2 
 */
function timeLocationsConflict(timeLocation1, timeLocation2) {
    const hasDaysInCommon = timeLocation1
        .fullDays
        .some((dayOfWeek) => timeLocation2.fullDays.includes(dayOfWeek))
    
    if (hasDaysInCommon) {
        return timesOverLap(timeLocation1, timeLocation2);
    } else {
        return false;  // No days in common, then there can be no conflicts
    }
}

/**
 * Returns true if the two timeLocations overlap (not checking days)
 * @param {Object} a A timeLocation object
 * @param {Object} b A timeLocation object
 */
function timesOverLap(a, b) {
    return (a.endTime > b.beginTime) && (a.beginTime < b.endTime); 
}

/**
 * Returns a sorted array of the event's days as three-letter abbreviations. Ex: ["Mon", "Tue", "Sat"]
 * @param {Object} event An event object, such as a classSection or customEvent.
 */
export function getAbbreviatedDaysForEvent(event) {
    
    let accumulator = [];
    event.timeLocations.forEach(function(tl) {
        tl.fullDays.forEach(function(day) {
            accumulator.push(day)
        })
    })
    
    return getAbbreviatedDays(accumulator);
    
}

export function getAbbreviatedDays(weekdays) {
    const abbreviations = {
        'MONDAY': {
            abbreviation: 'Mon',
            sortOrder: 0
        },
        'TUESDAY': {
            abbreviation: 'Tue',
            sortOrder: 1
        },
        'WEDNESDAY': {
            abbreviation: 'Wed',
            sortOrder: 2
        },
        'THURSDAY': {
            abbreviation: 'Thu',
            sortOrder: 3
        },   
        'FRIDAY': {
            abbreviation: 'Fri',
            sortOrder: 4
        },  
        'SATURDAY': {
            abbreviation: 'Sat',
            sortOrder: 5
        },   
        'SUNDAY': {
            abbreviation: 'Sun',
            sortOrder: 6
        }, 
    }

    return weekdays
        .map(a => abbreviations[a])
        .sort((a, b) => (a.sortOrder > b.sortOrder) ? 1 : -1)
        .map(a => a.abbreviation);
}