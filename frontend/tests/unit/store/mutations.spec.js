import mutations from '@/store/mutations.js';
import {userAttributes} from '../../testing-objects';
import { axios_instance } from '@/components/backend-api.js';
import flushPromises from "flush-promises";
const MockAdapter = require("axios-mock-adapter");


describe('Root Vuex mutations', () => {

    describe('setUserInfo', () => {
        let mock;
        let state;
        const api_path = '/api/user/'

        beforeEach(() => {
            mock = new MockAdapter(axios_instance);
            state = {
                user: {}
            };
        });

        it('sets user info if API response has user principal', async () => {
            mock
                .onGet(api_path)
                .reply(200, userAttributes);

            mutations.setUserInfo(state);
            await flushPromises();

            expect(state.user).toHaveProperty('principal')
        })

        it('does not set user info if API response is empty', async () => {
            mock
                .onGet(api_path)
                .reply(200, '');

            mutations.setUserInfo(state);
            await flushPromises();

            expect(state.user).toMatchObject({})
        })

        it('does not set user info if there is a 500-level error', async () => {
            mock
                .onGet(api_path)
                .reply(500, '');

            mutations.setUserInfo(state);
            await flushPromises();

            expect(state.user).toMatchObject({})
        })

    })

    

})