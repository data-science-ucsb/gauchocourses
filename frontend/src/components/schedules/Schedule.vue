<!--
    Wrapper for FullCalendar, an open-source Javascript calendar.
    https://fullcalendar.io/docs/vue
    https://fullcalendar.io/docs#toc
-->

<template>
<div>
  <b-button
          variant="primary"
          ref="button"
          @click="exportPDF"
        >Export to PDF</b-button>
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
        >{{ schedule.name }}</b-button>

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
        height="auto"
        @hook:mounted="manuallyFixCSS"
        :events="events"
        :plugins="calendarPlugins"
        :weekends="false"
        :columnHeaderText="columnHeaderText"
        allDaySlot="false"
        defaultView="timeGridWeek"
        header="false"
        editable="false"
        :minTime="schedule.sortingAttributes.earliestBeginTime"
        :maxTime="schedule.sortingAttributes.latestEndTime"
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
      calendarPlugins: [timeGridPlugin],
      coursesComputed: [],
      doneLoading: false,
      savingScheduleInProgress: false,
      scheduleSavedStatus: null,
      scheduleName: this.schedule.name,
      popoverShow: false,
      errors: [],
      scheduleLocal: this.schedule,
    };
  },
  created: function () {
    //if this.courses has courses that are in the schedule, add them to the coursesComputed
    this.schedule.classes.forEach((course) => {
      const match = this.courses.find(item => item.courseId == course.courseId);
      if (match != undefined) {
        this.coursesComputed.push(match);
      }
    });
    const codesNeeded = [];
    const courseNames = this.coursesComputed.map((course) => course.courseId);
    //check if schedule has courses that aren't yet in coursesComputed
    this.schedule.classes.forEach((course) => {
      if(courseNames.includes(course.courseId) == false) { //if course isnt in there yet
        //add the enroll code to codesNeeded
        codesNeeded.push(course.scheduledEnrollCodes[0]);
      }
    });

    Promise.all(
      codesNeeded.map(code => api.coursefromEnrollCode(this.schedule.quarter, code)))
    .then((responses) => {
      responses
        .map(r => r.data.classes[0])
        .forEach(course => this.coursesComputed.push(course));
    })
    .catch(err => console.error(err))
    .finally(() => this.doneLoading = true);
  },
  mounted: function () {
    this.manuallyFixCSS();
  },
  computed: {
    /**
     * The schedules array is mapped to a format that can be passed to the WeeklySchedule component.
     * This array has the same length as the schedules array.
     */
    events: function () {
      return this.parseScheduleToEventList(this.schedule, this.coursesComputed);
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
      return totalevents;
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
          daysOfWeek: section.timeLocations[0].fullDays.map((a) => dayInt[a]),
          startTime: section.timeLocations[0].beginTime,
          endTime: section.timeLocations[0].endTime,
          borderColor: getBorderColor(course.deptCode),
          backgroundColor: getBackgroundColor(course.courseId.slice(7, 14)),
        };
      } else {
        var multipleevents = [];
        var multipletimeandplace = section.timeLocations;
        var classinfo = {
          title: titletodisplay, //course.fullCourseNumber,
          daysOfWeek: "",
          startTime: "",
          endTime: "",
          borderColor: getBorderColor(course.deptCode),
          backgroundColor: getBackgroundColor(course.courseId.slice(7, 14)),
        };
        for (var k = 0; k < multipletimeandplace.length; k++) {
          classinfo.classSections.daysOfWeek = multipletimeandplace[
            k
          ].daysOfWeek.map((a) => dayInt[a]);
          classinfo.classSections.startTime = multipletimeandplace[k].beginTime;
          classinfo.classSections.endTime = multipletimeandplace[k].endTime;
          multipleevents.push(classinfo);
        }
        return multipleevents;
      }
    },
    manuallyFixCSS: function () {
      // This removes the "allDaySlot". The Vue plugin for FullCalendar does not remove it
      // even though it is configured to remove it
      $(".fc-day-grid").remove();
      $(".fc-divider.fc-widget-header").remove();

      // Remove empty toolbar
      $(".fc-toolbar").remove();
    },
    columnHeaderText: function (date) {
      switch (date.getDay()) {
        case 1:
          return "Mon";
        case 2:
          return "Tue";
        case 3:
          return "Wed";
        case 4:
          return "Thu";
        case 5:
          return "Fri";
        case 6:
          return "Sat";
        default:
          return " ";
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
        this.savingScheduleInProgress = true;
        $("span").css("pointer-events", "none"); //anything in a span will be disabled
          schedule.quarter = this.quarter;
          schedule.userEmail = this.$store.getters.userInfo.email;
          schedule.name = xss(schedule.name);
          schedule.totalUnits = this.calculateUnits(
            schedule,
            this.coursesComputed
          );

          api
            .saveSchedule(schedule)
            .then((response) => {
              schedule.id = response.data;
              this.scheduleSavedStatus = "successful";
            })
            .catch((error) => {
              console.error(error);
              this.scheduleSavedStatus = "failed";
            });
        this.savingScheduleInProgress = false; // Either case, release the button
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
  },
};
</script>

<style>
@import "~@fullcalendar/core/main.css";
@import "~@fullcalendar/timegrid/main.css";
@import "~@fullcalendar/daygrid/main.css";

/* Transparent background. Fix for issue #78 */
.fc-unthemed td.fc-today {
  background: #dee2e600;
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

</style>

<!-- steven: to reduce top/bottom padding in schedule header -->
<style scoped>
.card-header {
  padding: 0;
}

.no-wrap.d-flex.flex-row.align-items-center {
  position: relative;
  padding-left: 5%;
}

</style>
