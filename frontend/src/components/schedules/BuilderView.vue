<template>
  <b-row>
    <b-col
        cols="12"
        :md="12">
      <ScheduleC
        v-if="(this.$store.state.selectedCustomEvents.length + this.$store.state.selectedCourses.length) != 0"
        :key="this.$store.state.selectedCustomEvents.length + this.$store.state.selectedCourses.length"
        :customEvents="$store.state.selectedCustomEvents"
        :courses="$store.state.selectedCourses"
        :conflicting="conflicting"
        class="mb-4"
      ></ScheduleC>

    </b-col>
  </b-row>
</template>

<script>
import ScheduleC from "./ScheduleC.vue";

export default {
  props: {
    courses: {
      type: Array,
      required: false,
    },
    conflicting: {
      type: Boolean,
      required: false,
    },
    numberSelectedEvents: {
      type: Number,
      required: false,
    }
  },
  components: {
    ScheduleC,
  },
};
</script>

<style>

</style>
