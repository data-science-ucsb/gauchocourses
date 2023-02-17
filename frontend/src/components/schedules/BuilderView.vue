<!--Generate a schedule that is buildable by the user (eventClick)
1. Create a FullCalendar component w/ALL POSSIBLE EVENTS
  a.

2. Events list must include a custom field:
  a. ID
  b. Title
  c. Time and Dates
  e1. Whether it is a lecture or a section
  e. An array of ids that links lectures and sections
  d. Whether it is selected or not
  d1. An array of ids that links similar classes
  f. An array of ids that shows concurrency (thus when reshowing/hiding it parses through the array, and then each element's array, etc.)
3. Then, when  user clicks on an event
  a. Check if it's already been selected or not
  b. If selected: unselect it and reshow all concurrent
  c. If currently unselected: Set selected, check if is is a CustomEvent (do nothing),Lecture (do nothing) or Section (Select corresponding Lecture, thus need a method function), then get rid of similar classes (and their sections), then get rid of concurrent classes (and their sections)




-->

<!--          :schedule="this.$store.state.selectedCustomEvents.concat(this.$store.state.selectedCourses)"-->


<template>
  <b-row>
    <b-col
        cols="12"
        :md="numColumns">
<!--      <ScheduleB-->
<!--          :customEvents="$store.state.selectedCustomEvents"-->
<!--          :courses="$store.state.selectedCourses"-->
<!--          :showEditButton="showEditButton"-->
<!--          class="mb-4"-->
<!--      ></ScheduleB>-->
      <ScheduleC
        :customEvents="$store.state.selectedCustomEvents"
        :courses="$store.state.selectedCourses"
        :showEditButton="showEditButton"
        class="mb-4"
      ></ScheduleC>

    </b-col>
  </b-row>
</template>

<script>
//replace with new component
import ScheduleC from "./ScheduleC.vue";

export default {
  props: {
    //number of schedules to show (1,2,4)
    numShow: {
      //type: Number,
      required: true,
      default: 1,
    },
    courses: {
      type: Array,
      required: false,
    },
    showEditButton: {
      type: Boolean,
      default: false
    }
  },
  components: {
    ScheduleC,
  },
  computed: {
    numColumns: function () {
      switch (this.numShow) {
        case "1": return "12";
        case "2": return "6";
        case "4": return "6";
        default: return "12";
      }
    }
  },
};
</script>

<style>

</style>
