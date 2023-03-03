import axios from 'axios';
import axiosRetry from 'axios-retry';
import requirements from './requirements.json';
/**
 * API for the Spring Backend. All methods return promises.
 */
export default {
    /**
     * Gets the list of quarter objects.
     */
    quarters(datetoday) {
        return axios_instance.get('/remote/academics/quartercalendar/v1/quarters?date='+datetoday+'/');
    },
    departments() {
        return axios_instance.get('/remote/students/lookups/v1/departments?includeInactive=false/');
    },
    requirements() {
        // Change to backend url when ready
        return new Promise((resolve) => resolve(requirements));
    },
    coursefromID(quarter, courseId) {
      return axios_instance.get('/remote/academics/curriculums/v1/classes/search?quarter='+quarter+'&courseId='+ courseId +'&pageNumber=1&pageSize=10&includeClassSections=true');
    },
    coursefromEnrollCode(quarter, enrollcode) {
      return axios_instance.get('/remote/academics/curriculums/v1/classes/search?quarter='+quarter+'&enrollCode='+ enrollcode +'&pageNumber=1&pageSize=10&includeClassSections=true');
    },
    courses(quarter, deptcode, pageSize=100, pageNumber=1) {
      return axios_instance.get(`/remote/academics/curriculums/v1/classes/search?quarter=${quarter}&deptCode=${deptcode}&pageSize=${pageSize}&pageNumber=${pageNumber}&includeClassSections=true`);
    },
    coursesWithFilters(quarter, filters){
        let filterQuery = [];
        for(let key in filters){
            //only add to filterQuery if key has a non null value
            if(filters[key])
                filterQuery.push(encodeURIComponent(key) + "=" + encodeURIComponent(filters[key]));
        }
        filterQuery = filterQuery.join("&");
        return axios_instance.get(`/remote/academics/curriculums/v1/classes/search?quarter=${quarter}&includeClassSections=true&${filterQuery}`);
    },
    lectures(quarter) {
        return axios_instance.get('/quarter/'+quarter+'/lectures/');
    },
    sections(quarter, lecture) {
        return axios_instance.get('/quarter/'+quarter+'/lecture/'+lecture+'/sections/');
    },
    /**
     *
     * @param {Array} classSections
     * @param {number} lastScheduleIndex
     * @param {Array} customEvents
     * @param {number} pageSize
     */
    schedules(classSections, lastScheduleIndex, customEvents, pageSize) {
        var config = {  // TODO: move this config into the axios_instance so all requests use it
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }
        return axios_instance.post('/api/schedules/generate/',{
            classSections: classSections,
            lastScheduleIndex: lastScheduleIndex,
            pageSize: pageSize,
            customEvents: customEvents
        }, config);
    },
    /**
     * Sends a POST request to save the given schedule.
     * @param {object} schedule The schedule to save
     */
    saveSchedule(schedule, customEvents, selectedClassSections, scheduledClassSections) {
        let savableSchedule = {"selectedClassSections": selectedClassSections, "scheduledClassSections": scheduledClassSections, "customEvents": customEvents, "schedule": schedule};
        return axios_instance.post('/api/schedules/', savableSchedule,)
    },
    /**
     * Gets the schedules for the specified user email address.
     * @param {string} userEmail Filters schedules for this user email
     */
    getSchedulesForUser() {
        return axios_instance.get('/api/schedules/');
    },
    /**
     * Deletes
     * @param {object} schedule The schedule to delete
     */
    deleteSchedule(schedule) {
        return axios_instance.post('/api/schedules/delete/', schedule)
    },
    /**
    * Updates the schedule's name property given the schedule's id and a new name.
    * Replace operation comes from the json patch library. Other patch operations could be used.
    *
    * @param {Number} id The schedule's id
    * @param {String} name The schedule's new name
    */
    updateScheduleName(id, name) {
      var operation = [{ "op": "replace", "path": "/name", "value": name }];
      return axios_instance.patch('/api/schedules/'+id, operation);
    },
    /**
     * Returns the user Authorization token. If the user is not authenticated, this returns null.
     */
    user() {
        return axios_instance.get('/api/user/');
    },
    /**
     * Returns the UI configuration settings
     */
    getConfiguration() {
      return axios_instance.get('/api/configuration/');
    },
    /**
     * Sends a POST request to create a Google Calendar event.
     * @param {object} event The event to create
     */
    createCalEvent(event){
        var config = {  // TODO: move this config into the axios_instance so all requests use it
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }
        return axios_instance.post('/api/calendar/events/', event, config);
    }
}

/**
 * Only imported in tests to mock the API responses.
 */
export const axios_instance = axios.create({
    baseURL: ``,
    timeout: 5000
});
axiosRetry(axios_instance,
   { retries: 3,
     retryDelay: axiosRetry.exponentialDelay,
     retryCondition: (error) => {
       return axiosRetry.isNetworkOrIdempotentRequestError(error)
       || error.code === 'ECONNABORTED';
     },
     shouldResetTimeout: true
 });
