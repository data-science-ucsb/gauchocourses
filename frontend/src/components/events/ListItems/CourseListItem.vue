<template>
  <EventListItem v-if="isValid"
    :title="course.courseId"
    :borderColor="borderColor"
    :backgroundColor="backgroundColor"
    :full="full"
    :randomId="randomId"
    :custom=false
  >
    <template v-slot:subtext>
      <strong>{{ displayUnits }}</strong>
      &middot; {{ course.description.substring(0,25)+'...' }}
    </template>
    <template v-slot:popoverContent>
      <div v-if="Object.getOwnPropertyNames(groupedRequirements).length != 0">
        <div v-for="[college, ges] in Object.entries(groupedRequirements)" v-bind:key="college">
          <span> <strong> {{ college }} GE's: </strong> </span>
          <template v-for="ge in ges.sort((a, b) => {return a.geCode > b.geCode ? 1:-1})">
            <span v-if="ge!=ges.sort((a, b) => {return a.geCode > b.geCode ? 1:-1}).at(-1)" v-bind:key="ge.geCode">{{ ge['geCode'].trim() }}, </span>
            <span v-else v-bind:key="ge.geCode">{{ ge['geCode'].trim() }}</span>
          </template>
        </div>
      </div>
      <div v-else>
        <strong>GE's: </strong> None
      </div>
      <strong>Units: </strong>{{ displayUnits }}
      <br />
      <strong>College: </strong>{{ course.college }}
      <br />
      <strong>Description: </strong><small>{{ course.description }}</small>
    </template>
    <template v-slot:buttons>
      <slot name="buttons"></slot>
    </template>
  </EventListItem>
</template>

<script>
import EventListItem from "@/components/events/ListItems/EventListItem.vue";
import { getBackgroundColor, getBorderColor } from "@/components/util/color-utils.js";
import { groupBy } from "@/components/util/util-methods.js";

export default {
  props: {
    course: {
      type: Object
    }
  },
  components: {
    EventListItem
  },
  computed: {
    /**
     * Returns a string with the border color for the event
     */
    borderColor: function() {
      // TODO: Once we have class definitions on the frontend, consolidate any usages of "getColor" stuff to the class definitions.
      return getBorderColor(this.course.deptCode);
    },
    /**
     * Returns a string with the border color for the event
     */
    backgroundColor: function() {
      // TODO: Once we have class definitions on the frontend, consolidate any usages of "getColor" stuff to the class definitions.
      let ctx = document.createElement('canvas').getContext('2d');
      ctx.fillStyle = getBackgroundColor(this.course.courseId);
      return ctx.fillStyle;
    },
    /**
     * Returns whether or not a course is completely full
     */
    full: function() {
      for (let i = 0; i < this.course.classSections.length; i++) {
        if (this.course.classSections[i].enrolledTotal < this.course.classSections[i].maxEnroll) {
          return false;
        }
      }
      return true;
    },
    /**
     * Returns whether or not a course is cancelled or still TBA
     */
    isValid: function() {
      for (let i = 0; i < this.course.classSections.length; i++) {
        if (this.course.classSections[i].timeLocations?.length != 0 && this.course.classSections[i].classClosed?.trim() != "Y" && this.course.classSections[i].courseCancelled?.trim() != "C") {
          return true;
        }
      }
      return false;
    },
    /**
     * Returns the requirements fulfilled by the course, grouped by the college.
     */
    groupedRequirements: function() {
      if (this.course.generalEducation) {
        return groupBy(this.course.generalEducation, a => a.geCollege);
      } else {
        return {};
      }
    },
    /**
     * Returns display text for the units. Some courses have variable units, others are fixed.
     */
    displayUnits: function() {
      if (this.course.unitsFixed) {
        return this.course.unitsFixed + " units";
      } else {
        return (
          this.course.unitsVariableLow +
          " to " +
          this.course.unitsVariableHigh +
          " units"
        );
      }
    },
    /**
     * Returns short id used by popovers so that they are only binded to one course.
     */
    randomId: function() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    },
  }
};
</script>

<style>
</style>