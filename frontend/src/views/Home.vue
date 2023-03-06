<template>
  <div>
    <b-container fluid>
      <b-row>
          <div class="sidebar" :style="{ width: sidebarWidth + 'px', minWidth: minSidebarWidth + 'px' }">
            <b-row>
              <b-col sm="12" md="6" lg="12" class="p-1 home-course-selectors"><CourseSelectors class="h-100" /></b-col>
              <b-col sm="12" md="6" lg="12" class="p-1 home-selected-events"><SelectedEvents class="h-100" /></b-col>
            </b-row>
            <div class="resize-handle" v-on:mousedown="startResize" v-on:mouseup="stopResize"></div>
          </div>
        <b-col xs="6" class="p-1"><SchedulePaginator :schedules="schedules" class="h-100"/></b-col>
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
        sidebarWidth: 350,
        minSidebarWidth: 250,
        isResizing: false
      }
    },
  created: function() {
      // Register event hooks
      this.$eventHub.$on('generate-schedules', this.retrieveSchedules); //Generates schedules on this event
  },
  methods: {
    // Sidebar resizing methods
    startResize(event) {
      this.isResizing = true

      const startX = event.clientX
      const initialWidth = this.sidebarWidth

      const handleMouseMove = (event) => {
        const width = initialWidth + (event.clientX - startX)
        this.sidebarWidth = Math.max(this.minSidebarWidth, width)
      }

      const handleMouseUp = () => {
        this.isResizing = false
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    stopResize() {
      this.isResizing = false
    },
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
  },
  mounted() {
    document.addEventListener('mousemove', this.handleResize)
  },
  beforeUnmount() {
    document.removeEventListener('mousemove', this.handleResize)
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
.sidebar {
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
  max-width: 750px;
}

.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 3px;
  height: 100%;
  cursor: col-resize;
  background-color: #dddcdc;
  z-index: 1;
}

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
