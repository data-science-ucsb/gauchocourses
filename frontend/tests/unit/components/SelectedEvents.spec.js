import { createLocalVue, mount } from '@vue/test-utils';
import SelectedEvents from '@/components/events/SelectedEvents.vue';
import BootstrapVue from 'bootstrap-vue';
import { customEvent, courses } from '../../testing-objects';
import Vuex from "vuex"
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import "jest-canvas-mock";

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(Vuex);
localVue.component('font-awesome-icon', FontAwesomeIcon);

const factory = (state, getters) => {
    return mount(SelectedEvents, {
        localVue,
        mocks: {
            $store: {
              state: state,
              getters: getters,
              commit: jest.fn()
            },
            $eventHub: {
                $on: jest.fn(),
                $off: jest.fn(),
                $emit: jest.fn(),
            }
        }
    })
}

describe('SelectedEvents.vue', () => {

    describe('when there are no custom events or courses in the store', () => {
        const noEvents = {
            selectedCourses: [],
            selectedCustomEvents: []
        };

        const getters = {
            selectedClassSections: []
        }

        it('it renders placeholder text', () => {
            const wrapper = factory(noEvents, getters);
            expect(wrapper.find('.no-events-placeholder').exists()).toBe(true);
        });
    });

    describe('when the store has custom events and courses', () => {
        const events = {
            selectedCourses: courses,
            selectedCustomEvents: [customEvent]
        }

        const getters = {
            selectedClassSections: events.selectedCourses.flatMap(c => c.classSections)
        }

        const wrapper = factory(events, getters);

        it('the events are rendered with their names', () => {
            const courses = wrapper.findAll('.selected-course');
            expect(courses.length).toBe(2);
            expect(courses.at(0).find('.event-name').text().substring(0,7)).toBe('DUM 200')
        });

        it('the courses are rendered with their titles', () => {
            const customEvents = wrapper.findAll('.custom-event');
            expect(customEvents.length).toBe(1);
            expect(customEvents.at(0).find('.event-name').text()).toBe('testEvent');
        });
    });

    describe('when a user clicks the button to remove a custom event or course', () => {
        const events = {
            selectedCourses: courses,
            selectedCustomEvents: [customEvent]
        }

        const getters = {
            selectedClassSections: events.selectedCourses.flatMap(c => c.classSections)
        }

        const wrapper = factory(events, getters);

        it('commits a mutation to remove the custom event', () => {
            wrapper.find('.custom-event').find('.remove-event').trigger('click');
            //expect(wrapper.mocks.$store.commit).toHaveBeenCalled();
        });

        it('commits a mutation to remove the course', () => {

        });
    });

    describe('when a user clicks the button to edit a course or custom event', () => {
        it('emits an event to edit the custom event', () => {

        });

        it('emits an event to edit the course', () => {

        });
    });

    describe('when a user clicks the button to create a custom event', () => {
        it('emits an event to create a custom event', () => {

        });
    });
})
