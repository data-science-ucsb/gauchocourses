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
              v-if="favorited"
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
              @click="saveSchedule()"
          />
        </span>

        <b-tooltip
            v-if="!$store.getters.userIsAuthenticated"
            :target="'favorite-icon'+_uid">
          Sign in to save schedules.
        </b-tooltip>

        <b-tooltip
            v-else-if="!finishedSchedule"
            :target="'favorite-icon'+_uid">
          All events must be selected to save a schedule!
        </b-tooltip>

        <b-toast :id="'deleted-toast-' + _uid" title="You deleted a schedule!" variant="warning">
          The schedule, "{{ schedule.name }}" was deleted. Click the button to undo.
          <b-button @click="saveSchedule()" variant="warning">Undo</b-button>
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
              <b-form-input v-model="schedule.name"></b-form-input>
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
      </div>
    </template>
    <div v-if="doneLoading" class="weekly-calendar">
      <FullCalendar
        :options="calendarOptions"
        ref="calendar"
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
import { Tooltip } from "bootstrap";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default {
  components: {
    FullCalendar,
  },
  props: {
    courses: {
      type: Array,
      required: false
    },
    customEvents: {
      type: Array,
      required: false
    },
  },
  data: function () {
    return {
      schedule: {
        id: null,
        classes: [],
        customEvents: [],
        sortingAttributes: {
          totalMinutesBetweenEvents: 0,
          totalMinutesFromMidnight: 0,
          daysWithEvents: [],
          earliestBeginTime: '',
          latestEndTime: '',
        },
        quarter: null,
        userEmail	:	null,
        name: "My Schedule",
        totalUnits	:	0,
        conflicting	:	false,
      },
      favorited: false,
      selectedEvents: [],
      updatedScheduleName: "My Schedule",
      finishedSchedule: false,
      doneLoading: false,
      scheduleSavedStatus: null,
      popoverShow: false,
      errors: [],
    };
  },
  created: function () {
    this.doneLoading = true;
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
        events: this.parseScheduleToEventList(this.customEvents, this.courses),
        headerToolbar: "",
        dayHeaders: true,
        dayHeaderFormat: {weekday: 'short'},
        plugins: [timeGridPlugin],
        weekends: false,
        stickyHeaderDates: false,
        allDaySlot: false,
        initialView: 'timeGridWeek',
        editable: false,
        eventClick: this.eventClick,
      }
    },
    quarter: function () {
      return this.$store.state.selectedQuarter;
    },
  },
  mounted: function() {
    this.handleRemoveTabIndexFromEvents();
    let calendarApi = this.$refs.calendar.getApi();
    let earliestTime = 1349;
    let latestTime = 0;
    let earliestEvent;
    let latestEvent;
    calendarApi.getEvents().forEach(function (event) {
      let eventDate = new Date(event.start);
      var minutes = eventDate.getMinutes();
      var hours = eventDate.getHours();
      var eventTime = (60 * hours) + minutes;
      if(eventTime < earliestTime) {
        earliestTime = eventTime;
        earliestEvent = event;
      }

      eventDate = new Date(event.end);
      minutes = eventDate.getMinutes();
      hours = eventDate.getHours();
      eventTime = (60 * hours) + minutes;
      if(eventTime > latestTime) {
        latestTime = eventTime;
        latestEvent = event;
      }
    });
    if(earliestEvent) {
      calendarApi.setOption('slotMinTime', new Date(earliestEvent.start).toTimeString());
      calendarApi.setOption('slotMaxTime', new Date(latestEvent.end).toTimeString());
    }
  },
  methods: {
    /**
     * Parses a schedule and maps the enroll codes to the data format for WeeklySchedule from courses.
     */
    parseScheduleToEventList: function (customEvents, courses) {
      const _this = this;
      let incrementalCustomEventId = 0;
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
            courseId: "none",
            groupId: incrementalCustomEventId++,
            daysOfWeek: classSection.timeLocations[0].fullDays.map(
                (a) => dayInt[a]
            ),
            startTime: classSection.timeLocations[0].beginTime,
            endTime: classSection.timeLocations[0].endTime,
            color: getBackgroundColor(classSection.name),
            isLecture: 0,
            lectureSectionGroup: '',
            overlaid: [],
            sectionSelected: false,
            relatedSelected: false,
          };
        } else {
          return classSection.selectedEnrollCodes.map((section) =>
              _this.eventFromEnrollCode(section, course)
          );
        }
      }
      function createScheduleObject(course) {
        let schedule = {
          courseId: course.courseId,
          selectedEnrollCodes: [],
        }
        for(let k = 0; k < course.classSections.length; k++) {
          schedule.selectedEnrollCodes.push(course.classSections[k].enrollCode);
        }
        return schedule;
      }
      //PARSE ARRAY
      let classes = courses
          .map(createScheduleObject)
          .flat();


      let totalevents = classes
          .map(classSectionToFullCalendarEvent)
          .flat(); //do this function to all of the classes
      let customevents = customEvents.map(
          classSectionToFullCalendarEvent
      );

      customevents.forEach((item) => {
        totalevents.push(item);
      })
      return totalevents;
    },
    /* Uses an enroll code and the course object to return an event object
     * that is compatible with FullCalendar.
     */
    eventFromEnrollCode: function (enrollcode, course) {
      const section = course.classSections.find(
          (section) => section.enrollCode == enrollcode
      );

      let titletodisplay;
      if(section.isLecture === true) {
        titletodisplay = course.fullCourseNumber + ": " + enrollcode;
      }
      else {
        titletodisplay = course.fullCourseNumber + ": " + enrollcode;
      }
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
          groupId: enrollcode,
          daysOfWeek: section.timeLocations[0].fullDays.map((a) => dayInt[a]),
          startTime: section.timeLocations[0].beginTime,
          endTime: section.timeLocations[0].endTime,
          borderColor: getBorderColor(course.deptCode),
          backgroundColor: getBackgroundColor(course.courseId.slice(7, 14)),
          isLecture: section.isLecture ? 2 : 1,
          sectionSelected: false,
          overlaid: [],
          lectureSectionGroup: section.lectureSectionGroup,
          relatedSelected: false,
          //enrolledTotal is null if none enrolled
          enrolledTotal: (section.enrolledTotal ?? section.maxEnroll),
          maxEnroll: section.maxEnroll,
          enrollCode: section.enrollCode,
          location: section.timeLocations[0].building + " " + section.timeLocations[0].room,
          instructor: (section.instructors[0]?.instructor ?? "TBA"),
        };
      } else {
        let multipleevents = [];
        let multipletimeandplace = section.timeLocations;
        let classinfo = {
          title: titletodisplay, //course.fullCourseNumber,
          courseId: course.courseId,
          groupId: enrollcode,
          daysOfWeek: "",
          startTime: "",
          endTime: "",
          borderColor: getBorderColor(course.deptCode),
          backgroundColor: getBackgroundColor(course.courseId.slice(7, 14)),
          isLecture: section.isLecture ? 2 : 1,
          sectionSelected: false,
          overlaid: [],
          lectureSectionGroup: section.lectureSectionGroup,
          relatedSelected: false, //FOR Lectures and Sections
          //enrolledTotal is null if none enrolled
          enrolledTotal: (section.enrolledTotal ?? section.maxEnroll),
          maxEnroll: section.maxEnroll,
          enrollCode: section.enrollCode,
          location: section.timeLocations[0].building + " " + section.timeLocations[0].room,
          instructor: (section.instructors[0]?.instructor ?? "TBA"),
        };
        for (let k = 0; k < multipletimeandplace.length; k++) {
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
    //TODO: Can optimize by adding lazy loading (for concurrent and lectureSectionGroups), and sacrifice rendering time for fast computing time by storing an id for each event and using calendar::getEventById
    eventClick: function (arg) {
      this.$bvToast.hide('deleted-toast-' + this._uid);
      let calendarApi = this.$refs.calendar.getApi();
      let concurrentLectureSectionGroups = [];
      if(arg.event.borderColor != "blue") { //If it is being selected
        if(arg.event.extendedProps.isLecture === 2) { //If Lecture
          arg.event.setProp( 'borderColor', 'blue' );
          this.selectedEvents.push(arg.event);
          calendarApi.getEvents().forEach(event => { //Loop through each event in calendar
            if(arg.event.title.substring(0, arg.event.title.indexOf(":")) === event.title.substring(0, event.title.indexOf(":"))) {
              // Get rid of all lectures and sections that are not part of the section group for a course
              if(event.extendedProps.lectureSectionGroup != arg.event.extendedProps.lectureSectionGroup) {
                event.setExtendedProp('relatedSelected', true);
                event.setProp('display', 'none');
              }
              // Checks for the other lectures' events and hides their concurrent events
              else if(event.extendedProps.isLecture === 2 && new Date(event.start).getTime() != new Date(arg.event.start).getTime()) {
                this.selectedEvents.push(event);
                calendarApi.getEvents().forEach(function (eventTwo) {
                  if(eventTwo.groupId !== event.groupId && new Date(eventTwo.start).getTime() < new Date(event.end).getTime() && new Date(eventTwo.end).getTime() > new Date(event.start).getTime()) { //Get rid of all overlapping events for this lecture AND CHECK IF IT IS ON THE SAME DATE
                    eventTwo.setProp( 'display', 'none' );
                    if(!concurrentLectureSectionGroups.includes(eventTwo.extendedProps.lectureSectionGroup)) {
                      concurrentLectureSectionGroups.push(eventTwo.extendedProps.lectureSectionGroup);
                    }
                    if(!eventTwo.extendedProps.overlaid.includes(event.groupId)) {
                      eventTwo.setExtendedProp('overlaid', eventTwo.extendedProps.overlaid.concat(event.groupId));
                    }
                  }
                });
              }
            }
            //Get rid of all overlapping events for this lecture
            if(event.groupId !== arg.event.groupId && new Date(event.start).getTime() < new Date(arg.event.end).getTime() && new Date(event.end).getTime() > new Date(arg.event.start).getTime()) {
              event.setProp( 'display', 'none' );
              if(!concurrentLectureSectionGroups.includes(event.extendedProps.lectureSectionGroup)) {
                concurrentLectureSectionGroups.push(event.extendedProps.lectureSectionGroup);
              }
              if(!event.extendedProps.overlaid.includes(arg.event.groupId)) {
                event.setExtendedProp('overlaid', event.extendedProps.overlaid.concat(arg.event.groupId));
              }
            }
          });

        }

        else if (arg.event.extendedProps.isLecture === 1) { //If Section
          arg.event.setProp( 'borderColor', 'blue' );
          this.selectedEvents.push(arg.event);
          calendarApi.getEvents().forEach(event => { //Loop through each event in calendar
            if(arg.event.title.substring(0, arg.event.title.indexOf(":")) === event.title.substring(0, event.title.indexOf(":"))) { //If the same course
              //Get rid of all similar courses
              if(event.extendedProps.lectureSectionGroup != arg.event.extendedProps.lectureSectionGroup) {
                event.setExtendedProp('relatedSelected', true);
                event.setProp( 'display', 'none' );
              }
              else if(event.extendedProps.isLecture === 2) { //If it's part of the same course, lecturesection group, and it is this lecture, select it
                if(event.borderColor != 'blue') {
                  event.setProp('borderColor', 'blue');
                  this.selectedEvents.push(event);
                }
                calendarApi.getEvents().forEach(function (eventTwo) { //get rid of all overlapping events of the lectures
                  if(eventTwo.groupId !== event.groupId && new Date(eventTwo.start).getTime() < new Date(event.end).getTime() && new Date(eventTwo.end).getTime() > new Date(event.start).getTime()) { //Get rid of all overlapping events for this lecture AND CHECK IF IT IS ON THE SAME DATE
                    eventTwo.setProp( 'display', 'none' );
                    if(!concurrentLectureSectionGroups.includes(eventTwo.extendedProps.lectureSectionGroup)) {
                      concurrentLectureSectionGroups.push(eventTwo.extendedProps.lectureSectionGroup);
                    }
                    if(!eventTwo.extendedProps.overlaid.includes(event.groupId)) {
                      eventTwo.setExtendedProp('overlaid', eventTwo.extendedProps.overlaid.concat(event.groupId));
                    }
                  }
                });
              }
              else if(event.extendedProps.isLecture === 1) { //If it's part of the same course, lecturesection group, and it is a competing section, remove it
                if(event.groupId != arg.event.groupId) { //Check if it is not section that we want
                  event.setProp('display', 'none');
                  event.setExtendedProp('sectionSelected', true);
                }
                else if(new Date(event.start).getTime() != new Date(arg.event.start).getTime()) { //check if it is a section we want (Math 8 Spring 2023 has two sections per class) then hide its concurrent classes
                  this.selectedEvents.push(event);
                  calendarApi.getEvents().forEach(function (eventTwo) { //get rid of all overlapping events of the lectures
                    if(eventTwo.groupId !== event.groupId && new Date(eventTwo.start).getTime() < new Date(event.end).getTime() && new Date(eventTwo.end).getTime() > new Date(event.start).getTime()) { //Get rid of all overlapping events for this lecture AND CHECK IF IT IS ON THE SAME DATE
                      eventTwo.setProp( 'display', 'none' );
                      if(!concurrentLectureSectionGroups.includes(eventTwo.extendedProps.lectureSectionGroup)) {
                        concurrentLectureSectionGroups.push(eventTwo.extendedProps.lectureSectionGroup);
                      }
                      if(!eventTwo.extendedProps.overlaid.includes(event.groupId)) {
                        eventTwo.setExtendedProp('overlaid', eventTwo.extendedProps.overlaid.concat(event.groupId));
                      }
                    }
                  });
                }
              }
            }
            if(event.groupId !== arg.event.groupId && new Date(event.start).getTime() < new Date(arg.event.end).getTime() && new Date(event.end).getTime() > new Date(arg.event.start).getTime()) { //Get rid of all overlapping events for this section
              event.setProp( 'display', 'none' );
              if(!concurrentLectureSectionGroups.includes(event.extendedProps.lectureSectionGroup)) {
                concurrentLectureSectionGroups.push(event.extendedProps.lectureSectionGroup);
              }
              if(!event.extendedProps.overlaid.includes(arg.event.groupId)) {
                event.setExtendedProp('overlaid', event.extendedProps.overlaid.concat(arg.event.groupId));
              }
            }
          });
        }

        else { //If CustomEvent
          arg.event.setProp( 'borderColor', 'blue' );
          this.selectedEvents.push(arg.event);
          calendarApi.getEvents().forEach(function (event) { //Loop through each event in calendar
            if(event.groupId !== arg.event.groupId && new Date(event.start).getTime() < new Date(arg.event.end).getTime() && new Date(event.end).getTime() > new Date(arg.event.start).getTime()) { //Get rid of all overlapping events for this customevent
              event.setProp( 'display', 'none' );
              if(!concurrentLectureSectionGroups.includes(event.extendedProps.lectureSectionGroup)) {
                concurrentLectureSectionGroups.push(event.extendedProps.lectureSectionGroup);
              }
              if(!event.extendedProps.overlaid.includes(arg.event.groupId)) {
                event.setExtendedProp('overlaid', event.extendedProps.overlaid.concat(arg.event.groupId));
              }
            }
            if(event.groupId === arg.event.groupId && new Date(event.start).getTime() != new Date(arg.event.start).getTime()) { //Hide the other custom event's concurrent events
              this.selectedEvents.push(event);
              calendarApi.getEvents().forEach(function (eventTwo) {
                if(eventTwo.groupId !== event.groupId && new Date(eventTwo.start).getTime() < new Date(event.end).getTime() && new Date(eventTwo.end).getTime() > new Date(event.start).getTime()) { //Get rid of all overlapping events for this lecture AND CHECK IF IT IS ON THE SAME DATE
                  eventTwo.setProp( 'display', 'none' );
                  if(!concurrentLectureSectionGroups.includes(eventTwo.extendedProps.lectureSectionGroup)) {
                    concurrentLectureSectionGroups.push(eventTwo.extendedProps.lectureSectionGroup);
                  }
                  if(!eventTwo.extendedProps.overlaid.includes(event.groupId)) {
                    eventTwo.setExtendedProp('overlaid', eventTwo.extendedProps.overlaid.concat(event.groupId));
                  }
                }
              });
            }
          });
        }
        for(let k = 0; k < concurrentLectureSectionGroups.length; k++) { //Checking if all sections or all lectures of a section group is gone because of concurrency checks
          if (concurrentLectureSectionGroups[k] != '') {
            let numberLectures = 0;
            let numberSections = 0;
            calendarApi.getEvents().forEach(function (event) {
              if (event.extendedProps.lectureSectionGroup == concurrentLectureSectionGroups[k]) { //All events that are part of the lectureSectionGroup
                if (event.display != 'none') {
                  if (event.extendedProps.isLecture === 2) {
                    ++numberLectures;
                  } else {
                    ++numberSections;
                  }
                }
              }
            });
            if (numberLectures == 0 || numberSections == 0) {
              calendarApi.getEvents().forEach(event => {
                if (event.extendedProps.lectureSectionGroup == concurrentLectureSectionGroups[k]) {
                  event.setProp('display', 'none');
                  if(event.borderColor == 'blue') {
                    this.selectedEvents = this.selectedEvents.filter(selectedEvent => selectedEvent.groupId != event.groupId);
                  }
                }
              });
            }
          }
        }
      }

      else { //If it is being unselected

        if(arg.event.extendedProps.isLecture === 2) { //If Lecture
          const course = this.courses.find(
              (course) => course.courseId == arg.event.extendedProps.courseId
          );
          arg.event.setProp('borderColor', getBorderColor(course.deptCode));
          this.selectedEvents = this.selectedEvents.filter(selectedEvent => selectedEvent.groupId != arg.event.groupId);
          calendarApi.getEvents().forEach(event => { //Loop through each event in calendar
            if(arg.event.title.substring(0, arg.event.title.indexOf(":")) === event.title.substring(0, event.title.indexOf(":"))) { //If it's the same course
              if(event.extendedProps.isLecture === 1 && event.borderColor == "blue") { //deselect the selected sections for this lecture and then show all sections
                event.setProp('borderColor', getBorderColor(course.deptCode));
                this.selectedEvents = this.selectedEvents.filter(selectedEvent => selectedEvent.groupId != event.groupId);
                calendarApi.getEvents().forEach(function (eventTwo) { //Adds all overlapping events of section
                  if(eventTwo.groupId !== event.groupId && new Date(eventTwo.start).getTime() < new Date(event.end).getTime() && new Date(eventTwo.end).getTime() > new Date(event.start).getTime()) {
                    eventTwo.setExtendedProp('overlaid', eventTwo.extendedProps.overlaid.filter((item) => {
                      return item != event.groupId;
                    }));
                    if(eventTwo.extendedProps.sectionSelected == false && eventTwo.extendedProps.relatedSelected == false && eventTwo.extendedProps.overlaid.length === 0) {
                      eventTwo.setProp('display', 'auto')
                      if(!concurrentLectureSectionGroups.includes(eventTwo.extendedProps.lectureSectionGroup)) {
                        concurrentLectureSectionGroups.push(eventTwo.extendedProps.lectureSectionGroup);
                      }
                    }
                  }
                });
              }
              // Add back all lectures and sections for a course
              event.setExtendedProp('relatedSelected', false);
              event.setExtendedProp('sectionSelected', false);
              if(event.extendedProps.overlaid.length === 0) {
                event.setProp('display', 'auto');
              }
            }
            if(event.groupId === arg.event.groupId && new Date(event.start).getTime() != new Date(arg.event.start).getTime()) { //For the other lectures events that become unselected, show their concurrent events
              calendarApi.getEvents().forEach(function (eventTwo) {
                if(eventTwo.groupId !== event.groupId && eventTwo.extendedProps.sectionSelected == false && eventTwo.extendedProps.relatedSelected == false && new Date(eventTwo.start).getTime() < new Date(event.end).getTime() && new Date(eventTwo.end).getTime() > new Date(event.start).getTime()) { //Adds all overlapping events for other lectures
                  eventTwo.setExtendedProp('overlaid', eventTwo.extendedProps.overlaid.filter((item) => {
                    return item != event.groupId;
                  }));
                  if (eventTwo.extendedProps.sectionSelected == false && eventTwo.extendedProps.relatedSelected == false && eventTwo.extendedProps.overlaid.length === 0) {
                    eventTwo.setProp('display', 'auto');
                    if(!concurrentLectureSectionGroups.includes(eventTwo.extendedProps.lectureSectionGroup)) {
                      concurrentLectureSectionGroups.push(eventTwo.extendedProps.lectureSectionGroup);
                    }
                  }
                }
              });
            }
            if(event.groupId !== arg.event.groupId && new Date(event.start).getTime() < new Date(arg.event.end).getTime() && new Date(event.end).getTime() > new Date(arg.event.start).getTime()) { //Adds all overlapping events for this lecture
              event.setExtendedProp('overlaid', event.extendedProps.overlaid.filter((item)=>{
                return item != arg.event.groupId;
              }));
              if (event.extendedProps.sectionSelected == false && event.extendedProps.relatedSelected == false && event.extendedProps.overlaid.length === 0) {
                event.setProp('display', 'auto');
                if(!concurrentLectureSectionGroups.includes(event.extendedProps.lectureSectionGroup)) {
                  concurrentLectureSectionGroups.push(event.extendedProps.lectureSectionGroup);
                }
              }
            }
          });
        }

        else if (arg.event.extendedProps.isLecture === 1) { //If Section

          const course = this.courses.find(
              (course) => course.courseId == arg.event.extendedProps.courseId
          );
          arg.event.setProp('borderColor', getBorderColor(course.deptCode));
          this.selectedEvents = this.selectedEvents.filter(selectedEvent => selectedEvent.groupId != arg.event.groupId);
          calendarApi.getEvents().forEach(function (event) { //Loop through each event in calendar
            if(arg.event.title.substring(0, arg.event.title.indexOf(":")) === event.title.substring(0, event.title.indexOf(":")) && event.extendedProps.lectureSectionGroup == arg.event.extendedProps.lectureSectionGroup && event.extendedProps.isLecture === 1) { //If the same course, same lectureSectionGroup, and it is a section, show it
              event.setExtendedProp('sectionSelected', false);
              if(event.extendedProps.overlaid.length === 0) {
                event.setProp('display', 'auto');
              }
            }
            if(event.groupId === arg.event.groupId && new Date(event.start).getTime() != new Date(arg.event.start).getTime()) {
              calendarApi.getEvents().forEach(function (eventTwo) {
                if(eventTwo.groupId !== event.groupId && new Date(eventTwo.start).getTime() < new Date(event.end).getTime() && new Date(eventTwo.end).getTime() > new Date(event.start).getTime()) {
                  eventTwo.setExtendedProp('overlaid', eventTwo.extendedProps.overlaid.filter((item)=>{
                    return item != event.groupId;
                  }));
                  if(eventTwo.extendedProps.sectionSelected == false && eventTwo.extendedProps.relatedSelected == false && eventTwo.extendedProps.overlaid.length === 0) {
                    eventTwo.setProp('display', 'auto');
                    if(!concurrentLectureSectionGroups.includes(eventTwo.extendedProps.lectureSectionGroup)) {
                      concurrentLectureSectionGroups.push(eventTwo.extendedProps.lectureSectionGroup);
                    }
                  }
                }
              });
            }
            if(event.groupId !== arg.event.groupId && new Date(event.start).getTime() < new Date(arg.event.end).getTime() && new Date(event.end).getTime() > new Date(arg.event.start).getTime()) {
              event.setExtendedProp('overlaid', event.extendedProps.overlaid.filter((item)=>{
                return item != arg.event.groupId;
              }));
              if(event.extendedProps.sectionSelected == false && event.extendedProps.relatedSelected == false && event.extendedProps.overlaid.length === 0) {
                event.setProp('display', 'auto');
                if(!concurrentLectureSectionGroups.includes(event.extendedProps.lectureSectionGroup)) {
                  concurrentLectureSectionGroups.push(event.extendedProps.lectureSectionGroup);
                }
              }
            }
          });
        }

        else { //If Custom Event
          arg.event.setProp( 'borderColor', 'transparent');
          this.selectedEvents = this.selectedEvents.filter(selectedEvent => selectedEvent.groupId != arg.event.groupId);
          calendarApi.getEvents().forEach(function (event) { //Loop through each event in calendar
            if(event.groupId === arg.event.groupId && new Date(event.start).getTime() != new Date(arg.event.start).getTime()) {
              calendarApi.getEvents().forEach(function (eventTwo) {
                if (eventTwo.groupId !== event.groupId && new Date(eventTwo.start).getTime() < new Date(event.end).getTime() && new Date(eventTwo.end).getTime() > new Date(event.start).getTime()) {
                  eventTwo.setExtendedProp('overlaid', eventTwo.extendedProps.overlaid.filter((item) => {
                    return item != event.groupId;
                  }));
                  if(eventTwo.extendedProps.sectionSelected == false && eventTwo.extendedProps.relatedSelected == false && eventTwo.extendedProps.overlaid.length === 0) {
                    eventTwo.setProp('display', 'auto');
                    if(!concurrentLectureSectionGroups.includes(eventTwo.extendedProps.lectureSectionGroup)) {
                      concurrentLectureSectionGroups.push(eventTwo.extendedProps.lectureSectionGroup);
                    }
                  }
                }
              });
            }
            if(event.groupId !== arg.event.groupId && new Date(event.start).getTime() < new Date(arg.event.end).getTime() && new Date(event.end).getTime() > new Date(arg.event.start).getTime()) {
              event.setExtendedProp('overlaid', event.extendedProps.overlaid.filter((item)=>{
                return item != arg.event.groupId;
              }));
              if(event.extendedProps.sectionSelected == false && event.extendedProps.relatedSelected == false && event.extendedProps.overlaid.length === 0) {
                event.setProp('display', 'auto');
                if(!concurrentLectureSectionGroups.includes(event.extendedProps.lectureSectionGroup)) {
                  concurrentLectureSectionGroups.push(event.extendedProps.lectureSectionGroup);
                }
              }
            }
          });
        }
        for(let k = 0; k < concurrentLectureSectionGroups.length; k++) {
          if(concurrentLectureSectionGroups[k] != '') {
            let numberLectures = 0;
            let numberSections = 0;
            let totalNumberSections = 0;
            calendarApi.getEvents().forEach(function (event) {
              if (event.extendedProps.lectureSectionGroup == concurrentLectureSectionGroups[k]) {
                if (event.extendedProps.sectionSelected == false && event.extendedProps.relatedSelected == false && event.extendedProps.overlaid.length === 0) {
                  if (event.extendedProps.isLecture === 2) {
                    ++numberLectures;
                  } else {
                    ++numberSections;
                  }
                }
                if(event.extendedProps.isLecture === 1) {
                  ++totalNumberSections;
                }
              }
            });
            if (totalNumberSections == 0 || (numberLectures > 0 && numberSections > 0)) {
              calendarApi.getEvents().forEach(event => {
                if (event.extendedProps.lectureSectionGroup === concurrentLectureSectionGroups[k] && event.extendedProps.sectionSelected == false && event.extendedProps.relatedSelected == false && event.extendedProps.overlaid.length === 0) {
                  event.setProp('display', 'auto');
                  if(event.borderColor == 'blue') {
                    this.selectedEvents.push(event);
                  }
                }
              });
            } else {
              calendarApi.getEvents().forEach(function (event) {
                if (event.extendedProps.lectureSectionGroup === concurrentLectureSectionGroups[k]) {
                  event.setProp('display', 'none');
                }
              });
            }
          }
        }
      }
      this.finishedSchedule = !calendarApi.getEvents().some(function(event) {
        return (event.display == "auto" && event.borderColor != "blue");
      });
      //TODO reset filters in schedule paginator affects schedule builder?
      //TODO make ScheduleC affected by sorting and filtering options?
      //TODO make ScheduleC affected by edit class section Sections?
      this.handleRemoveTabIndexFromEvents();
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
    // /**
    //  * POSTS the given schedule to the backend for storage. Sets the quarter, name, units, and userEmail properties on the schedule.
    //  */
    saveSchedule: function () {
      //if user isn't logged in or not all events are selected, nothing happens
      if(this.finishedSchedule && this.$store.getters.userIsAuthenticated) {

        let customEventsSchedule = [];
        let selectedClassSections = [];
        let scheduledClassSections = [];
        let totalUnits = 0;

        this.selectedEvents.forEach(event => {
          if(event.extendedProps.isLecture === 0) { //Custom Event
            const customEvent = this.customEvents.find(
                (customEvent) => customEvent.name == event.title
            );
            if(!customEventsSchedule.find(customEventSchedule => customEventSchedule.name == customEvent.name)) {
              customEventsSchedule.push(customEvent);
            }
          }
          else { //Course
            const course = this.courses.find( //Find the course it is a part of
                (course) => course.courseId == event.extendedProps.courseId
            );
            totalUnits += course.unitsFixed; //Calculate Units

            course.classSections.forEach(section => { //Add each section of the course to scheduledClassSections
              if(!selectedClassSections.find(selectedClassSection => selectedClassSection.enrollCode == section.enrollCode)) {
                selectedClassSections.push(section);
              }
            });

            const section = course.classSections.find( //Find the section this event is
                (classSection) => classSection.enrollCode == event.groupId
            );
            if(!scheduledClassSections.find(scheduledClassSection => scheduledClassSection.enrollCode == section.enrollCode)) {
              scheduledClassSections.push(section);
            }
          }
        });

        $("span").css("pointer-events", "none"); //anything in a span will be disabled
        this.schedule.quarter = this.quarter;
        this.schedule.userEmail = this.$store.getters.userInfo.email;
        this.schedule.name = xss(this.updatedScheduleName);
        this.schedule.totalUnits = totalUnits;

        api
            .saveSchedule(this.schedule, customEventsSchedule, selectedClassSections, scheduledClassSections)
            .then((response) => {
              this.schedule = response.data; //TODO: test if this works, by seeing if you can delete the schedule after saving it
              this.scheduleSavedStatus = "successful";
            })
            .catch((error) => {
              console.error(error);
              this.scheduleSavedStatus = "failed";
            });
        $("span").css("pointer-events", "auto");
        this.favorited = true;
        this.$forceUpdate();
      }
    },
    // /*
    //  * Removes the favorite status from a schedule, Removes the schedule from the backend,
    //  * delivers a toast showing that it has been deleted.
    //  */
    unFavoriteSchedule: async function (schedule) {
      if(this.$store.getters.userIsAuthenticated) {
        const resp = await api.deleteSchedule(schedule);
        if (resp.status > 400) {
          return;
        } else {
          this.$bvToast.show('deleted-toast-' + this._uid);
          this.favorited = false;
          this.$forceUpdate();
        }
      }
    },
    onClose() {
      this.popoverShow = false;
    },
    saveName: function () {
      this.schedule.name = xss(this.schedule.name);
      this.updatedScheduleName = this.schedule.name;
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
    handleRemoveTabIndexFromEvents: function() {
      let events = document.querySelectorAll(".fc-event");
      for (let i = 0; i < events.length; i++) {
        events[i].removeAttribute("tabIndex");
      }
    },
    exportPDF() {
      var component = this.$refs.schedule
      html2canvas(component, {imageQuality: 1}).then(function (canvas) {
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
}
</script>
<style>

/* Transparent background. Fix for issue #78 */
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
.fc-event {
  cursor: pointer;
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
a:focus {

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
