<template>
    <EventListItem
        :title="customEvent.name"
        :borderColor="customEvent.borderColor"
        :backgroundColor="customEvent.backgroundColor"
    >
        <template v-slot:subtext>
            {{days}}
        </template>
        <template v-slot:popoverContent>
            <strong>Days: </strong>{{ days }}
            <br/>
            <strong>Time: </strong>{{customEvent.timeLocations[0].beginTime}} to {{customEvent.timeLocations[0].endTime}}
        </template>
        <template v-slot:buttons>
            <slot name="buttons"></slot>
        </template>
    </EventListItem>
</template>

<script>
import EventListItem from "@/components/events/ListItems/EventListItem.vue";
import {getAbbreviatedDaysForEvent} from "@/components/util/event-methods.js";

export default {
  props: {
    customEvent: {
      type: Object
    }
  },
  components: {
    EventListItem
  }, 
  computed: {
      /**
       * Returns a string with the custom event's days complete with commas.
       */
      days: function() {
        return getAbbreviatedDaysForEvent(this.customEvent)
          .join(', ');
      }
  }
};
</script>

<style>
</style>