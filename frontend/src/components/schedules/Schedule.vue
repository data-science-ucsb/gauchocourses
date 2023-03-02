<!--
    Wrapper for FullCalendar, an open-source Javascript calendar.
    https://fullcalendar.io/docs/vue
    https://fullcalendar.io/docs#toc
-->
<template>
<div>
  <div style="display: flex;">
    <b-button variant="primary" ref="button" @click="exportPDF">Export to PDF</b-button>
    <b-button variant="info" ref="button" @click="createEvent">Google Calendar</b-button>
  </div>
  <b-card no-body ref="schedule">
    <template v-slot:header>
      <div class="no-wrap d-flex flex-row align-items-center">
        <span class="d-inline-block" tabindex="0">
          <font-awesome-icon
            v-if="schedule.favorited"
            icon="heart"
            size="sm"
            :id="'favorite-icon'+_uid"
            style="color: #ED0303;"
            @click="unFavoriteSchedule(schedule)"
          />

          <font-awesome-icon
            v-else
            icon="heart"
            size="sm"
            :id="'favorite-icon'+_uid"
            style="color: #FFC7C7;"
            @click="saveSchedule(schedule)"
          />
        </span>

        <b-tooltip
          v-if="!$store.getters.userIsAuthenticated"
          :target="'favorite-icon'+_uid">
          Sign in to save schedules.
        </b-tooltip>

        <b-toast :id="'deleted-toast-' + _uid" title="You deleted a schedule!" variant="warning">
          The schedule, "{{schedule.name}}" was deleted. Click the button to undo.
          <b-button @click="saveSchedule(schedule)" variant="warning">Undo</b-button>
        </b-toast>

        <b-button
          :id="'popover-button-sync-' + _uid"
          variant="link"
          ref="button"
          @click="popoverShow = !popoverShow"
        >{{ updatedScheduleName }}</b-button>

        <b-popover
          :id="'popover'+ _uid"
          :show.sync="popoverShow"
          :target="'popover-button-sync-' + _uid"
          placement="bottom"
        >
          <template v-slot:title>
            <b-button @click="onClose" class="close" aria-label="Close">
              <span class="d-inline-block" aria-hidden="true">&times;</span>
            </b-button>Enter schedule name:
          </template>
          <b-row>
            <b-col cols="10" class="px-2">
              <b-form-input v-model="scheduleName"></b-form-input>
            </b-col>
            <b-col class="p-2">
              <font-awesome-icon
                icon="check"
                size="sm"
                style="color: #428bca;"
                @click="saveName()"
              />
            </b-col>
          </b-row>
        </b-popover>

        <div v-if="showEditButton">
          <router-link v-on:click.native="editSchedule(schedule)" :to="{name:'home'}">
            <font-awesome-icon
            icon="edit"
            size="sm" />
            </router-link>
        </div>
        
      </div>
    </template>

    <div v-if="doneLoading" class="weekly-calendar">
      <FullCalendar
          :options="calendarOptions"
      />
    </div>
    <div v-else class="text-center">
      <b-spinner class="m-2" variant="primary" label="Spinning"></b-spinner>
    </div>
  </b-card>
</div>
</template>

<script>
import FullCalendar from "@fullcalendar/vue";
import timeGridPlugin from "@fullcalendar/timegrid";
import $ from "jquery";
import api from "@/components/backend-api.js";
import {
  getBackgroundColor,
  getBorderColor,
} from "@/components/util/color-utils.js";
import xss from "xss";
import axios from 'axios';
// const API_KEY = 'AIzaSyAy36_Hv2ZYPbVAnEApYakkRcJej67Ko6M';
// const ACCESS_TOKEN = 'ya29.a0AVvZVsoMWlMiHjWqhRGESDjJraYnvD8VqITRaXTHFc9BFpqE3lBQH6TxWM4Tm2CKoQPzW6xpFYIivhjdFs_1FetRrNCgJWwzY_y8tPUGRs9BQgNfbvWRgQvqQpFfvc-geyMOkTsxwqOVYnA29wMRslYcHJhgaCgYKATgSARESFQGbdwaIJT5a7TEyaOSlDYb4KQ9yEw0163';

import { Tooltip } from "bootstrap";
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default {
  components: {
    FullCalendar,
  },
  props: {
    courses: {
      type: Array,
      required: false
    },
    schedule: {
      type: Object,
      required: false,
    },
    showEditButton: {
      type: Boolean,
      default: false,
    }
  },
  data: function () {
    return {
      coursesComputed: [],
      doneLoading: false,
      scheduleSavedStatus: null,
      updatedScheduleName: this.schedule.name,
      scheduleName: this.schedule.name,
      popoverShow: false,
      errors: [],
      scheduleLocal: this.schedule,

    };
  },
  created: function () {
    this.schedule.classes.forEach((course) => {
      const match = this.courses.find(item => item.courseId == course.courseId);
      if (match != undefined) {
        this.coursesComputed.push(match);
      }
    });
    const codesNeeded = [];
    const courseNames = this.coursesComputed.map((course) => course.courseId);
    this.schedule.classes.forEach((course) => {
      if(courseNames.includes(course.courseId) == false) {
        codesNeeded.push(course.scheduledEnrollCodes[0]);
      }
    });

    //Try to find all courses that are in the schedule but wasn't in this.courses
    Promise.all(codesNeeded.map(code => api.coursefromEnrollCode(this.schedule.quarter, code))).then((responses) => {
      responses
        .map(r => r.data.classes[0])
        .forEach(course => this.coursesComputed.push(course));
    })
    .catch(err => console.error(err))
    .finally(() => this.doneLoading = true);
  },
  computed: {
    /**
     * The schedules array is mapped to a format that can be passed to the WeeklySchedule component.
     * This array has the same length as the schedules array.
     */
    calendarOptions: function() {
      return {
        eventDidMount: this.eventDidMount,
        height: 'auto',
        events: this.parseScheduleToEventList(this.schedule, this.coursesComputed),
        headerToolbar: "",
        dayHeaders: true,
        dayHeaderFormat: {weekday: 'short'},
        plugins: [timeGridPlugin],
        weekends: false,
        stickyHeaderDates: false,
        allDaySlot: false,
        initialView: 'timeGridWeek',
        editable: false,
        slotMinTime: this.schedule.sortingAttributes.earliestBeginTime,
        slotMaxTime: this.schedule.sortingAttributes.latestEndTime,
      }
    },
    googleCal: function () {
      return this.createEvent(this.schedule, this.coursesComputed);
    },
    quarter: function () {
      return this.$store.state.selectedQuarter;
    },
  },
  methods: {
    /**
     * Parses a schedule and maps the enroll codes to the data format for WeeklySchedule from courses.
     */
    parseScheduleToEventList: function (schedule, courses) {
      const _this = this;
      function classSectionToFullCalendarEvent(classSection) {
        const course = courses.find(
          (course) => course.courseId == classSection.courseId
        );
        if (classSection.name != undefined) {
          //if it is a custom event
          const dayInt = {
            MONDAY: 1,
            TUESDAY: 2,
            WEDNESDAY: 3,
            THURSDAY: 4,
            FRIDAY: 5,
            SATURDAY: 6,
          };
          return {
            title: classSection.name,
            daysOfWeek: classSection.timeLocations[0].fullDays.map(
              (a) => dayInt[a]
            ),
            startTime: classSection.timeLocations[0].beginTime,
            endTime: classSection.timeLocations[0].endTime,
            color: getBackgroundColor(classSection.name),
            isLecture: 0,
            textColor: "black",
          };
        } else {
          return classSection.scheduledEnrollCodes.map((section) =>
            _this.eventFromEnrollCode(section, course)
          );
        }
      }
      var totalevents = schedule.classes
        .map(classSectionToFullCalendarEvent)
        .flat(); //do this function to all of the classes
      var customevents = schedule.customEvents.map(
        classSectionToFullCalendarEvent
      );

      customevents.forEach((item) => {
        totalevents.push(item);
      });
      console.log(totalevents)
      return totalevents;
    },
    async insertEvent(schedule, courses) {
      //const API_KEY = 'AIzaSyAy36_Hv2ZYPbVAnEApYakkRcJej67Ko6M';
      const accessToken = 'a0AVvZVsoMWlMiHjWqhRGESDjJraYnvD8VqITRaXTHFc9BFpqE3lBQH6TxWM4Tm2CKoQPzW6xpFYIivhjdFs_1FetRrNCgJWwzY_y8tPUGRs9BQgNfbvWRgQvqQpFfvc';

      var eventList = this.parseScheduleToEventList(schedule, courses);

      for (var i = 0; i < eventList.length; i++){
        var title = eventList[i].title;
        var startTime = eventList[i].startTime;
        var endTime = eventList[i].endTime;
        var daysOfWeek = eventList[i].daysOfWeek;
        /* eslint-disable */ //testing purposes
        console.log(title);
        console.log(startTime);
        console.log(endTime);
        console.log(daysOfWeek);
        // Create Google Calendar event
        const event = {
          summary: title,
          start: {
            dateTime: startTime,
            timeZone: 'America/Los_Angeles',
          },
          end: {
            dateTime: endTime,
            timeZone: 'America/Los_Angeles',
          },
        };

        try {
          const response = await axios.post('/api/calendar/create-event',
            event,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );
          console.log(response.data);
        } catch (error) {
          console.error(error);
        }
        // axios({
        //   method: 'post',
        //   url: ('https://www.googleapis.com/calendar/v3/calendars/primary/events'),
        //   headers: {
        //     'Authorization': 'Bearer ' + ACCESS_TOKEN,
        //     'Key': API_KEY
        //   },
        //   data: {
        //     event
        //   },
        // })
        // .then(response => {
        //   // handle success
        //   console.log('Event created:', response.data);
        // })
        // .catch(error => {
        //   // handle error
        //   console.log('ERROR, event not created');
        // });
      }  

      // const event = {
      //   summary: 'Test Event',
      //   description: 'Testing the Google Calendar API',
      //   start: {
      //     dateTime: new Date().toISOString(),
      //     timeZone: 'UTC',
      //   },
      //   end: {
      //     dateTime: new Date().toISOString(),
      //     timeZone: 'UTC',
      //   },
      // };

      // try {
      //   const response = await axios.post(
      //     `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${API_KEY}`,
      //     event,
      //     {
      //       headers: {
      //         Authorization: `Bearer ${accessToken}`,
      //         'Content-Type': 'application/json',
      //       },
      //     }
      //   );
      //   console.log(response.data);
      // } catch (error) {
      //   console.error(error);
      // }
    },
    /**
     * Parses a schedule and map each event to a Google Calendar invite.
     */
    createEvent: function (schedule, courses) {
      //const _this = this;
      var eventList = this.parseScheduleToEventList(schedule, courses);

      for (var i = 0; i < eventList.length; i++){
        var title = eventList[i].title;
        var startTime = eventList[i].startTime;
        var endTime = eventList[i].endTime;
        var daysOfWeek = eventList[i].daysOfWeek;
        /* eslint-disable */ //testing purposes
        console.log(title);
        console.log(startTime);
        console.log(endTime);
        console.log(daysOfWeek);
        // Create Google Calendar event
        const event = {
          summary: title,
          start: {
            dateTime: startTime,
            timeZone: 'America/Los_Angeles',
          },
          end: {
            dateTime: endTime,
            timeZone: 'America/Los_Angeles',
          },
        };

        axios.post('/api/calendar/create-event', {
          // headers: {
          //   'Authorization': 'Bearer ' + ACCESS_TOKEN,
          //   'Key': API_KEY
          // },
          data: {
            event
          },
        })
        .then(response => {
          // handle success
          console.log('Event created:', response.data);
        })
        .catch(error => {
          // handle error
          console.log('ERROR, event not created');
        });
      }  
    },
    /* Uses an enroll code and the course object to return an event object
     * that is compatible with FullCalendar.
     */
    eventFromEnrollCode: function (enrollcode, course) {
      const section = course.classSections.find(
        (section) => section.enrollCode == enrollcode
      );

      var titletodisplay = course.fullCourseNumber + ": " + enrollcode;
      const dayInt = {
        MONDAY: 1,
        TUESDAY: 2,
        WEDNESDAY: 3,
        THURSDAY: 4,
        FRIDAY: 5,
        SATURDAY: 6,
      };
      if (section.timeLocations.length == 1) {
        return {
          title: titletodisplay, //course.fullCourseNumber,
          courseId: course.courseId,
          daysOfWeek: section.timeLocations[0].fullDays.map((a) => dayInt[a]),
          startTime: section.timeLocations[0].beginTime,
          endTime: section.timeLocations[0].endTime,
          borderColor: getBorderColor(course.deptCode),
          backgroundColor: getBackgroundColor(course.courseId.slice(7, 14)),
          isLecture: section.isLecture ? 2 : 1,
          //enrolledTotal is null if none enrolled
          enrolledTotal: (section.enrolledTotal ?? section.maxEnroll),
          maxEnroll: section.maxEnroll,
          enrollCode: section.enrollCode,
          location: section.timeLocations[0].building + " " + section.timeLocations[0].room,
          instructor: (section.instructors[0]?.instructor ?? "TBA"),
          textColor: "black",
        };
      } else {
        var multipleevents = [];
        var multipletimeandplace = section.timeLocations;
        var classinfo = {
          title: titletodisplay, //course.fullCourseNumber,
          courseId: course.courseId,
          daysOfWeek: "",
          startTime: "",
          endTime: "",
          borderColor: getBorderColor(course.deptCode),
          backgroundColor: getBackgroundColor(course.courseId.slice(7, 14)),
          isLecture: section.isLecture ? 2 : 1,
          //enrolledTotal is null if none enrolled
          enrolledTotal: (section.enrolledTotal ?? section.maxEnroll),
          maxEnroll: section.maxEnroll,
          enrollCode: section.enrollCode,
          location: section.timeLocations[0].building + " " + section.timeLocations[0].room,
          instructor: (section.instructors[0]?.instructor ?? "TBA"),
          textColor: "black",
        };
        for (var k = 0; k < multipletimeandplace.length; k++) {
          classinfo.daysOfWeek = multipletimeandplace[
            k
          ].daysOfWeek.map((a) => dayInt[a]);
          classinfo.startTime = multipletimeandplace[k].beginTime;
          classinfo.endTime = multipletimeandplace[k].endTime;
          multipleevents.push(classinfo);
        }
        return multipleevents;
      }
    },
    calculateUnits: function (schedule, courses) {
      var total = 0;
      schedule.classes.forEach((item) => {
        const course = courses.find(
          (course) => course.courseId == item.courseId
        );
        total += course.unitsFixed;
      });
      return total;
    },
    /**
     * POSTS the given schedule to the backend for storage. Sets the quarter, name, units, and userEmail properties on the schedule.
     */

    saveSchedule: function (schedule) {
      if (this.$store.getters.userIsAuthenticated) {
        //if user isn't logged in, nothing happens
        $("span").css("pointer-events", "none"); //anything in a span will be disabled
          schedule.quarter = this.quarter;
          schedule.userEmail = this.$store.getters.userInfo.email;
          schedule.name = xss(this.updatedScheduleName);
          schedule.totalUnits = this.calculateUnits(
            schedule,
            this.coursesComputed
          );

          api
            .saveSchedule(schedule, null, null, null)
            .then((response) => {
              schedule.id = response.data;
              this.scheduleSavedStatus = "successful";
            })
            .catch((error) => {
              console.error(error);
              this.scheduleSavedStatus = "failed";
            });
        $("span").css("pointer-events", "auto");
        this.$set(schedule, 'favorited', true);
        this.$forceUpdate();
      }
    },
    /*
     * Removes the favorite status from a schedule, Removes the schedule from the backend,
     * delivers a toast showing that it has been deleted.
     */
    unFavoriteSchedule: async function (schedule) {
      if (this.$store.getters.userIsAuthenticated) {
        const resp = await api.deleteSchedule(schedule);
        if (resp.status > 400) {
          return;
        } else {
          this.$bvToast.show('deleted-toast-' + this._uid);
          this.$set(schedule, 'favorited', false);
          this.$forceUpdate();
        }
      }
    },
    onClose() {
      this.popoverShow = false;
    },
    saveName: function () {
      this.scheduleName = xss(this.scheduleName);
      this.popoverShow = false;
      //TODO: Stop errors from occurring by checking if we are on liked schedules page or all page (known in SchedulePaginator)
      api
        .updateScheduleName(this.schedule.id, this.scheduleName)
        .then(() =>{
          // this.schedule.name = this.scheduleName;
          this.scheduleLocal.name = this.scheduleName;
        })
        .catch((error) => {
          this.errors.push(error);
        });
    },
    editSchedule: async function(schedule) {
      await this.$store.dispatch('initializeStoreAsync',schedule);
      this.$eventHub.$emit('generate-schedules', null);
    },
    eventDidMount: function(info) {
      if (info.event.extendedProps.isLecture != 0) {
        return new Tooltip(info.el, {
          title: "<b>" + info.event.extendedProps.courseId + " — " + (info.event.extendedProps.isLecture == 1 ? "Section" : "Lecture") + "</b><br>" +
                 "Instructor: " + info.event.extendedProps.instructor + "<br>" +
                 "Seats: " + info.event.extendedProps.enrolledTotal + "/" + info.event.extendedProps.maxEnroll + "<br>" +
                 "Location: " + info.event.extendedProps.location + "<br>" +
                 "Enroll Code: " + info.event.extendedProps.enrollCode + "<br>",
          html: true,
          template: '<div class="tooltip course-tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner course-tooltip"></div></div>',
          placement: "top",
          trigger: "hover",
          container: "body",
        });
      }
    },
    exportPDF() {
      var component = this.$refs.schedule

      html2canvas(component, {imageQuality: 1}).then(function(canvas) {
        let pdf = new jsPDF('l', 'mm', 'a4')
        let imgData = canvas.toDataURL('image/jpeg');
        let width = pdf.internal.pageSize.getWidth()
        let height = pdf.internal.pageSize.getHeight()
        let widthRatio = width / canvas.width
        let heightRatio = height / canvas.height
        let ratio = widthRatio > heightRatio ? heightRatio : widthRatio

        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width * ratio, canvas.height * ratio)
        pdf.save("schedule.pdf")
  })
    }
  }
};
</script>

<style>
/*@import "~@fullcalendar/core/main.css";*/
/*@import "~@fullcalendar/timegrid/main.css";*/
/*@import "~@fullcalendar/daygrid/main.css";*/

.fc-col-header-cell-cushion {
  color: #2c3e50;
}
.fc-col-header-cell-cushion:hover {
  text-decoration: none;
  color: #2c3e50;
}

/* Transparent background. Fix for issue #78 */
.fc .fc-timegrid-col.fc-day-today {
  background-color: #dee2e600;
}
#inner-box > * {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 65%;
  z-index: 999;
}

.no-wrap {
  overflow: hidden;
  white-space: nowrap;
}

.fc-title {
  font-size: 11px;
}

.tooltip > .tooltip-inner.course-tooltip {
  text-align: left;
  font-size: 9pt;
}
</style>

<!-- steven: to reduce top/bottom padding in schedule header -->
<style scoped>
.card-header {
  padding: 0;
}
.no-wrap.d-flex.flex-row.align-items-center {
  position: relative;
  padding-left: 10px;
}

</style>
