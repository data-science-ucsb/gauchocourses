
<!--
    Renders the selected courses and custom events from Vuex store. Allows the user to add a custom event.
    Allows user to edit and delete their custom events or selected courses.
-->
<template>
    <div>
        <!-- Declare modals for editing courses and custom events-->
        <ClassList/>
        <CustomEventForm/>
        <!-- End modal declarations -->
        <b-card
            bg-variant="light"
            no-body
            style="height: 100%"
        >
        <template>
            <div id="selected-courses-header" class="card-header">
                <div id="selected-courses-title"><b>Selected Courses</b></div>
                <div id="conflictingEventIcon">
                    <font-awesome-icon
                    v-if="$store.getters.selectionsAreConflicting"
                    icon='info-circle'
                    :style="{ color: 'red' }"/>
                    <b-tooltip target="conflictingEventIcon">Some of your chosen courses conflict with each other!</b-tooltip>
                </div>
                <div @click="$eventHub.$emit('start-new-custom-course', 0)" id="addCustomEventIcon" class="float-right add-event-button-outline">
                    <font-awesome-icon icon="calendar-plus"/>
                    <small style="margin-left: 3px" for="addCustomEventIcon">Custom</small>
                    <b-tooltip target="addCustomEventIcon">Add custom event</b-tooltip>
                </div>
            </div>
        </template>
        <div class="event-card-body" >
            <template v-if="$store.state.selectedCourses.length == 0 & $store.state.selectedCustomEvents.length == 0">
                <b-card-body class="text-center no-events-placeholder">
                    <font-awesome-icon icon="exclamation-circle" size="lg"/>
                    <b-card-text>
                        You haven't added any courses or custom events yet.
                    </b-card-text>
                </b-card-body>
            </template>
            <template v-else>
                <b-list-group class="event-list" flush>
                    <div v-for="course in  $store.state.selectedCourses" v-bind:key="course.title">
                        <CourseListItem class="selected-course" :course="course">
                            <template v-slot:buttons>
                                <a id="deselectCourse" @click="$store.commit('removeSelectedCourse', course.courseId)" class="remove-event">
                                    <font-awesome-icon
                                        v-b-tooltip.hover
                                        title="Deselect course"
                                        icon="trash-alt"
                                        :id="'deselect-course-icon'+course.title"
                                        class="mr-2"/>
                                </a>
                                <b-tooltip :target="'deselect-course-icon'+course.title">Deselect course</b-tooltip>
                                <a id="editCourse" @click="$eventHub.$emit('edit-classes-for-course', course.courseId)" class="edit-event">
                                    <font-awesome-icon
                                        v-b-tooltip.hover
                                        title="Edit class section selections"
                                        :id="'edit-course-icon'+course.title"
                                        icon="edit"/>
                                </a>
                                <b-tooltip :target="'edit-course-icon'+course.title">Edit class section selections</b-tooltip>
                            </template>
                        </CourseListItem>
                    </div>
                    <div v-for="customEvent in $store.state.selectedCustomEvents"
                        :key="customEvent.name"
                    >
                        <CustomEventListItem class="custom-event" :customEvent="customEvent">
                            <template v-slot:buttons>
                                <a id="deleteCustomEvent" @click="$store.commit('removeCustomEvent', customEvent.name)" class="remove-event">
                                    <font-awesome-icon
                                        icon="trash-alt"
                                        :id="'delete-event-icon'+customEvent.name"
                                        v-b-tooltip.hover
                                        title="Delete custom event"
                                        class="mr-2"/>
                                </a>
                                <b-tooltip :target="'delete-event-icon'+customEvent.name">Delete custom event</b-tooltip>
                                <a id="editCustomEvent" @click="$eventHub.$emit('edit-custom-event', customEvent)" class="edit-event">
                                    <font-awesome-icon
                                        v-b-tooltip.hover
                                        :id="'edit-event-icon'+customEvent.name"
                                        title="Edit custom event"
                                        icon="edit"/>
                                </a>
                                <b-tooltip :target="'edit-event-icon'+customEvent.name">Edit custom event</b-tooltip>
                            </template>
                        </CustomEventListItem>

                    </div>
                </b-list-group>
            </template>
        </div>
        </b-card>
    </div>

</template>

<script>
import CustomEventForm from "@/components/events/CustomEventForm.vue";
import ClassList from "@/components/events/ClassList.vue"
import CourseListItem from "@/components/events/ListItems/CourseListItem.vue";
import CustomEventListItem from "@/components/events/ListItems/CustomEventListItem.vue";
import {throttle} from "lodash";

export default {
    components: {
        CustomEventForm,
        ClassList,
        CourseListItem,
        CustomEventListItem
    },
    data: function() {
        return {
            getSchedulesThrottleMs: 5000, // milliseconds
        }
    },
    created: function() {
        // Throttled method to get schedules.
        this.throttledGetSchedules = throttle(() => this.$eventHub.$emit('generate-schedules', null), this.getSchedulesThrottleMs);

        if (this.selectedCoursesAndCustomEvents.length != 0) {
            this.throttledGetSchedules();
        }
    },
    watch: {
        selectedCoursesAndCustomEvents: function() {
            this.throttledGetSchedules();
        }
    },
    computed: {
        selectedCoursesAndCustomEvents: function() {
            return this.$store.state.selectedCustomEvents.concat(this.$store.state.selectedCourses);
        }
    }
}
</script>

<style>
.event-card-body {
    overflow-y: scroll;
    height: 100%;
}

.event-list {
    height: 100%;
}

.edit-event {
    margin-right: 0.2rem;
}

#selected-courses-header {
    padding: 10px 6px 10px 5px;
}

#addCustomEventIcon:hover {
    cursor: pointer;
}

#addCustomEventIcon, #conflictingEventIcon, #selected-courses-title {
    display: inline-block;
}

#selected-courses-title {
    padding-right: 3px;
}

.add-event-button-outline {
    margin-top: -2px;
    border-style: solid;
    border-color: rgba(44, 62, 80, 0.75);
    border-width: 1px;
    border-radius: 25px;
    padding: 1px 5px 1px 5px;
    cursor:pointer
}

#deselectCourse:hover {
    cursor: pointer;
}

#editCourse:hover {
    cursor: pointer;
}

#deleteCustomEvent:hover {
    cursor: pointer;
}

#editCustomEvent:hover {
    cursor: pointer;
}
</style>
