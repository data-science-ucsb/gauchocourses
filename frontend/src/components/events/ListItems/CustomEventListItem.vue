<template>
    <EventListItem
        :title="customEvent.name"
        :borderColor="borderColor"
        :backgroundColor="backgroundColor"
        :full=false
        :custom=true
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
import { getBackgroundColor, getBorderColor } from "@/components/util/color-utils.js";

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
     * Returns a string with the border color for the event
     */
    borderColor: function() {
      // TODO: Once we have class definitions on the frontend, consolidate any usages of "getColor" stuff to the class definitions.
      return getBorderColor(this.customEvent.name);
    },
    /**
     * Returns a string with the border color for the event
     */
    backgroundColor: function() {
      // TODO: Once we have class definitions on the frontend, consolidate any usages of "getColor" stuff to the class definitions.
      let ctx = document.createElement('canvas').getContext('2d');
      ctx.fillStyle = getBackgroundColor(this.customEvent.name.replace(/\s/g, ""));
      return ctx.fillStyle;
    },
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