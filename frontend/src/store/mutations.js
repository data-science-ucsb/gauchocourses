// Mutations for the root Vuex store.

import { getBackgroundColor, getBorderColor } from '../components/util/color-utils';
import api from '@/components/backend-api.js';

export default {
    /**
     * Retrieves the user information object from the backend and sets is as part of the state. This is intended to be used
     * when the application starts.
     * @param {*} state The Vuex state
     */
    setUserInfo: function (state) {
        api.user()
            .then(resp => state.user = resp.data ? resp.data : {})  // If the response is truthy, set the user attributes
            .catch(err => err);
    },


    /**
     * Initializes the Vuex store from local storage. The store
     * is initialized with the default values.
     * @param {*} state The Vuex state
     * @param {*} schedule An optional schedule object
     */
    initializeStore(state) {
        if (localStorage.getItem('store')) {
            this.replaceState(
                Object.assign(state, JSON.parse(localStorage.getItem('store')))
            );
        }
    },


    /**
     * Sets the user's selected quarter and clears state.selectedCourses. This is idempotent, if newQuarter == the selected quarter, this does nothing.
     * @param {Object} state The Vuex state
     * @param {String} newQuarter The value of the user's selected quarter
     */
    setSelectedQuarter: function (state, newQuarter) {
        if (state.selectedQuarter != newQuarter) {
            state.selectedQuarter = newQuarter;
            state.selectedCourses = [];
        }
    },
    /**
     * Sets the user's selected department.
     * @param {Object} state The Vuex state
     * @param {String} newDepartment The value of the user's selected department
     */
    setSelectedDepartment: function (state, newDepartment) {
        if (state.selectedDepartment != newDepartment) {
            state.selectedDepartment = newDepartment;
        }
    },
    /**
     * Sets the user's selected college.
     * @param {Object} state The Vuex state
     * @param {String} newCollege The value of the user's selected college
     */
    setSelectedCollege: function (state, newCollege) {
        if (state.selectedCollege != newCollege) {
            state.selectedCollege = newCollege;
        }
    },
    /**
     * Sets the user's selected min units.
     * @param {Object} state The Vuex state
     * @param {String} newQuarter The value of the user's selected min units
     */
    setSelectedMinUnits: function(state, newMinUnits) {
        if(state.selectedSearchFilters.selectedMinUnits != newMinUnits) {
            state.selectedSearchFilters.selectedMinUnits = newMinUnits;
        }
    },
    /**
     * Sets the user's selected max units.
     * @param {Object} state The Vuex state
     * @param {String} newQuarter The value of the user's selected max units
     */
    setSelectedMaxUnits: function(state, newMaxUnits) {
        if(state.selectedSearchFilters.selectedMaxUnits != newMaxUnits) {
            state.selectedSearchFilters.selectedMaxUnits = newMaxUnits;
        }
    },
    /**
     * Sets the user's selected search string.
     * @param {Object} state The Vuex state
     * @param {String} newQuarter The value of the user's selected search string
     */
    setSelectedSearch: function(state, newSearch) {
        if(state.selectedSearchFilters.selectedSearch != newSearch) {
            state.selectedSearchFilters.selectedSearch = newSearch;
        }
    },
    /**
     * Sets the user's selected requirements.
     * @param {Object} state The Vuex state
     * @param {String} newQuarter The value of the user's selected requirements
     */
    setSelectedRequirement: function(state, newRequirement) {
        if(state.selectedSearchFilters.selectedRequirement != newRequirement) {
            state.selectedSearchFilters.selectedRequirement = newRequirement;
        }
    },
    /**
     * Sets the user's selected full classes
     * @param {Object} state The Vuex state
     * @param {String} newQuarter The value of the user's selected full classes
     */
    setSelectedFullClasses: function(state, newFullClasses) {
        if(state.selectedSearchFilters.selectedFullClasses != newFullClasses) {
            state.selectedSearchFilters.selectedFullClasses = newFullClasses;
        }
    },
    /**
     * Sets the user's selected graduate classes.
     * @param {Object} state The Vuex state
     * @param {String} newGraduateClasses The value of the user's selected graduate classes
     */
    setSelectedGraduateClasses: function(state, newGraduateClasses) {
        if(state.selectedSearchFilters.selectedGraduateClasses != newGraduateClasses) {
            state.selectedSearchFilters.selectedGraduateClasses = newGraduateClasses;
        }
    },


    /**
     * TODO: (Not a TODO, note that if we want to reset the schedule for each session, then have to uncomment) Sets the user's selected session and DOES NOT clear state.selectedCourses. This is idempotent, if newSession == the selected session, this does nothing.
     * @param {Object} state The Vuex state
     * @param {String} newQuarter The value of the user's selected quarter
     */
    setSelectedSession: function (state, newSession) {
        if (state.selectedSession != newSession) {
            state.selectedSession = newSession;
            // state.selectedCourses = [];
        }
    },


    /**
     * Adds the course object to state.selectedCourses. If a course with the same ID is already
     * selected, the course is not added.
     * @param {Object} state The Vuex state
     * @param {Object} course The course object to add
     */
    addSelectedCourse: function (state, course) {
        const courseAlreadyAdded = state.selectedCourses.length == 0 ? false : state.selectedCourses.some(c => c.courseId == course.courseId);

        if (!courseAlreadyAdded) {
            course.classSections.map(class_ => class_.selected = true);
            course.backgroundColor = getBackgroundColor(course.courseId.slice(7, 14));
            course.borderColor = getBorderColor(course.deptCode);
            state.selectedCourses.push(course);
        }
    },

    /**
     * Removes a course object from state.selectedCourses given the course's ID.
     * @param {*} state The Vuex state.
     * @param {*} courseId ID of the course to remove
     */
    removeSelectedCourse: function (state, courseId) {
        state.selectedCourses = state
            .selectedCourses
            .filter(c => c.courseId != courseId)
    },

    /**
     * Clear all courses from state.selectedCourses
     * @param {Object} state The Vuex state
     */
    clearSelectedCourses: function(state) {
        state.selectedCourses = [];
    },

    /**
     * Changes the "selected" property on the classSection that matches "enrollCode".
     * @param {Object} state The Vuex state
     * @param {String} enrollCode The enrollCode of the classSection
     * @param {Boolean} selected The new value for the "selected" prop of the classSection
     */
    changeClassSectionSelection: function (state, { courseId, enrollCode, selected }) {
        // Is there a more elegant way to map these lists?
        state.selectedCourses = state.selectedCourses
            .map(course => {
                if (course.courseId == courseId) {
                    course.classSections = course.classSections.map(class_ => {
                        if (class_.enrollCode == enrollCode) {
                            return { ...class_, selected: selected };
                        } else {
                            return class_;
                        }
                    })
                }
                return course;
            })
    },


    /**
     * Adds the custom event object to state.selectedCustomEvents. If an event with the same name is already
     * selected, the event is not added.
     * @param {*} state The Vuex state.
     * @param {*} entry The event Object.
     */
    addCustomEvent: function (state, entry) {
        const courseAlreadyAdded = state.selectedCustomEvents.length == 0 ? false : state.selectedCustomEvents.some(c => c.name == entry.name);

        if (!courseAlreadyAdded) {
            entry.backgroundColor = getBackgroundColor(entry.name);
            entry.borderColor = getBorderColor(entry.name)
            state.selectedCustomEvents.push(entry);
        }
    },


    /**
     * Removes a custom event object from state.selectedCustomEvents given the event's name.
     * @param {*} state The Vuex state.
     * @param {*} eventName The event name to be deleted
     */
    removeCustomEvent: function (state, eventName) {
        state.selectedCustomEvents = state
            .selectedCustomEvents
            .filter(c => c.name != eventName)
    },


    setClientConfiguration: function(state, configuration) {
        state.configuration = configuration;
    }
}
