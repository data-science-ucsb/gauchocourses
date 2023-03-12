<template>
  <div>
    <b-list-group-item class="d-flex p-0 w-100">
      <div class="event-color-block" :style="{'border-right-color': borderColor}">
        <template>
          <verte v-model="colorVal" :value="backgroundColor" picker="square" menuPosition="center" model="rgb" :enableAlpha="false">
            <svg :class="'course-id-' + title.replace(/\s/g,'')" viewBox="0 0 1 1" preserveAspectRatio="none">
              <rect width="100%" height="100%"/>
            </svg>
          </verte>
        </template>
      </div>
      <div class="my-1 ml-2">
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
      <div class="ml-auto mr-4 align-self-center">
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
import { setBackgroundColor } from "@/components/util/color-utils.js";
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
  data: function() {
    return {
      colorVal: this.backgroundColor,
    };
  },
  watch: {
    colorVal(color) {
      setBackgroundColor(this.title.replace(/\s/g, ""), color);

      // const addStyle = (() => {
      //   const style = document.createElement('style');
      //   document.head.append(style);
      //   return (styleString) => style.textContent = styleString;
      // })();

      // addStyle('.course-id-' + this.title.replace(/\s/g,'') + '{background-color:' + color + '; fill:' + color + '}');

      $(".course-id-" + this.title.replace(/\s/g,'')).css({'background-color': color, 'fill': color});
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
    width: 5%;
    border-right-width: 2px; 
    border-right-style: solid;
}
</style>