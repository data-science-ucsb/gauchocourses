/**
    https://www.codeply.com/go/5Lu0E8graQ/bootstrap-4-user-profile-template
    https://bootstrap-vue.js.org/docs/components/table/#row-select-support
*/

<template>
    <b-container>
        <!-- Begin user profile section userAttributes != null -->
        <div v-if="$store.getters.userIsAuthenticated">
            <b-row>
                <!-- Begin tabs section -->
                <b-col cols=12>
                    <b-nav tabs fill>
                        <b-nav-item v-for="tab in tabs"
                            v-bind:key="tab"
                            v-bind:active="tab == activeTab"
                            v-on:click="updateActiveTab(tab)">
                            {{ tab }}
                        </b-nav-item>
                    </b-nav>
                    <!-- Begin content for each tab -->
                    <div v-if="activeTab == 'Schedules'">
                        <b-row>
                            <b-col cols=4>
                                <!-- TODO: Add a selector for courses. This could filter the schedules -->
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col>
                              <keep-alive>
                                <SchedulePaginator
                                :schedules="schedulesForQuarter"
                                :showQuarterSelector="true"
                                :showFavoritesButton="false"
                                :showEditButton="true"
                                class="h-100"/>
                              </keep-alive>
                            </b-col>
                        </b-row>
                    </div> <!-- End "Schedule" tab  -->
                    <div v-if="activeTab == 'Settings'">
                        <b-row>
                             <b-col cols=3>
                                <img :src="$store.getters.userInfo.photoURL"
                                    :alt="$store.getters.userInfo.fullName"
                                    height="42"
                                    width="42">
                            </b-col>
                            <b-col cols=9>
                                <b-table stacked
                                        :items="userAttributeTable">
                                </b-table>
                            </b-col>
                        </b-row>
                    </div> <!-- End content for each selector -->
                </b-col> <!-- End tabbed selectors section -->
            </b-row>
        </div>  <!-- End user profile section -->

        <!-- Begin prompt for login -->
        <div v-else>
            <b-row class="mt-5" align-h="center">
                <b-col cols=12 class="text-center">
                    <h3>Welcome to GauchoCouses!</h3>
                    <a href="/oauth2/authorization/google">
                      <b-button class="mb-2" variant="primary">Log in with Google</b-button>
                    </a>
                    <br>
                    <!-- <a><b-img src="@/assets/google_signin_buttons/web/2x/btn_google_signin_light_focus_web@2x.png"></a> -->
                    <p>
                      Please log in using a Google account to save your schedules.
                    </p>
                </b-col>
            </b-row>
        </div> <!-- End prompt for login -->
    </b-container>
</template>

<script>

import api from "@/components/backend-api.js";
import SchedulePaginator from '@/components/schedules/SchedulePaginator.vue'

export default {
    name: 'UserProfile',
    components:{
      SchedulePaginator
    },
    data: function() {
        return {
            activeTab: 'Schedules',
            tabs: [
                'Schedules',
                'Settings'
            ],
            loading: true,
            errors: [],
            schedules: [],
            allCourseIds: [],
            scheduleTableHeaderNames: [
                {
                    key: 'edit',
                    label: 'Edit'
                },
                {
                    key: 'name',
                    label: 'Name',
                },
                {
                    key: 'sortingAttributes.cleanBegin',
                    label: 'Earliest'
                },
                {
                    key: 'sortingAttributes.cleanEnd',
                    label: 'Latest'
                },
                {
                    key: 'days',
                    label: 'Days'
                },
                {
                    key: 'totalUnits',
                    label: 'Units'
                },
                {
                    key: 'showDetails',
                    label: 'Details'
                }
            ],
        }
    },
    /**
     * 1. Get & set user attributes.
     * 2. Use email to get & set their schedules.
     * 3. Get & set the quarters.
     */
    created: function() {
        api.getSchedulesForUser(this.$store.getters.userInfo.email)
          .then(response =>  this.schedules = response.data)
          .catch(error => {
              this.errors.push(error);
          });
    },
    methods: {
      /**
       * Gets list of days
       */
      getDaysFromList: function(scheduleattributes){
        var daysstring = "";

        const dayInt = {
            'MONDAY': 'M',
            'TUESDAY': 'T',
            'WEDNESDAY': 'W',
            'THURSDAY': 'R',
            'FRIDAY': 'F',
            'SATURDAY': 'S',
        };

        scheduleattributes.daysWithEvents.forEach(c => {
          daysstring += dayInt[c];
        });
        return daysstring;
      },
      //clean time
      cleanTime: function(rawtime){
        var cuttime = "";
        var inttime = 0;
        var ending = "AM";
        var goodtime = "";
        var stringgoodtime = "";

        cuttime = rawtime.substring(2, rawtime.length-3); //cuts seconds off of a time
        inttime = parseInt(rawtime.substring(0, 2)); //turns in the hours of a time to an int

        if (inttime > 12) {
          //24 hour clock into 12 hour clock
          inttime = inttime - 12;
          ending = "PM";
        } else if (inttime == 12) {
          ending = "PM";
        }
        stringgoodtime = inttime.toString();
        goodtime = stringgoodtime.concat(cuttime, ending);

        return goodtime;
      },
      /**
       * Updates the currently active tab.
       */
      updateActiveTab: function(newTab) {
          this.activeTab = newTab;
      },
    },
    computed: {
      /**
       * Computed prop for the selectedQuarter.
       */
      currentQuarter: {
        get: function() {
          return this.$store.state.selectedQuarter;
        },
        set: function(newQuarter) {
          this.$nextTick(() => this.$store.commit('setSelectedQuarter', newQuarter));
        }
      },
        /**
         * Filters the schedules for the currently selected quarter.
         * Computes the earliest and latest times for the schedules.
         */
         schedulesForQuarter: function() {

           this.schedules.forEach(s => {
             s.days = this.getDaysFromList(s.sortingAttributes);
             s.sortingAttributes.cleanBegin = this.cleanTime(s.sortingAttributes.earliestBeginTime);
             s.sortingAttributes.cleanEnd = this.cleanTime(s.sortingAttributes.latestEndTime);
            s.favorited = true;
           });

          return this.schedules
                .filter(schedule => schedule.quarter == this.currentQuarter)
        },
        /**
         * Used to populate the table showing the user's details.
         */
        userAttributeTable: function() {
            return [{
                name: this.$store.getters.userInfo.fullName,
                email: this.$store.getters.userInfo.email,
                authenticationProvider: 'Google',
            }]
        },
        userPhotoURL: function() {
            if (!this.userAttributes) return "@/assets/user-photo-placeholder.png";
            else return this.userAttributes.principal.picture;
        }
    }
}
</script>

<style>

</style>
