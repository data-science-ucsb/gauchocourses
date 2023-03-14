<template>
  <div>
    <b-list-group-item class="d-flex p-0 w-100">
      <div class="event-color-block" :style="{'border-right-color': borderColor}">
        <template>
          <verte v-model="colorVal" :value="backgroundColor" picker="square" menuPosition="center" model="rgb" :enableAlpha="false">
            <svg :class="'color-block course-id-' + titleHash" viewBox="0 0 1 1" preserveAspectRatio="none">
              <rect/>
            </svg>
          </verte>
        </template>
      </div>
      <div class="event-description-block my-1 ml-2">
        <p class="mb-0">
          <strong class="event-name" v-if="full === false">{{ this.title }}</strong>
          <strong class="event-name" v-else>{{ this.title }} (Full)</strong>
        </p>
        <span class="subtext" :id="'popover'+randomId">
          <small>
              <slot name="subtext">
              </slot>
          </small>
        </span>
      </div>
      <div class="event-button-block align-self-center">
          <slot name="buttons">
          </slot>
      </div>
    </b-list-group-item>
    <b-popover :target="'popover'+randomId" triggers="hover" placement="right" boundary="window">
      <slot name="popoverContent">
      </slot>
    </b-popover>
  </div>
</template>

<script>
import { setBackgroundColor, getHash } from "@/components/util/color-utils.js";
import $ from "jquery";

export default {
  props: {
      title: {
          type: String
      },
      backgroundColor: {
          type: String
      },
      borderColor: {
          type: String
      },
      full: {
          type: Boolean
      },
      randomId: {
          type: String
      },
      custom: {
          type: Boolean
      }
  },
  computed: {
    titleHash() {
      return getHash(this.title)
    }
  },
  data: function() {
    return {
      colorVal: this.backgroundColor,
    };
  },
  watch: {
    colorVal(color) {
      setBackgroundColor(this.title, color);
      $(".course-id-" + this.titleHash).css({'background-color': color, 'fill': color});
    }
  },
}
</script>

<style>
.subtext {
  color: gray;
  text-decoration: underline;
}
.verte {
  width: 100%;
  height: 100%;
}
.verte > .verte__guide {
  width: 100%;
  height: 100%;
}
.event-color-block {
  flex-basis: 5%;
  min-width: 0;
  border-right-width: 2px; 
  border-right-style: solid;
}
.color-block {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.event-description-block {
  min-width: 0;
  flex-basis: 80%;
}
.event-button-block {
  min-width: 0;
  text-align: center;
  flex-basis: 15%;
}
</style>