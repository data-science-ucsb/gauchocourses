<template>
  <b-list-group v-if="doneLoading">
    <b-list-group-item
      class="scheduleListItem"
      v-for="(schedule, index) in schedule"
      :key="index"
    >
      <div class="d-flex flex-row align-items-center">
        <span class="d-inline-block" tabindex="0">
          <font-awesome-icon
            v-if="schedule.favorited"
            icon="heart"
            size="sm"
            :id="'heart-favorited-' + index"
            style="color: #ED0303;"
            @click="unFavoriteSchedule(schedule, index)"
          />

          <font-awesome-icon
            v-else
            icon="heart"
            size="sm"
            :id="'heart-icon-' + index"
            style="color: #FFC7C7;"
            @click="saveSchedule(schedule)"
          />
        </span>

        <b-tooltip v-if="!$store.getters.userIsAuthenticated" :target="'heart-icon-' + index">
          You must sign in to save schedules.
        </b-tooltip>

        <b-toast :id="'deleted-toast-' + index" title="You deleted a schedule!" variant="warning">
          The schedule, "{{schedule.name}}" was deleted. Click the button to undo.
          <b-button @click="saveSchedule(schedule)" variant="warning">
          Undo
          </b-button>
        </b-toast>

        <div class="flex-grow-1">
          <b-button
            :id="'popover-button-sync-' + index"
            ref="button"
            @click="popoverShow[index] = !popoverShow[index]"
            class="scheduleNamecls"
            variant="link"
          >{{schedule.name}}</b-button>

          <b-popover
            :id="'popover-' + index"
            :show.sync="popoverShow[index]"
            :target="'popover-button-sync-' + index"
            placement="bottom">
            <template v-slot:title>
              <b-button @click="onClose(index)" class="close" aria-label="Close">
                <span class="d-inline-block" aria-hidden="true">&times;</span>
              </b-button>Enter schedule name:
            </template>
            <b-row>
              <b-col cols="10" class="px-2">
                <b-form-input v-model="scheduleNames[index]"></b-form-input>
              </b-col>
              <b-col class="p-2">
                <font-awesome-icon
                  icon="check"
                  size="lg"
                  style="color: #428bca;"
                  @click="saveName(index)"
                />
              </b-col>
            </b-row>
          </b-popover>

          <div>
            Start: {{formatTime(schedule.sortingAttributes.earliestBeginTime)}} - End: {{formatTime(schedule.sortingAttributes.latestEndTime)}}
            <br />
            Classes on {{getAbbreviatedDays(schedule.sortingAttributes.daysWithEvents).join(', ')}} -- {{schedule.totalUnits}} units
          </div>
        </div>

        <div v-b-toggle="'collapse-' + index" style="margin-right: 5px;">
          <font-awesome-icon icon="chevron-down" size="sm" />
        </div>

        <div v-if="showEditButton">
          <router-link v-on:click.native="editSchedule(schedule)" :to="{name:'home'}">
            <font-awesome-icon
            icon="edit"
            size="lg" />
            </router-link>
        </div>

      </div>
      <b-collapse :id="'collapse-' + index">
        <div class="schedule-table-container">
          <b-table small :items="formatEnrollCodes(schedule.classes)" style="margin-bottom: 0; white-space: pre;"></b-table>
        </div>
        <div class="schedule-table-container">
          <b-table small :items="formatCustomEvent(schedule.customEvents)" style="margin-bottom: 0; white-space: pre;"></b-table>
        </div>
      </b-collapse>
  </b-list-group-item>
</b-list-group>

  <div v-else class="text-center">
    <b-spinner class="m-2" variant="primary" label="Spinning"></b-spinner>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import { formatTime } from "../util/util-methods";
import { getAbbreviatedDays } from "../util/event-methods.js";
import $ from "jquery";
import api from "@/components/backend-api.js";
import xss from "xss";

export default {
  data: () => {
    return {
      popoverShow: [],
      savingScheduleInProgress: false,
      scheduleSavedStatus: null,
      errors: [],
      coursesComputed: [],
      doneLoading: false,
      scheduleNames: [],
      scheduleLocal: this.schedule,
    };
  },
  props: {
    courses: {
      type: Array,
      required: false
    },
    schedule: {
      type: Array,
      default: () => {},
      required: true,
    },
    showEditButton: {
      type: Boolean,
      default: false,
    }
  },
  created: function () {
    this.schedule.forEach((schedule, i) => {
      //if this.courses has courses that are in the schedule, add them to the coursesComputed
      schedule.classes.forEach((course) => {
        const match = this.courses.find(item => item.courseId == course.courseId);
        if ((match != undefined) && (this.coursesComputed.includes(match) == false)) {
          this.coursesComputed.push(match);
        }
      });

      const codesNeeded = [];
      const courseNames = this.coursesComputed.map((course) => course.courseId);
      //check if schedule has courses that aren't yet in coursesComputed
      schedule.classes.forEach((course) => {
        if(courseNames.includes(course.courseId) == false) { //if course isnt in there yet
          //add the enroll code to codesNeeded
          codesNeeded.push(course.scheduledEnrollCodes[0]);
        }
      });

      Promise.all(
        codesNeeded.map((code) => api.coursefromEnrollCode(schedule.quarter, code)))
        .then((responses) => {
          responses
          .map((r) => r.data.classes[0])
          .forEach((course) => {
            this.coursesComputed.push(course);
          });
        })
        .catch(err => console.error(err))
        .finally(() => {
          this.popoverShow[i] = false;
          schedule.totalUnits = this.calculateUnits(schedule, this.coursesComputed);
          this.scheduleNames[i] = schedule.name;
        });

    });
    this.doneLoading = true;
  },
  computed: {
    quarter: function () {
      return this.$store.state.selectedQuarter;
    },
    classSections: function(){
      var allSections = [];
      this.coursesComputed.forEach((course) => {
        allSections.push(course.classSections);
      });
      allSections = allSections.flat();
      return allSections;
    }
  },
  watch: {
    //When the page is changed, new schedules are presented to the prop.
    //Calculate the totak units for each schedule when new ones are presented.
    schedule: function () {
      this.schedule.forEach((schedule) => {
        schedule.totalUnits = this.calculateUnits(schedule, this.coursesComputed);
      });
    },
  },
  methods: {
    formatTime: formatTime,
    getAbbreviatedDays: getAbbreviatedDays,
    formatEnrollCodes: function(classes) {
        const tableArr = [];
        classes.forEach(course => {
            // reverse enroll codes so that lecture is shown first and then section (like on gold)
            const reversedEnrollCodes = course.scheduledEnrollCodes.slice().reverse();
            const sections = reversedEnrollCodes.map((code) =>
                  this.classSections.find(section => section.enrollCode === code));
            const sectionString = sections.map(section => {
                return section.timeLocations.map((time) => {
                    return `${time.days.trim()} ${formatTime(time.beginTime)} - ${formatTime(time.endTime)}`;
                }).join(" ");
            });
            tableArr.push({
              "class": course.courseId,
              "enroll_codes": reversedEnrollCodes.join("\n"),
              "time": sectionString.join("\n"),
            });
        });
        return tableArr;
    },
    //Formats data from custom events into an array that can be displayed in a table
    formatCustomEvent: function(events) {
      const tableArr = [];
      events.forEach(event => {
        const daysString = event.timeLocations[0].fullDays.join(" ");
        const timeString = formatTime(event.timeLocations[0].beginTime) + " - " + formatTime(event.timeLocations[0].endTime);
        const totalString = daysString + " " + timeString;
        tableArr.push({
          "Event_name": event.name,
          "time": totalString,
        });
      });
      return tableArr;
    },
    //Accumulate total units in a schedule using the course objects.
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
    onClose: function (index) {
      this.$root.$emit("bv::hide::popover", "popover-" + index);
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
          schedule.totalUnits = this.calculateUnits(schedule, this.coursesComputed);

          api
            .saveSchedule(schedule)
            .then((response) => {
              schedule.id = response.data;
              this.scheduleSavedStatus = "successful";
            })
            .catch((error) => {
              this.errors.push(error);
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
    unFavoriteSchedule: async function (schedule, index) {
      if (this.$store.getters.userIsAuthenticated) {
        const resp = await api.deleteSchedule(schedule);
        if (resp.status > 400) {
          return;
        } else {
          this.$set(schedule, 'favorited', false);
          this.$bvToast.show('deleted-toast-' + index);
          this.$forceUpdate();
        }
      }
    },
    saveName: function (index) {
      this.onClose(index);
      const cleanedName = xss(this.scheduleNames[index]);

      api
        .updateScheduleName(this.schedule[index].id, cleanedName)
        .then(() => this.scheduleLocal[index].name = cleanedName) // steven: put schedule as a local variable in data (line 129) to avoid mutation error, not sure if right move
        // .then(() => this.schedule[index].name = cleanedName)
        .catch(resp => resp) // TODO: Better error handling
    },
    editSchedule: async function(schedule) {
      await this.$store.dispatch('initializeStoreAsync',schedule);
      this.$eventHub.$emit('generate-schedules', null);
    }
  },
};
</script>

<style>
.scheduleNamecls {
  font-size: 1.125rem;
}
.scheduleListItem {
  padding: 0.5rem 1.25rem !important;
  border-radius: 0 !important;
}
.lightHeart {
  color: #ffc7c7;
}
.darkHeart {
  color: #ed0303;
}
.schedule-table-container {
  overflow-x: auto;
}
.schedule-table-container {
  overflow-x: auto;
}
</style>
