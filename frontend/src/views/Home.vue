<template>
  <div>
    <b-container fluid>
      <b-row>
        <b-col sm="12" md="12" lg="3">
          <b-row>
            <b-col sm="12" md="6" lg="12" class="p-1 home-course-selectors"><CourseSelectors class="h-100" /></b-col>
            <b-col sm="12" md="6" lg="12" class="p-1 home-selected-events"><SelectedEvents class="h-100" /></b-col>
          </b-row>
        </b-col>
        <b-col sm="12" md="12" lg="9" class="p-1"><SchedulePaginator :schedules="schedules" class="h-100"/></b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>

import CourseSelectors from "@/components/events/CourseSelectors.vue";
import SelectedEvents from "@/components/events/SelectedEvents.vue";
import SchedulePaginator from "@/components/schedules/SchedulePaginator.vue";
import api from '@/components/backend-api.js';


export default {
  name: "home",
  components: {
    CourseSelectors,
    SelectedEvents,
    SchedulePaginator,
  },
  data: function() {
      return {
        schedules: [],
      }
    },
  created: function() {
      // Register event hooks
      this.$eventHub.$on('generate-schedules', this.retrieveSchedules); //Generates schedules on this event
  },
  methods: {
    /**
    * Retrieves all schedules for the classSections and custom events properties.
    */
    retrieveSchedules: async function() {
        const pageSize = 50;
        this.schedules = [];  // Clear last set of schedules
        let currentIndex = 0;
        let lastIndex = null;
        while (currentIndex != lastIndex) {
          if(this.classSections.length == 0) {
            break;
          }
            const response = await api.schedules(
                this.classSections.filter(c => c.timeLocations.length != 0 && c.timeLocations[0].beginTime != null),  // Mitigation for gitHub issue #106
                currentIndex,
                this.customEvents,
                pageSize
            )
            if (response.status > 400) {
                break;
            } else {
                this.schedules.push.apply(this.schedules, response.data.schedules);
                this.schedules.forEach((item) => {
                  item.quarter = this.$store.state.selectedQuarter;
                });

                lastIndex = currentIndex;
                currentIndex = response.data.lastScheduleIndex;
            }
        }
        this.$appInsights.trackMetric({
            name: 'schedules_generated',
            count: this.schedules.length
        })

    },
  },
  computed: {
    customEvents: function(){
      return this.$store.state.selectedCustomEvents;
    },
    courses: function(){
      return this.$store.state.selectedCourses;
    },
    classSections: function(){
      return this.$store.getters.selectedClassSections;
    }
  }
};
</script>

<style>
.home-course-selectors {
  height: 465px;
}
.home-selected-events {
  height: 265px;
}

@media (min-width: 992px) {
  /* 60% of view height - height of nav bar / 2 */
  .home-course-selectors {
    height: calc(60vh - 56px/2);
  }
  .home-selected-events {
    height: calc(40vh - 56px/2);
  }
}
</style>
