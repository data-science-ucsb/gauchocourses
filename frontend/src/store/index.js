import Vue from 'vue'
import Vuex from 'vuex'
import api from '@/components/backend-api.js';
import mutations from '@/store/mutations.js';
import getters from '@/store/getters.js';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    selectedQuarter: null,
    selectedDepartment: null,
    selectedCollege: null,
    selectedSearchFilters: {
      selectedSearch: '',
      selectedPageSize: 10,
      selectedMinUnits: '0',
      selectedMaxUnits: '5',
      selectedFullClasses: true,
      selectedGraduateClass: true,
      selectedRequirement: '',
    },
    selectedSession: null,
    selectedCourses: [],
    selectedCustomEvents: [],
    user: {},
    configuration: {
      PRIMARY_COLOR: '#003660',
      SECONDARY_COLOR: '#FEBC11',
      TERTIARY_COLOR: 'purple',
      SITE_NAME: 'GauchoCourses',
      ORGANIZATION_NAME: 'Data Science UCSB'
    }
  },
  mutations: {
    ...mutations
  },
  getters: {
    ...getters
  },
  actions: {
    /**
     * Initializes the Vuex store with an optional schedule object.
     *
     * @param {*} state The Vuex state
     * @param {*} schedule An optional schedule object
     *
     * NOTE: This is used when the user wants to edit one of their schedules.
     * The method, initializeStore is used to initialize the app in general.
     * These functions should be combined to consider whetherr the scehule is empty and if so, use local storage.
     */
    async initializeStoreAsync(context, schedule = null) {
      if (schedule) {

        context.commit('setSelectedQuarter', schedule.quarter);
        // How is session set? It's not a prop on the schedule

        schedule.customEvents.forEach((entry) => {
          context.commit('addCustomEvent', entry);
        });

        context.commit('clearSelectedCourses');

        const codes = schedule.classes.map(a => a.scheduledEnrollCodes[0]);
        var courses = [];
        await Promise.all(codes.map(code => api.coursefromEnrollCode(schedule.quarter, code)))
          .then(responses => {
            courses = responses.map(r => r.data.classes[0]);
          });

        courses.forEach((course) => {
          context.commit('addSelectedCourse', course);
        });

        context.state.selectedCourses.forEach((course) => {
          const sched = schedule;
          const course0 = course;
          course.classSections.forEach((section) => {
            section.selected = false;
            const sectionEnrollCode = section.enrollCode;
            const matchingCourse = sched.classes.find(item => item.courseId == course0.courseId);
            var matchingEnrollCode = "";
            matchingEnrollCode = matchingCourse.scheduledEnrollCodes.find(enrollCode => enrollCode == sectionEnrollCode);
            if (matchingEnrollCode != undefined) {
              section.selected = true;
            }
          });
        });
      }
    },
    /**
     * Asynchronously sets the user info as part of the state.
     * @param {Object} context
     */
    async setUserInfoAsync(context) {
      context.commit('setUserInfo')
    }
  },
  modules: {
  }
})
