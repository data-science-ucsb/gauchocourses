// Getters for root Vuex

import { allCombinationsOfLecturesConflict } from '../components/util/event-methods.js'

export default {
    /**
     * Returns true if the user is authenticated. False otherwise.
     */
    userIsAuthenticated: state => {
        if (state.user) {
            return state.user['authenticated'] == true;
        } else {
            return false;
        }
    },


    /**
     * Returns an object with basic information about the user.
     */
    userInfo: (state, getters) => {
        let userInfo;
        if (getters.userIsAuthenticated) {
            userInfo = {
                email: state.user.principal.email,
                fullName: state.user.principal.fullName,
                photoURL: state.user.principal.picture,
                authProvider: state.user.authorizedClientRegistrationId
            }
        } else {
            userInfo = {};
        }

        return userInfo;
    },

    /**
     * Returns a flat list of all the selected classSections
     */
    selectedClassSections: state => {
        return state
            .selectedCourses
            .flatMap(course => course.classSections)
            .filter(class_ => class_.selected == true);
    },

    /**
     * Returns boolean indicating if the current selected courses conflict.
     */
    selectionsAreConflicting: (state, getters) => {
        const lectures = getters.selectedClassSections.filter(c => c.isLecture);
        return allCombinationsOfLecturesConflict(lectures)
    }
}
