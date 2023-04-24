import { createLocalVue, mount } from '@vue/test-utils';
import UserProfile from '@/views/UserProfile.vue';
import BootstrapVue from 'bootstrap-vue';
import { axios_instance } from '@/components/backend-api.js';
import { schedules, userAttributes, quarters} from '../../testing-objects';
import { RouterLinkStub } from '@vue/test-utils';
const MockAdapter = require("axios-mock-adapter");

// Register BootstrapVue for testing
const localVue = createLocalVue();
localVue.use(BootstrapVue);

// Return a mounted PaginatedSchedule with given parameters
const factory = (values = {}) => {
    return mount(UserProfile, {
        localVue,
        stubs: {
            RouterLink: RouterLinkStub
        },
        propsData: {
            ...values
        }
    })
}

/**
 * Mocking axios API responses: https://codesandbox.io/s/xpp40qnl3o?from-embed
 */
describe('UserProfile', () => {
    let mock;

    beforeEach(() => {
        mock = new MockAdapter(axios_instance);
    });

    afterAll(() => {
        mock.restore();
    });

    describe('when created', () => {

        describe("gets the user's schedules for all quarters", () => {
            beforeEach(() => {

            })

            it('and renders the schedules if they exist', async () => {
                mock
                    .onGet('/user/')
                    .reply(200, userAttributes);
                mock
                    .onGet('/quarter/**')
                    .reply(200, quarters);
                mock
                    .onGet('/schedules/?userEmail='+userAttributes.email)
                    .reply(200, schedules);

                // const wrapper = factory();
                // await flushPromises();

                //expect(wrapper.find('#scheduleTable').find('tbody').findAll('tr').length).toBe(4);
            });

            it('and shows placeholder text if none exist', () => {
                // TODO
            });

        });

        it('loads the quarter selector with all quarters', async () => {
            mock
                .onGet('/user/')
                .reply(200, userAttributes);
            mock
                .onGet('/quarter/**')
                .reply(200, quarters);
            mock
                .onGet('/schedules/?userEmail='+userAttributes.email)
                .reply(200, schedules);

            // const wrapper = factory();
            // await flushPromises();

            //expect(wrapper.find('#quarterSelector').findAll('option').length).toBe(2);
        });

    });

    describe('when user selects a specific quarter', () => {
        it('the schedules are filtered to that quarter', async () => {
            mock
                .onGet('/user/')
                .reply(200, userAttributes);
            mock
                .onGet('/quarters/')
                .reply(200, quarters);
            mock
                .onGet('/schedules/?userEmail='+userAttributes.email)
                .reply(200, schedules);

            // let wrapper = factory();
            // await flushPromises();

            // const numRenderedSchedules = () => wrapper.find('#scheduleTable').find('tbody').findAll('tr').length;

            // //expect(numRenderedSchedules()).toBe(4);
            // wrapper.vm.selectedQuarter = quarters[1].id;
            // //expect(numRenderedSchedules()).toBe(0);
        });
    })

    describe('when user edits a schedule', () => {
        it('they are forwarded to Home with the given schedule', async () => {
            mock
                .onGet('/user/')
                .reply(200, userAttributes);
            mock
                .onGet('/quarters/')
                .reply(200, quarters);
            mock
                .onGet('/schedules/?userEmail='+userAttributes.email)
                .reply(200, schedules);

            // TODO: No idea how to test this...
        });
    })

    describe('when user successfully deletes a schedule', () => {
        it('a request is sent to the back-end to delete it', () => {
            mock
                .onGet('/user/')
                .reply(200, userAttributes);
            mock
                .onGet('/quarters/')
                .reply(200, quarters);
            mock
                .onGet('/schedules/?userEmail='+userAttributes.email)
                .reply(200, schedules);

        });

        it('the schedule is removed from the current list', () => {

        });
    })
})
