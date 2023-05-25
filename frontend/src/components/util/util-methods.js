import dayjs from 'dayjs';
import api from '@/components/backend-api.js';


/**
 * Returns the value of the specified cookie. If the cookie cannot be found, returns null;
 * @param {string} key The key of the cookie
 */
export function getCookieValue(key) {
  const cookie = document.cookie
    .split('; ')
    .find(cookie => cookie.startsWith(key));

  return cookie ? cookie.split('=')[1] : null;
}


/**
 * Parses the URL to get the slot name.
 */
export function getSlotNameFromURL() {
  const regex = new RegExp('-([a-zA-z_0-9]+).azurewebsites.net');  // This regex isn't good. The hostname can have dashes, and the slot name can also have dashes.
  const slot = regex.exec(document.URL);
  return slot ? slot[1] : null;  // Get the first capture group
}


/**
 * Converts HH:mm:ss format to h:mm A
 * @param {string} timestring String with the time in HH:mm:ss format
 * @returns {string} string with format of h:mm A
 */
export function formatTime(timeString) {
  return dayjs(timeString,"HH:mm:ss").format("h:mm A");
}


/**
 * Calls the API to get the latest quarters.
 */
export function getQuarters(){
    var quarters = [];
    var today = new Date();
    var nextquarter = "";
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var mmnexthalfquarter = String(today.getMonth() + 2).padStart(2, "0"); //January is 0!


    var mmnextquarter = String(today.getMonth() + 4).padStart(2, "0"); //January is 0!
    var mmnextnextquarter = String(today.getMonth() + 8).padStart(2, "0");
    var yyyy = today.getFullYear();
    today = yyyy + mm + dd;
    nextquarter = yyyy + mmnextquarter + dd;
    var nexthalfquarter = yyyy+ mmnexthalfquarter + dd;
    var nextnextquarter = yyyy+ mmnextnextquarter + dd;


    //TODO: This roundabout method can be shortened if we pull from UCSB's quartercalendar to see the exact dates


    // Get the current and next quarters. Select the next quarter.
    Promise.all([api.quarters(today), api.quarters(nexthalfquarter), api.quarters(nextquarter), api.quarters(nextnextquarter)])
        .then(responses => {
            responses.forEach(resp => quarters.push(resp.data[0]))
            if(quarters[2].category == quarters[3].category){ //Remove duplicate quarters
                quarters.pop();
            }
            if(quarters[1].category == quarters[2].category) {
                quarters.splice(1, 1);
            }
            if(quarters[0].category == quarters[1].category) {
                quarters.splice(0, 1);
            }
        })
        .catch(err => {
            err;
            // ToDo. This is a critical code path, so if this fails then we should render
            // a critical error AND LOG IT SO THAT WE CAN KNOW HOW OFTEN THIS HAPPENS.
        });
    return quarters;
}




/**
 * Used as a default method parameter value to assert that the parameter cannot be empty.
 */
const checkUndefined = () => {
	throw new Error('Method argument cannot be undefined');
};


/**
 * Group items from an array together by some criteria or value.
 * (c) 2019 Tom Bremmer (https://tbremer.com/) and Chris Ferdinandi (https://gomakethings.com), MIT License
 * https://gomakethings.com/a-vanilla-js-equivalent-of-lodashs-groupby-method/
 * @param  {Array}           arr      The array to group items from
 * @param  {String|Function} criteria The criteria to group by
 * @return {Object}                   The grouped object
 */
export function groupBy(arr = checkUndefined(), criteria) {
	return arr.reduce(function (obj, item) {

		// Check if the criteria is a function to run on the item or a property of it
		var key = typeof criteria === 'function' ? criteria(item) : item[criteria];

		// If the key doesn't exist yet, create it
		if (!Object.prototype.hasOwnProperty.call(obj, key)) {
			obj[key] = [];
		}

		// Push the value to the object
		obj[key].push(item);

		// Return the object to the next item in the loop
		return obj;

	}, {});
}
