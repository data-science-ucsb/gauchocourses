<!--
    Wrapper for FullCalendar, an open-source Javascript calendar.
    https://fullcalendar.io/docs/vue
    https://fullcalendar.io/docs#toc
-->
<template>
  <b-card no-body>
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

        <b-tooltip
            v-else-if="finishedSchedule"
            :target="'favorite-icon'+_uid">
          Select all events to save schedule.
        </b-tooltip>

        <!--TODO: Can either save the schedule that was deleted for undo or get rid of this toast if schedule changes-->
        <b-toast :id="'deleted-toast-' + _uid" title="You deleted a schedule!" variant="warning">
          The schedule, "{{ schedule.name }}" was deleted. Click the button to undo.
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
</template>

<script>
import FullCalendar from "@fullcalendar/vue";
import timeGridPlugin from "@fullcalendar/timegrid";
import $ from "jquery";
import api from "@/components/backend-api.js";

// import api from "@/components/backend-api.js";
import {
  getBackgroundColor,
  getBorderColor,
} from "@/components/util/color-utils.js";
import xss from "xss";
// import xss from "xss";
import { Tooltip } from "bootstrap";

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
      undoSchedule: {
        name: "My Schedule",
        favorited: false,
      },
      schedule: {
        name: "My Schedule",
        favorited: false,
      },
      updatedScheduleName: "My Schedule",
      finishedSchedule: false,
      doneLoading: false,
      savingScheduleInProgress: false,
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
    let earliestTime = 23;
    let latestTime = 0;
    let earliestEvent;
    let latestEvent;
    calendarApi.getEvents().forEach(function (event) {
      if(new Date(event.start).getHours() < earliestTime) {
        earliestTime = new Date(event.start).getHours()
        earliestEvent = event;
      }
      if(new Date(event.end).getHours() > latestTime) {
        latestTime = new Date(event.end).getHours()
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
            lectureSectionGroup: "",
            overlaid: [],
            sectionSelected: false, //For sections, Section Differentitation
            relatedSelected: false, //FOR Lectures and Sections, Course Differentiation
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
      // console.log(JSON.stringify(courses));

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

      // console.log(JSON.stringify(totalevents));
      // this.eventsComputed = totalevents;
      return totalevents;
    },
    /* Uses an enroll code and the course object to return an event object
     * that is compatible with FullCalendar.
     */
    eventFromEnrollCode: function (enrollcode, course) {
      // console.log(JSON.stringify(course));
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
    eventClick: function (arg) { //TODO: optimize by calling the forEach as minimum and compact as possible, and can also add lazy loading (for concurrent and lectureSectionGroups), or sacrifice rendering time for fast computing time by storing each id and using calendar::getEventById
      let calendarApi = this.$refs.calendar.getApi();
      let concurrentLectureSectionGroups = [];
      if(arg.event.borderColor != "blue") { //If it is being selected
        if(arg.event.extendedProps.isLecture === 2) { //If Lecture
          arg.event.setProp( 'borderColor', 'blue' );
          calendarApi.getEvents().forEach(function (event) { //Loop through each event in calendar
            if(arg.event.title.substring(0, arg.event.title.indexOf(":")) === event.title.substring(0, event.title.indexOf(":"))) { // Get rid of all lectures and sections that are not part of the section group for a course
              if(event.extendedProps.lectureSectionGroup != arg.event.extendedProps.lectureSectionGroup) {
                event.setExtendedProp('relatedSelected', true);
                event.setProp('display', 'none');
              }
              else if(event.extendedProps.isLecture === 2 && new Date(event.start).getTime() != new Date(arg.event.start).getTime()) { // Checks for the other lectures' events and hides their concurrent ones as well  && new Date(event.start).getTime() != new Date(arg.event.start).getTime()
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
            if(event.groupId !== arg.event.groupId && new Date(event.start).getTime() < new Date(arg.event.end).getTime() && new Date(event.end).getTime() > new Date(arg.event.start).getTime()) { //Get rid of all overlapping events for this lecture AND CHECK IF IT IS ON THE SAME DATE
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
          calendarApi.getEvents().forEach(function (event) { //Loop through each event in calendar
            if(arg.event.title.substring(0, arg.event.title.indexOf(":")) === event.title.substring(0, event.title.indexOf(":"))) { //If the same course
              if(event.extendedProps.lectureSectionGroup != arg.event.extendedProps.lectureSectionGroup) { //Get rid of all similar courses
                event.setExtendedProp('relatedSelected', true);
                event.setProp( 'display', 'none' );
              }
              else if(event.extendedProps.isLecture === 2) { //If it's part of the same course, lecturesection group, and it is this lecture, select it
                event.setProp('borderColor', 'blue');
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
                else { //check if it is a section we want (Math 8 Spring 2023 has two sections per class) then hide its concurrent classes
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
            if(event.groupId === arg.event.groupId && new Date(event.start).getTime() != new Date(arg.event.start).getTime()) { //Other custom events Concurrency Check
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
          });
        }
        for(let k = 0; k < concurrentLectureSectionGroups.length; k++) { //Checking if all sections or all lectures of a section group is gone because of concurrency checks
          let numberLectures = 0;
          let numberSections = 0;
          calendarApi.getEvents().forEach(function (event) {
            if(event.extendedProps.lectureSectionGroup == concurrentLectureSectionGroups[k]) { //All events that are part of the lectureSectionGroup
              if(event.display != 'none') {
                if(event.extendedProps.isLecture === 2) {
                  ++numberLectures;
                } else {
                  ++numberSections;
                }
              }
            }
          });
          if(!(numberLectures > 0 && numberSections > 0)) {
            calendarApi.getEvents().forEach(function (event) {
              if(event.extendedProps.lectureSectionGroup === concurrentLectureSectionGroups[k]) {
                event.setProp( 'display', 'none' );
                //Probably need a new member variable set here as well
              }
            });
          }
        }
      }

      else { //If it is being unselected

        if(arg.event.extendedProps.isLecture === 2) { //If Lecture
          const course = this.courses.find(
              (course) => course.courseId == arg.event.extendedProps.courseId
          );
          arg.event.setProp('borderColor', getBorderColor(course.deptCode));

          calendarApi.getEvents().forEach(function (event) { //Loop through each event in calendar
            if(arg.event.title.substring(0, arg.event.title.indexOf(":")) === event.title.substring(0, event.title.indexOf(":"))) { //If its the same course
              if(event.extendedProps.isLecture === 1 && event.borderColor == "blue") { //deselect the selected sections for this lecture and then show all sections
                event.setProp('borderColor', getBorderColor(course.deptCode));
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
            if(event.groupId === arg.event.groupId && new Date(event.start).getTime() != new Date(arg.event.start).getTime()) { //For the other lectures events that become unselected, show their concurrent evens
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

          calendarApi.getEvents().forEach(function (event) { //Loop through each event in calendar
            if(arg.event.title.substring(0, arg.event.title.indexOf(":")) === event.title.substring(0, event.title.indexOf(":")) && event.extendedProps.lectureSectionGroup == arg.event.extendedProps.lectureSectionGroup && event.extendedProps.isLecture === 1) { //If the same course, same lectureSectionGroup, and it is a section, show it
              event.setExtendedProp('sectionSelected', false);
              if(event.extendedProps.overlaid.length === 0) {
                event.setProp('display', 'auto');
              }
            }
            // if(event.extendedProps.sectionSelected == false && event.extendedProps.relatedSelected == false && new Date(event.start).getTime() < new Date(arg.event.end).getTime() && new Date(event.end).getTime() > new Date(arg.event.start).getTime()) { //Add all overlapping events for this section
            //   event.setProp( 'display', 'auto' );
            // }
            if(event.groupId === arg.event.groupId && new Date(event.start).getTime() != new Date(arg.event.start).getTime()) { //Other custom events Concurrency Check
              calendarApi.getEvents().forEach(function (eventTwo) { //Adds back all overlapping events of these sections
                if(eventTwo.groupId !== event.groupId && new Date(eventTwo.start).getTime() < new Date(event.end).getTime() && new Date(eventTwo.end).getTime() > new Date(event.start).getTime()) { //Get rid of all overlapping events for this lecture AND CHECK IF IT IS ON THE SAME DATE
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
            if(event.groupId !== arg.event.groupId && new Date(event.start).getTime() < new Date(arg.event.end).getTime() && new Date(event.end).getTime() > new Date(arg.event.start).getTime()) { //Adds all overlapping events for this lecture
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

        else { //If Custom Event: First: Do CustomEvent Logic, Subtract Concurrencys, then show or hide things
          arg.event.setProp( 'borderColor', 'transparent');
          calendarApi.getEvents().forEach(function (event) { //Loop through each event in calendar
            if(event.groupId === arg.event.groupId && new Date(event.start).getTime() != new Date(arg.event.start).getTime()) { //Other custom events Concurrency Check
              calendarApi.getEvents().forEach(function (eventTwo) { //Adds back all overlapping events of these sections
                if (eventTwo.groupId !== event.groupId && new Date(eventTwo.start).getTime() < new Date(event.end).getTime() && new Date(eventTwo.end).getTime() > new Date(event.start).getTime()) { //Get rid of all overlapping events for this lecture AND CHECK IF IT IS ON THE SAME DATE
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
            if(event.groupId !== arg.event.groupId && new Date(event.start).getTime() < new Date(arg.event.end).getTime() && new Date(event.end).getTime() > new Date(arg.event.start).getTime()) { //Adds all overlapping events for this lecture
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
          for(let k = 0; k < concurrentLectureSectionGroups.length; k++) { //Checking if all sections or all lectures of a section group is gone because of concurrency checks
            let numberLectures = 0;
            let numberSections = 0;
            calendarApi.getEvents().forEach(function (event) {
              if(event.extendedProps.lectureSectionGroup == concurrentLectureSectionGroups[k]) { //All events that are part of the lectureSectionGroup
                if(event.extendedProps.sectionSelected == false && event.extendedProps.relatedSelected == false && event.extendedProps.overlaid.length === 0) {
                  if(event.extendedProps.isLecture === 2) {
                    ++numberLectures;
                  } else {
                    ++numberSections;
                  }
                }
              }
            });
            if(numberLectures > 0 && numberSections > 0) {
              calendarApi.getEvents().forEach(function (event) {
                if(event.extendedProps.lectureSectionGroup === concurrentLectureSectionGroups[k] && event.extendedProps.sectionSelected == false && event.extendedProps.relatedSelected == false && event.extendedProps.overlaid.length === 0) {
                  event.setProp( 'display', 'auto' );
                }
              });
            }
            else {
              calendarApi.getEvents().forEach(function (event) {
                if(event.extendedProps.lectureSectionGroup === concurrentLectureSectionGroups[k]) {
                  event.setProp( 'display', 'none' );
                }
              });
            }
          }
        }
      }

      //DONE TODO: You can now edit schedule name on home page
      //TODO: Double View Obscures first calendar
      //TODO ListView SaveName should be based on updatedScheduleName
      //NOT TODO:  Remove extraneous Edit Schedule feature
      //TODO: Let FullCalendar components :mintime and :maxtime variables be inclusive of custom events
      //NOT TODO set "Favorite Schedules" to true if it is already saved, same with the name and everything else..
      //TODO alerts conditionals when there are full classes (wait for ramon to push)
      //NOT TODO hide edit courses for current view == 3
      //NOT TODO npm install TRIVIAL
      //NOT TODO reset filters in schedule paginator affects schedule builder? INSANE
      //NOT TODO make schedule builder affected by sorting and filtering options? INSANE
      //NOT TODO make schedule builder affected by edit class section Sections? INSANE
      // TODO: Put Back all features like LikedINSANE
      this.handleRemoveTabIndexFromEvents();
    },
    eventDidMount: function(info) {
      // alert(JSON.stringify(info.event.extendedProps));
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
    // /**
    //  * POSTS the given schedule to the backend for storage. Sets the quarter, name, units, and userEmail properties on the schedule.
    //  */
    saveSchedule: function (schedule) {
      console.log("Yes");
      if (this.$store.getters.userIsAuthenticated) {
        //if user isn't logged in, nothing happens
        this.savingScheduleInProgress = true;
        $("span").css("pointer-events", "none"); //anything in a span will be disabled
        schedule.quarter = this.quarter;
        schedule.userEmail = this.$store.getters.userInfo.email;
        schedule.name = xss(this.updatedScheduleName);
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
    // /*
    //  * Removes the favorite status from a schedule, Removes the schedule from the backend,
    //  * delivers a toast showing that it has been deleted.
    //  */
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
