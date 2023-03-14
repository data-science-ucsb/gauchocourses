<!--
    Renders selectors
-->
<template>
  <b-card no-body>
    <b-card-body class="pb-1 pt-1" id="course-selectors"> <!-- Card body provides padding for the selectors -->

      <b-form-group class="course-selector">
        <b-input size="sm" placeholder='Search...' v-model="searchFilters.search"></b-input>
      </b-form-group>

      <b-form-group class="course-selector" v-show="isOpen" label-cols="3" label-cols-md="4" label-cols-lg="5" label="Quarter:" label-for="quarterselect" label-size="sm">
        <b-form-select
            size="sm"
            :value="currentQuarter"
            :options="this.quarters"
            :disabled="this.quarters.length == 0"
            text-field="name"
            value-field="quarter"
            v-on:change="e => confirmUserSelection(e, currentQuarter, 'currentQuarter')"
        >
          <template v-slot:first v-if="this.quarters.length == 0">
            <b-form-select-option :value="null">Loading...</b-form-select-option>
          </template>
        </b-form-select>
      </b-form-group>
      <b-form-group
          class="course-selector"
          v-show="isOpen"
          v-if="currentQuarterIsSummer"
          label-cols="3"
          label="Session:"
          label-for="sessionselect"
          label-size="sm"
      >
        <b-form-select
            size="sm"
            :value="currentSession"
            :options="sessions"
            v-on:change.capture="e => confirmUserSelection(e, currentSession, 'currentSession')"
        ></b-form-select>
      </b-form-group>

      <b-form-group class="course-selector" v-show="isOpen" label-cols="3" label-cols-md="4" label-cols-lg="5" label="Department:" label-for="deptartmentselect" label-size="sm">
        <b-form-select
            size="sm"
            v-model="currentDepartment"
            :options="this.orderedDepartments"
            :disabled="this.departments.length == 0"
            text-field="deptTranslation"
            value-field="deptCode"
        >
          <template v-slot:first>
            <b-form-select-option :value="null" v-if="departments.length == 0">Loading...</b-form-select-option>
            <b-form-select-option :value="null">Any</b-form-select-option>
          </template>
        </b-form-select>
      </b-form-group>

      <b-form-group class="course-selector" v-show="isOpen" label-cols="3" label-cols-md="4" label-cols-lg="5" label="Units:" label-for="unitInputs" label-size="sm">
        <b-form>
          <b-form-row>
            <b-col cols="6">
              <b-input size="sm" placeholder="min" @keydown="checkValidKey" @keyup="blurSetMin" v-model="searchFilters.minUnits"></b-input>
            </b-col>
            <b-col cols="6">
              <b-input size="sm" placeholder="max" @keydown="checkValidKey" @keyup="blurSetMax" v-model="searchFilters.maxUnits"></b-input>
            </b-col>
          </b-form-row>
        </b-form>
      </b-form-group>

      <b-form-group class="course-selector" v-show="isOpen" label-cols="3" label-cols-md="4" label-cols-lg="5" label="Requirements:" label-for="requirementSelectors" label-size="sm">
        <b-form>
          <b-form-row>
            <b-col cols="6">
              <b-form-select
                  size="sm"
                  v-model="currentCollege"
                  :options="Object.keys(requirements)"
                  :disabled="this.requirements.length == 0"
                  v-on:change="e => this.searchFilters.selectedRequirement = null"
              >
                <template v-slot:first>
                  <b-form-select-option :value="null" v-if="requirements.length == 0">Loading...</b-form-select-option>
                  <b-form-select-option :value="null">Any</b-form-select-option>
                </template>
              </b-form-select>
            </b-col>
            <b-col cols="6">
              <b-form-select
                  size="sm"
                  v-model="searchFilters.selectedRequirement"
                  :options="requirements[currentCollege]"
                  :disabled="this.requirements.length == 0 || currentCollege == null"
                  text-field="requirementCode"
                  value-field="requirementCode"
                  disabled-field="disabledOption">
              </b-form-select>
            </b-col>
          </b-form-row>
        </b-form>
      </b-form-group>

      <b-form-row v-show="isOpen">
        <b-col>
          <b-form-group label-cols="auto" label="Grad classes" label-size="sm">
            <b-form-checkbox style="padding-top:4px;" size="sm" v-model="searchFilters.graduateClasses"></b-form-checkbox>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label-cols="auto" label="Full classes" label-size="sm">
            <b-form-checkbox style="padding-top:4px;" size="sm" v-model="searchFilters.fullClasses"></b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>
      <!-- create a up chevron button that allows user to press and minimize the course selector card, and creating more space for class list
            the chevron button should be at the center of the box-->
      <b-form-row>
        <b-col cols="5">
        </b-col>
        <b-col>
          <b-button v-if="isOpen" class="course-selector-button" variant="outline" size="sm" @click="toggleCourseSelector">
            <font-awesome-icon icon="chevron-up" size="sm" />
          </b-button>
          <b-button v-if="!isOpen" class="course-selector-button" variant="outline" size="sm" @click="toggleCourseSelector">
            <font-awesome-icon icon="chevron-down" size="sm" />
          </b-button>
        </b-col>
        <b-col cols="5">
        </b-col>
      </b-form-row>

    </b-card-body>
    <!-- Make Prettier -->
    <b-list-group flush class="course-search-results" @scroll="handleScroll">
      <div v-if="isLoading">Loading...</div>
      <div v-if="courses.length == 0 && !isLoading">No results. Try changing your search criteria.</div>
      <div v-else>
        <div v-for="(course, index) in courses" v-bind:key="index">
          <CourseListItem :course="course">
            <template v-slot:buttons>
              <font-awesome-icon
                  v-b-tooltip.hover
                  :title="'Add '+course.courseId"
                  icon="plus-square"
                  size="lg"
                  id="addCourse"
                  @click="$store.commit('addSelectedCourse', course)"
              />
            </template>
          </CourseListItem>
        </div>
      </div>
    </b-list-group>
  </b-card>
</template>

<script>
import api from "@/components/backend-api";
import { allCombinationsOfLecturesConflict } from "@/components/util/event-methods.js";
import { getQuarters } from '@/components/util/util-methods.js';
import CourseListItem from "@/components/events/ListItems/CourseListItem.vue";
import { debounce, groupBy, uniqBy, sortBy } from "lodash";

export default {
  components: {
    CourseListItem
  },
  data: function() {
    return {
      isOpen: true,
      currentSession: null,
      currentDepartment: this.$store.state.selectedDepartment,
      currentCollege: this.$store.state.selectedCollege,
      searchFilters: {
        search: this.$store.state.selectedSearchFilters.selectedSearch,
        pageSize: this.$store.state.selectedSearchFilters.selectedPageSize,
        minUnits: this.$store.state.selectedSearchFilters.selectedMinUnits,
        maxUnits: this.$store.state.selectedSearchFilters.selectedMaxUnits,
        fullClasses: this.$store.state.selectedSearchFilters.selectedFullClasses,
        graduateClasses: this.$store.state.selectedSearchFilters.selectedGraduateClasses,
        selectedRequirement: this.$store.state.selectedSearchFilters.selectedRequirement,
      },
      currentPage: 1,
      maxPages: 1,
      quarters: [],
      sessions: [
        { vale: "00000A  ", text: "A" },
        { vale: "00000B  ", text: "B" },
        { vale: "00000C  ", text: "C" },
        { vale: "00000D  ", text: "D" },
        { vale: "00000E  ", text: "E" },
        { vale: "00000F  ", text: "F" }
      ],
      departments: [],
      requirements: [],
      courses: [],
      isLoading: false,
      checkMaxUnits: this.$store.state.selectedSearchFilters.selectedMaxUnits,
      checkMinUnits: this.$store.state.selectedSearchFilters.selectedMinUnits,
    };
  },
  created: function() {

    this.quarters = this.getQuarters();

    api
        .departments()
        .then(response => (this.departments = response.data))
        .then(() => {
          // default option is set in v-slot:first, but it doesn't trigger watch of the current department. This tricks it to update
          this.currentDepartment = "";
          this.currentDepartment = this.$store.state.selectedDepartment;
        });

    api.requirements().then((response) => {
      let colleges = groupBy(response, 'collegeCode');
      Object.keys(colleges).forEach((college) => { colleges[college] = uniqBy(colleges[college], 'requirementCode') });
      this.requirements = colleges;
      if (this.currentCollege != null) {
        for (let requirementArea of this.requirements[this.currentCollege]) {
          if (Object.values(requirementArea)[0] == this.searchFilters.selectedRequirement) {
            return;
          }
        }
      }
      this.searchFilters.selectedRequirement = null;
    });
  },
  computed: {
    currentQuarter: {
      get: function() {
        return this.$store.state.selectedQuarter;
      },
      set: function(newQuarter) {
        this.$nextTick(() =>
            this.$store.commit("setSelectedQuarter", newQuarter)
        );
      },
    },
    /**
     * Returns the array of departments ordered by their display names. Does not mutate this.departments.
     */
    orderedDepartments: function() {
      return sortBy(this.departments, 'deptTranslation');
    },
    /**
     * Returns boolean value. True if all combinations of lectures conflict, false if all do not conflict.
     */
    lecturesConflict: function() {
      return allCombinationsOfLecturesConflict(
          this.$store.getters.selectedClassSections.filter(
              class_ => class_.isLecture
          )
      );
    },
    selectedSearch: function() {
      return this.searchFilters.search;
    },
    selectedFullClasses: function() {
      return this.searchFilters.fullClasses;
    },
    selectedGraduateClasses: function() {
      return this.searchFilters.graduateClasses;
    },
    selectedRequirement: function() {
      return this.searchFilters.selectedRequirement;
    },
    /**
     * Group the selected quarter and department so we can watch them with the same handler
     */
    selectedQuarterAndDepartmentAndFilters: function() {
      return [this.currentQuarter, this.currentDepartment, this.searchFilters];
    },
    /**
     * Returns boolean to indicate whether the currently selected quarter is a summer quarter.
     */
    currentQuarterIsSummer: function() {
      const quarter = this.quarters.find(q => q.quarter == this.currentQuarter);
      return quarter != undefined ? quarter.category == 'SUMMER' : false;
    },
    /**
     * If the current quarter is a summer quarter, this returns the courses filtered by session.
     */
    filteredCourses: function() {
      return this.currentQuarterIsSummer ? this.courses.filter(c => c.session == this.currentSession) : this.courses;
    }
  },
  methods: {
    isNumeric: function(str) {
      if (typeof str != "string") return false // we only process strings!
      return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
          !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
    },
    checkValidKey: function(e) {
      if (!this.isNumeric(e.key) && e.key != "Backspace") {
        e.preventDefault();
      }
    },
    blurSetMin: function() {
      // check if checkMinUnits is not empty
      if (this.searchFilters.minUnits == "") {
        this.$store.commit("setSelectedMinUnits", "0");
        return;
      }
      // check if checkMinUnits is greater than checkMaxUnits
      if (parseInt(this.searchFilters.minUnits) > parseInt(this.searchFilters.maxUnits)) {
        this.searchFilters.minUnits = this.searchFilters.maxUnits;
      }
      this.$store.commit("setSelectedMinUnits", this.searchFilters.minUnits);
    },
    blurSetMax: function() {
      // check if checkMaxUnits is a integer
      let intMinUnits = parseInt(this.searchFilters.minUnits);
      let intMaxUnits = parseInt(this.searchFilters.maxUnits);
      // check if maxUnits is not empty
      if (this.searchFilters.maxUnits == "") {
        this.$store.commit("setSelectedMaxUnits", "5");
        return;
      }
      // check if checkMaxUnits is less than 20
      if (intMaxUnits > 20) {
        this.searchFilters.maxUnits = "20";
      }
      // check if checkMaxUnits is smaller than checkMinUnits
      if (intMaxUnits < intMinUnits) {
        this.searchFilters.maxUnits = this.searchFilters.minUnits;
      }
      this.$store.commit("setSelectedMaxUnits", this.searchFilters.maxUnits);
    },
    toggleCourseSelector: function() {
      this.isOpen = !this.isOpen;
    },
    getQuarters: function() {
      return getQuarters();
    },
    /*
    * Method for adding selected courses to the store
    */
    addToStore: function() {
      this.$store.commit('addSelectedCourse', this.courses.find(c => c.courseId == this.currentCourse));
    },
    /**
     * Intercepts changes in quarter/session selectors and prompts the user for confirmation.
     */
    confirmUserSelection(newVal, oldVal, selection) {
      const modalOptions = {
        title: 'Are you sure?',
        headerBgVariant: 'warning',
        okTitle: 'Continue'
      };

      if (this.$store.state.selectedCourses.length > 0 && newVal != oldVal) {
        this.$bvModal
            .msgBoxConfirm('Changing your quarter or session will clear your courses and schedules.', modalOptions)
            .then(ok => {
              if (ok) {
                this[selection] = newVal;
                this.currentCourses = [];
              } else { // cancel
                this[selection] = oldVal; // reset
              }
            })
      } else {
        this[selection] = newVal;
      }
    },
    fetchCourses: async function() {
      this.isLoading = true;
      let filters = this.searchFilters;
      //format the filters with proper query names and values
      let filterQuery = {
        courseId: filters.search,
        pageNumber: this.currentPage,
        pageSize: filters.pageSize,
        minUnits: filters.minUnits == "" ? "0" : filters.minUnits,
        maxUnits: filters.maxUnits == "" ? "20" : filters.maxUnits,
        objLevelCode: filters.graduateClasses ? "" : "U",
        openSections: !filters.fullClasses,
        deptCode: this.currentDepartment,
        areas: this.currentCollege ? filters.selectedRequirement : "",
      }

      let resp;
      try {
        resp = await api.coursesWithFilters(this.currentQuarter, filterQuery);
      } catch(error) {
        alert("Error occured while fetching search results. Please refresh the page and try again.");
        console.error(error);
      }

      this.isLoading = false;
      if (resp.data){
        this.maxPages = Math.ceil(resp.data.total / this.searchFilters.pageSize);
        return resp.data.classes;
      }
      return [];
    },
    handleScroll({ target: { scrollTop, clientHeight, scrollHeight }}) {
      const currentHeight = scrollTop + clientHeight;
      const buffer = 10;
      if ((currentHeight + buffer) >= scrollHeight && !this.isLoading && this.currentPage < this.maxPages) {
        this.currentPage += 1;
        this.appendCurrentPage();
        return;
      }
    },
    appendCurrentPage() {
      this.fetchCourses().then((courses) => {
        this.courses = this.courses.concat(courses);
      });
    }
  },
  watch: {
    quarters: function() {
      if(this.quarters.length != 0) {
        if (this.currentQuarter != null) {
          this.currentQuarter = this.quarters.map(q => q.quarter).sort()[this.quarters.findIndex(c => c.quarter == this.currentQuarter)];
        } else {
          this.currentQuarter = this.quarters.map(q => q.quarter).sort()[this.quarters.length - 1];
        }
      }
    },
    currentDepartment: function() {
      this.$store.commit("setSelectedDepartment", this.currentDepartment);
    },
    currentCollege: function () {
      this.$store.commit("setSelectedCollege", this.currentCollege);
    },
    selectedSearch: function() {
      this.$store.commit("setSelectedSearch", this.searchFilters.search);
    },
    selectedRequirement: function() {
      this.$store.commit("setSelectedRequirement", this.searchFilters.selectedRequirement);
    },
    selectedFullClasses: function() {
      this.$store.commit("setSelectedFullClasses", this.searchFilters.fullClasses);
    },
    selectedGraduateClasses: function() {
      this.$store.commit("setSelectedGraduateClasses", this.searchFilters.graduateClasses);
    },
    /**
     * When department or quarter are changed, clear the course options
     * and reload with the new set
     */
    selectedQuarterAndDepartmentAndFilters: {
      handler: debounce(function() {
        //reset page number and courses if user changes filters
        this.currentPage = 1;
        this.courses = [];
        this.fetchCourses().then((courses) => {
          this.courses = courses;
        });
      }, 800),
      //watch the nested object in searchFilters
      deep: true
    },
  },
};
</script>

<style>
.course-search-results {
  overflow-y: scroll;
  flex: 1 1 0%;
}

#course-selectors {
  margin-top: 4px;
  padding-left: 8px;
  padding-right: 8px;
  display: flex;
  flex-direction: column;
  flex: 0 1 auto;
}

.form-group.course-selector {
  margin-bottom: 8px;
}

#addCourse:hover {
  cursor: pointer;
}


</style>