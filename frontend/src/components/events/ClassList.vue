<template>
  <!--
    A modal that shows the class sections for a selected course. Allows the user to de-select and re-select the
    classSections.
  -->
  <div id="ClassListModal">
    <b-modal
      id='classlist-modal'
      v-model="showingModal"
      :title="this.courseId"
      :scrollable='true'
      ref="modal"
      :hide-footer='true'
      @hidden="handleModalClosing" 
      header-bg-variant="secondary"
      header-text-variant="light"
    >
      <b-container>
        <div>
          <b-row align-h="center" align-content="center">
            <b-col cols='12'>
              <p>
                The selected classes below will be used to find schedules.
              </p>
            </b-col>
          </b-row>

          <b-card no-body>
            <template v-slot:header>
              <b-form-checkbox
                v-model="indeterminate"
                :indeterminate="classSections.length != classSections.filter(c => c.selected).length"
                @change="toggleAllClassSections">
                {{ indeterminate ? 'Deselect All' : 'Select All' }}
              </b-form-checkbox>
            </template>
            <b-list-group flush>
              <b-list-group-item
                v-for="class_ in this.classSections"
                v-bind:key="class_.enrollCode"
                :variant="class_.tableColor"
                v-bind:class="{'ml-5': !class_.isLecture}">
                <div class="d-flex w-100 justify-content-between">
                  <b-form-checkbox v-model="class_.selected" @change="selectionChanged($event, class_)"/>
                  <h5 class="text-center" style="white-space: pre;">{{ printDaysAndTimes(class_.timeLocations) }}</h5>
                  <small class="ml-1">{{ printUnits(class_) }}</small>
                </div>
                <b-form-invalid-feedback :state="selectionsAreValid">Select a least one lecture</b-form-invalid-feedback>
                <small class="mb-1">
                  <strong>{{ class_.isLecture ? 'Lecture' : 'Section' }}</strong>
                  {{ printBuildingsAndRooms(class_.timeLocations) }} {{ printInstructors(class_.instructors) }}
                  <br />
                  Enroll code: {{class_.enrollCode}}
                </small>
              </b-list-group-item>
            </b-list-group>
          </b-card>
        </div>
      </b-container>
    </b-modal>
  </div>
</template>

<script>

export default {
  name: "ClassList",
  data: function() {
    return {
      courseId: null,
      showingModal: false,
      showDismissibleAlert: false,
      indeterminate: false,
    };
  },
  created: function() {
    // Register event handlers
    this.$eventHub.$on("edit-classes-for-course", this.init);
  },
  computed: {
    course: function() {
      return this.$store.state.selectedCourses.find(c => c.courseId == this.courseId);
    },
    classSections: function() {
      return (this.courseId == null) ? [] : this.course.classSections;
    },
    classListIsEmpty: function() {
      return this.course == undefined ? true : false;
    },
    selectionsAreValid: function() {
      return this.classSections.filter(c => c.isLecture && c.selected).length >= 1;
    }
  },
  methods: {
    /**
     * Initializer, called whenever the event "edit-classes-for-course" is received.
     * Uses the courseId from the event to get the course and show the modal.
     */
    init: function(course) {
      this.courseId = course;
      this.showingModal = true;
    },
    /**
     * Called when a user changes their checkbox selection. Modifies the user's selection appropriately.
     */
    selectionChanged: function(checked, class_) {
      const isLecture = this.classSections.find(x => x.enrollCode == class_.enrollCode).isLecture;

      if (isLecture) {   // Apply selection to the lecture's sections
        const group = this.classSections.filter(c => c.lectureSectionGroup == class_.lectureSectionGroup);
        group.forEach(c => this.$store.commit('changeClassSectionSelection', {courseId: this.courseId, enrollCode: c.enrollCode, selected: checked}))
      } else {
        this.$store.commit('changeClassSectionSelection', {courseId: this.courseId, enrollCode: class_.enrollCode, selected: checked});
        const lecture = this.classSections.find(c => c.isLecture && c.lectureSectionGroup == class_.lectureSectionGroup);
        if (!lecture.selected) {  // Select the section's lecture as well 
          this.$store.commit('changeClassSectionSelection', {courseId: this.courseId, enrollCode: lecture.enrollCode, selected: true});
        }
      }
    },
    /**
     * Sets all the classSections "selected" prop to isChecked.
     */
    toggleAllClassSections: function(isChecked) {
      this.course.classSections.forEach(c => {
        this.$store.commit('changeClassSectionSelection', {courseId: this.courseId, enrollCode: c.enrollCode, selected: isChecked});
      });
    },
    /**
     * Handle user trying to close the modal
     */
    handleModalClosing: function(bvModalEvt) {
      bvModalEvt.preventDefault();  // Prevent modal from closing
      if (!this.selectionsAreValid) {  // Check validation prop
        return;
      }
      // Finally, hide the modal manually
      this.$nextTick(() => this.$bvModal.hide('classlist-modal'))
    },
    /**
     * Neatly prints a condensed representation of the days for a course in the format "MTWRF"
     */
    printDaysAndTimes: function(timesandplaces) {
      const cleanTime = (rawtime) => { 
        var cuttime = "";
        var inttime = 0;
        var ending = "AM";
        var goodtime = "";
        var stringgoodtime = "";

        cuttime = rawtime.substring(2, rawtime.length-3); //cuts seconds off of a time
        inttime = parseInt(rawtime.substring(0, 2)); //turns in the hours of a time to an int

        if (inttime > 12) {
          //24 hour clock into 12 hour clock
          inttime = inttime - 12;
          ending = "PM";
        } else if (inttime == 12) {
          ending = "PM";
        }
        stringgoodtime = inttime.toString();
        goodtime = stringgoodtime.concat(cuttime, ending);

        return goodtime;
      }
      const abbreviateDays = (days) => {
        var goodDays = "";
        if(days.includes("M")){
          goodDays+="Mon "
        }
        if(days.includes("T")){
          goodDays+="Tue "
        }
        if(days.includes("W")){
          goodDays+="Wed "
        }
        if(days.includes("R")){
          goodDays+="Thu "
        }
        if(days.includes("F")){
          goodDays+="Fri "
        }
        return goodDays;
      }
      var a = "";
      if (timesandplaces.length == 0) {
        a = "This class doesn't have a meeting time";
      } else {
        for (var i = 0; i < timesandplaces.length; i++) {
          if (timesandplaces[i].beginTime == null) {
            a = "This class doesn't have a meeting time";
          } else {
            if (i >= 1) {
              a += "\n" + " and ";
            }

            a += abbreviateDays(timesandplaces[i].days);

            a += cleanTime(timesandplaces[i].beginTime);
            a += " - ";
            a += cleanTime(timesandplaces[i].endTime);
            if (a != timesandplaces.length - 1) {
              a += " ";
            }
          }
        }
      }
      return a;
    },
    /**
     * Neatly prints buildings and room numbers; handles multiple timesAndPlaces
     */
    printBuildingsAndRooms: function(timesandplaces) {
      var b = "in ";

      if (timesandplaces.length > 0) {
        for (var i = 0; i < timesandplaces.length; i++) {
          if (timesandplaces[i].building == null) {
            b = "";
          } else {
            if (i >= 1) {
              b += "and ";
            }
            b += timesandplaces[i].building;
            b += " ";
            b += timesandplaces[i].room;
            b += " ";
          }
        }
      } else {
        b = "";
      }
      return b;
    },
    /**
     * Neatly prints the units for lectures.
      */
    printUnits: function(class_) {
      if (class_.isLecture) {
        const baseStr= this.course.unitsFixed != null ? this.course.unitsFixed.toString() : this.course.unitsVariableLow.toString()+' - '+this.course.unitsVariableHigh.toString();
        return baseStr + ' units'
      }
    },
    /**
     * Neatly prints the instructors
     */
    printInstructors: function(instructors) {
      return instructors.length > 0 ? 'by '+instructors[0].instructor : '';
    }
  }
};
</script>

<style scoped>

</style>
