<!--
    Wrapper for FullCalendar, an open-source Javascript calendar.
    https://fullcalendar.io/docs/vue
    https://fullcalendar.io/docs#toc
-->

<template>
    <div id="outer-box">
        <div id="inner-box"
            :class="{ 'error-overlay': !!this.$slots.default }">
            <slot>
                <!-- Slot for alerts to render on top of the schedule. -->
            </slot>
        </div>
        <FullCalendar
            v-if="doneLoading"
            id="weekly-calendar"
            :events="events"
            :plugins="calendarPlugins"
            :weekends="false"
            :columnHeaderText="columnHeaderText"
            height=auto
            allDaySlot=false
            defaultView="timeGridWeek"
            header=false
            editable=false
            minTime="08:00:00"
            maxTime="20:00:00"
        />
        <div v-else>
            Loading...
        </div>
    </div>
    <!-- v-on:_eventsPositioned="manuallyFixCSS()" -->
</template>

<script>
import FullCalendar from '@fullcalendar/vue';
import timeGridPlugin from '@fullcalendar/timegrid';
import $ from 'jquery';
import api from '@/components/backend-api.js';
import { getBackgroundColor, getBorderColor } from '@/components/util/color-utils.js'

export default {
    components: {
        FullCalendar
    },
    props: {
      courses: {
        //Array of the selected
        type: Array,
        required: false
      },
      schedule: {
        type: Object,
        required: false
      }
    },
    created: function() {
      if((this.courses == undefined) && (this.schedule != null)) {
        const codes = this.schedule.classes.map(a => a.scheduledEnrollCodes[0]);
        Promise.all(codes.map(code => api.coursefromEnrollCode(this.schedule.quarter, code)))
            .then(responses => {
                this.coursesComputed = responses.map(r => r.data.classes[0]);
                this.doneLoading = true;
            });
      }
      else if (this.schedule == undefined){
        this.doneLoading = true;
      }
    },
    data: function() {
        return {
            calendarPlugins: [ timeGridPlugin ],
            coursesComputed: [],
            doneLoading: false
        }
    },
    computed: {
      /**
       * The schedules array is mapped to a format that can be passed to the WeeklySchedule component.
       * This array has the same length as the schedules array.
       */
      events: function() {
        if ((this.courses == undefined) && (this.schedule != null)) {
          return this.parseScheduleToEventList(this.schedule, this.coursesComputed);
        } else if (this.schedule != null) {
          return this.parseScheduleToEventList(this.schedule, this.courses);
        } else {
            return [];
        }
      }
    },
    mounted: function() {
        this.manuallyFixCSS();
    },
    methods: {
      /**
      * Parses a schedule and maps the enroll codes to the data format for WeeklySchedule from courses.
      */
      parseScheduleToEventList: function(schedule, courses) {
        const _this = this;
          function classSectionToFullCalendarEvent(classSection) {
              const course = courses.find(course => course.courseId == classSection.courseId);

              if(classSection.name != undefined){ //if it is a custom event
                const dayInt = {
                    'MONDAY': 1,
                    'TUESDAY': 2,
                    'WEDNESDAY': 3,
                    'THURSDAY': 4,
                    'FRIDAY': 5,
                    'SATURDAY': 6,
                };
                return {
                  title: classSection.name,
                  daysOfWeek: classSection.timeLocations[0].fullDays.map(a => dayInt[a]),
                  startTime: classSection.timeLocations[0].beginTime,
                  endTime: classSection.timeLocations[0].endTime,
                  color: getBackgroundColor(classSection.name)
                }
              }
              else{
            return classSection.scheduledEnrollCodes.map(section => _this.eventFromEnrollCode(section,course));
          }
        }
          var totalevents = schedule.classes.map(classSectionToFullCalendarEvent).flat(); //do this function to all of the classes
          var customevents = schedule.customEvents.map(classSectionToFullCalendarEvent);

          customevents.forEach((item) => {
            totalevents.push(item);
          });
          return totalevents;
    },
    /* Uses an enroll code and the course object to return an event object
    * that is compatible with FullCalendar.
    */
    eventFromEnrollCode: function(enrollcode,course){
      const section = course.classSections.find(section => section.enrollCode == enrollcode);
      const dayInt = {
          'MONDAY': 1,
          'TUESDAY': 2,
          'WEDNESDAY': 3,
          'THURSDAY': 4,
          'FRIDAY': 5,
          'SATURDAY': 6,
      };

       if (section.timeLocations.length == 1) {
          return {
              title: course.fullCourseNumber,
              daysOfWeek: section.timeLocations[0].fullDays.map(a => dayInt[a]),
              startTime: section.timeLocations[0].beginTime,
              endTime: section.timeLocations[0].endTime,
              borderColor: getBorderColor(course.deptCode),
              backgroundColor: getBackgroundColor(course.courseId.slice(7,14))
          }
      } else {
          var multipleevents = [];
          var multipletimeandplace = section.timeLocations
          var classinfo = {
              title: course.fullCourseNumber,
              daysOfWeek: "",
              startTime: "",
              endTime: "",
              borderColor: getBorderColor(course.deptCode),
              backgroundColor: getBackgroundColor(course.courseId.slice(7,14))
          }
          for (var k = 0; k < multipletimeandplace.length; k++) {
              classinfo.classSections.daysOfWeek = multipletimeandplace[k].daysOfWeek.map(a => dayInt[a]);
              classinfo.classSections.startTime = multipletimeandplace[k].beginTime;
              classinfo.classSections.endTime = multipletimeandplace[k].endTime;
              multipleevents.push(classinfo);
          }
          return multipleevents;
    }
  },
        manuallyFixCSS: function() {
            // This removes the "allDaySlot". The Vue plugin for FullCalendar does not remove it
            // even though it is configured to remove it
            $('.fc-day-grid').remove();
            $('.fc-divider.fc-widget-header').remove();

            // Remove empty toolbar
            $('.fc-toolbar').remove();
        },
        columnHeaderText: function(date) {
            switch (date.getDay()) {
                case 1: return 'Mon';
                case 2: return 'Tues';
                case 3: return 'Wed';
                case 4: return 'Thurs';
                case 5: return 'Fri';
                case 6: return 'Sat';
                default: return ' ';
            }
        }
    }
}
</script>

<style>
@import '~@fullcalendar/core/main.css';
@import '~@fullcalendar/timegrid/main.css';
@import '~@fullcalendar/daygrid/main.css';

/* Transparent background. Fix for issue #78 */
.fc-unthemed td.fc-today {
    background: #dee2e600;
}

#outer-box {
    position: relative;
}

#inner-box {
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    position: absolute;
    padding: 0;
}

.error-overlay {
    background-color: rgb(128,128,128, 0.5);
}

#inner-box > * {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 65%;
    z-index: 999;
}

</style>
