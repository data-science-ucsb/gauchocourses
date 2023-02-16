<template>
  <div>
    <b-container fluid>
      <b-row>
        <b-col sm="12" md="12" lg="3">
          <b-row>
            <b-col sm="12" md="6" lg="12" class="p-1" :class="selectedIsOpen? 'open-course-selectors' : 'close-course-selectors'">
              <CourseSelectors class="h-100" />
            </b-col>
            <b-col sm="12" md="6" lg="12" class="p-1" :class="selectedIsOpen? 'open-selected-events' : 'close-selected-events'">
              <SelectedEvents class="h-100" :selectedIsOpen="selectedIsOpen" :toggleSelected="toggleSelected" />
            </b-col>
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
        selectedIsOpen: true
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
    },
    toggleSelected: function() {
      this.selectedIsOpen = !this.selectedIsOpen;
    }
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
.open-course-selectors {
  height: 460px;
}
.open-selected-events {
  height: 250px;
}

.close-course-selectors {
  height: 645px;
}
.close-selected-events {
  height: 65px;
}
</style>
