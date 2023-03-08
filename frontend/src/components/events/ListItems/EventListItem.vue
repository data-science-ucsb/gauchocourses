<template>
  <div>
    <b-list-group-item class="d-flex p-0 w-100">
      <div class="event-color-block"
        :style="{'background-color': backgroundColor, 'border-right-color': borderColor }"
      ></div>
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
        }
    }
}
</script>

<style>
.subtext {
  color: gray;
  text-decoration: underline;
}

.event-color-block {
    width: 5%;
    border-right-width: 2px; 
    border-right-style: solid;
}
</style>