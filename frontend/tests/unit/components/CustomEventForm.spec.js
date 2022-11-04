import { createLocalVue, mount } from '@vue/test-utils';
import CustomEventForm from '@/components/events/CustomEventForm.vue';
import BootstrapVue from 'bootstrap-vue';
import { axios_instance } from '@/components/backend-api.js';
import { customEvent } from '../../testing-objects';
import flushPromises from "flush-promises";
const MockAdapter = require("axios-mock-adapter");
//Import State testing stuff

// Register BootstrapVue for testing
const localVue = createLocalVue();
localVue.use(BootstrapVue);

// Return a mounted PaginatedSchedule with given parameters
const factory = (values = {}) => {
    return mount(CustomEventForm, {
        localVue,
        propsData: {
            eventtoedit: customEvent
        }
    })
}

describe('CustomEventForm', () => {

  describe('when the user selects an event to edit', () => {
      it('it gets loaded into the component data', () => {

      });
    });

    describe('a new custom event is saved', () => {
        it('it gets added to the store', () => {

        });
      });

      describe('an input state is changed', () => {
          it('the validation states are correct', () => {

          });
        });
})
