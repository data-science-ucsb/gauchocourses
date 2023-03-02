<template>
  <b-row>
    <b-col
        cols="12"
        :md="12">
      <ScheduleC
        v-if="schedules"
        :customEvents="$store.state.selectedCustomEvents"
        :courses="$store.state.selectedCourses"
        class="mb-4"
      ></ScheduleC>

    </b-col>
  </b-row>
</template>

<script>
import ScheduleC from "./ScheduleC.vue";

export default {
  props: {
    schedules: {
      type: Number,
      required: false,
    },
    courses: {
      type: Array,
      required: false,
    },
  },
  components: {
    ScheduleC,
  },
};
</script>

<style>

</style>
