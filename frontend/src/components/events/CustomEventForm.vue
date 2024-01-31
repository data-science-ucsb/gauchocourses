<!-- This component contains a form for filling the imformation for a custom form.
      It has a text box with a helper tool for a title. It also has time pickers
       for start/end times and checkboxes for days of the week.
      It has function that check for valid input states.-->
<template>

  <div id="CustomEventModal">
    <b-modal v-model="showCustomEventModal"
      title="Create a Custom Event"
      header-bg-variant="secondary"
      header-text-variant="light"
      hide-footer>

      <b-container>

        <b-row align-h="center" align-content="center">
          <b-col cols='12'>
            <p>
              Create custom events for times that you want to block off. Use this for things like CLAS,
              club meetings, or weekly movie nights.
            </p>
          </b-col>
        </b-row>

        <b-card>
          <template v-slot:header>
            <font-awesome-icon
              id="reset-icon"
              style="color: #0275D8;"
              icon='undo'
              class="float-right"
              @click="init()"/>
            <b-tooltip target="reset-icon">Reset all entries</b-tooltip>
          </template>

        <div>
          <b-form-group
            label="Title:"
            label-cols="12"
            label-cols-sm="2"
            label-align="center">
            <b-form-input
              id="input-live"
              v-model="eventTitle"
              :state="titleState"
              aria-describedby="input-live-help input-live-feedback"
              placeholder="Enter a title"
              trim>
            </b-form-input>

            <!-- This is a form text block (formerly known as help block) -->
            <b-form-text id="input-live-help">
              The title of your custom event. It cannot be blank or
              exceed 255 characters.</b-form-text>
          </b-form-group>
      <!-- This will only be shown if the preceding input has an invalid state -->
      <!-- <b-form-invalid-feedback id="input-live-feedback">
      You're missing a title or your title is too long
      </b-form-invalid-feedback> -->
        </div>

        <div>
          <b-form-group
            label="Start:"
            label-cols="12"
            label-cols-sm="2"
            label-align="center">
            <b-form-timepicker
              id="start-time"
              :state="timesAreValid"
              v-model="startTime"
              locale="en">
            </b-form-timepicker>

            <b-form-invalid-feedback :state="timesAreValid">
              Start time must be before end time.
            </b-form-invalid-feedback>
          </b-form-group>
        </div>

        <div>
          <b-form-group
            label="End:"
            label-cols="12"
            label-cols-sm="2"
            label-align="center">
            <b-form-timepicker
              id="end-time"
              v-model="endTime"
              locale="en">
            </b-form-timepicker>
          </b-form-group>
        </div>

        <div>
          <b-form-group
            label="Days:"
            label-cols="12"
            label-cols-sm="2"
            label-align="center">
            <b-form-checkbox-group size="sm" id="checkbox-group-2" v-model="daysSelected" name="flavour-2">
              <b-form-checkbox value="MONDAY">Mon</b-form-checkbox>
              <b-form-checkbox value="TUESDAY">Tue</b-form-checkbox>
              <b-form-checkbox value="WEDNESDAY">Wed</b-form-checkbox>
              <b-form-checkbox value="THURSDAY">Thu</b-form-checkbox>
              <b-form-checkbox value="FRIDAY">Fri</b-form-checkbox>
            </b-form-checkbox-group>
            <b-form-text>
            Select one or more days.
            </b-form-text>
          </b-form-group>
        </div>
      </b-card>

      <b-row>
      <b-col/>
      <b-col/>
      <b-col cols="6" class="text-right" align-self="end">
      <b-button-group>
      <!-- this will be unavailable until all entries are valid -->
      <b-button v-bind:disabled = "inputsAreInvalid" @click="saveEvent" variant="primary">Save Event</b-button>
      <b-button @click="cancelForm" variant="danger">Close</b-button>

      </b-button-group>
      </b-col>
      </b-row>
      </b-container>
    </b-modal>
  </div>
</template>

<script>
import xss from 'xss';

export default {

  name:'CustomEventModal',

  props: {
    eventtoedit: Object
  },

  data: function() {
    return {
      eventTitle: '',
      startTime: '16:00:00',
      endTime: '17:00:00',
      daysSelected:[],
      showCustomEventModal: false,
      isBeingEdited: false,
      oldName: '',
      timesAreValid: true,
      titleState: null,
      daysAreValid: null
    }
  },
  created: function(){
    this.$eventHub.$on("edit-custom-event", this.loadEvent);
    this.$eventHub.$on("start-new-custom-course", this.init);
  },

  computed: {
    cleanEventTitle: function() {
      //var xss = require("xss");
      var clean = xss(this.eventTitle);
      return clean;
    },
    //Checks to see that all input statuses are valid. Returns true if they are
    inputsAreInvalid: function() {
      var invalid = true;
      if((this.titleState == true) && (this.timesAreValid == true) && (this.daysAreValid == true)){
          invalid = false;
      }
      return invalid;
    },
  },
  methods: {
    init: function(){
      this.isBeingEdited = false;
      this.eventTitle = '';
      this.startTime = '16:00:00';
      this.endTime = '17:00:00';
      this.daysSelected = [];
      this.showCustomEventModal = true;
    },
    //loads the event during an edit
    loadEvent: function(entry){
        this.isBeingEdited = true;
        this.oldName = entry.name
        this.eventTitle = entry.name;
        this.startTime = entry.timeLocations[0].beginTime;
        this.endTime = entry.timeLocations[0].endTime;
        this.daysSelected = entry.timeLocations[0].fullDays;
        this.showCustomEventModal = true;
    },
    //creates an object that contains the custom event's information.
    //Emits the object to the parent component.
    saveEvent: function(){
      if ( this.isBeingEdited == true){
        this.$store.commit('removeCustomEvent', this.oldName); //remove the old custom event
        this.isBeingEdited = false;
      }
      var addedevent = {
        id: null,
        name: "",
        timeLocations: [
          {
            days: "",
            beginTime: "",
            endTime: ""
          }
        ],
      };
      addedevent.timeLocations[0].beginTime = this.startTime;
      addedevent.timeLocations[0].endTime = this.endTime;
      addedevent.name = this.cleanEventTitle;
      addedevent.timeLocations[0].fullDays = this.daysSelected;
      this.$store.commit('addCustomEvent',addedevent);
      this.showCustomEventModal = false;
    },
    //Emits an event to close the modal
    cancelForm: function() {
      this.showCustomEventModal = false;
    }
  },
  watch: {
    //Returns true if at least one day is selected
    daysSelected() {
      this.daysAreValid = this.daysSelected.length  != 0 ? true : false;
    },
    //Returns true if the end time is after the start time
    startTime() {
      var startMoment = this.$date(this.startTime,"HH:mm:ss");
      var endMoment = this.$date(this.endTime,"HH:mm:ss");
      var timesValid = startMoment.isBefore(endMoment);
      this.timesAreValid = timesValid;
    },
    //Returns true if the end time is after the start time
    endTime() {
      var startMoment = this.$date(this.startTime,"HH:mm:ss");
      var endMoment = this.$date(this.endTime,"HH:mm:ss");
      var timesValid = startMoment.isBefore(endMoment);
      this.timesAreValid = timesValid;
    },
    //Returns true if the title contains at least one character and no more than 255
    eventTitle() {
      var y = this.eventTitle.length  != '' ? true : false;
      var z = this.eventTitle.length <= 255 ? true : false;
      this.titleState = y && z ? true : false;
    },
  }
}

</script>

<style>


</style>
