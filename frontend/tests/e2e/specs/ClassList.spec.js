import { createLocalVue, mount } from '@vue/test-utils';
import ClassList from '@/components/events/ClassList.vue';
import BootstrapVue from 'bootstrap-vue';
import { axios_instance } from '@/components/backend-api.js';
import { courses, quarters } from '../../testing-objects';
import flushPromises from "flush-promises";
const MockAdapter = require("axios-mock-adapter");

// Register BootstrapVue for testing
const localVue = createLocalVue();
localVue.use(BootstrapVue);

// Return a mounted PaginatedSchedule with given parameters
const factory = (values = {}) => {
    return mount(ClassList, {
        localVue,
        propsData: values
    }) 
}


describe('ClassList', () => {
    let mock;

    beforeEach(() => {
        mock = new MockAdapter(axios_instance);
    });

    afterAll(() => {
        //mock.restore();
    });

    describe('when created without a course prop', () => {
        var wrapper = factory();

        it('displays placeholder text', () => {
          expect(wrapper.find('#placeholder').exists()).toBe(true);
        })
    })

    describe('when created with a course prop', () => {
        var wrapper = factory({
            course: courses[0]
        });

        it('lists all the class sections', () => {
            expect(wrapper.findAll('tr').length).toBe(3);
        })

        it('adds the course to the list of courses', () => {
            
        })

        it('selects all class sections by default', () => {
            expect(wrapper.vm.classesChosen).toBe([true, true]);
        })
    })

    describe('when the user adds the classes', () => {
        
        it('the list of classSections is updated accordingly', () => {
           
        })
    });

    
})