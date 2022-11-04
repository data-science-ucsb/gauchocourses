
import getters from '@/store/getters.js';

describe('Root Vuex getters', () => {

    describe('userIsAuthenticated', () => { 

        it('returns true if the state has the authenticated attribute', () => {
            const state = {
                user: {
                    authenticated: true
                }
            }

            const result = getters.userIsAuthenticated(state);
            expect(result).toBe(true);
        })

        it('returns false if the state does not have the authenticated attribute', () => {
            const states_to_test = [ 
                {
                    user: {}
                }, {
                    user: ''
                }, {
                    user: null
                } 
            ]
            
            const results = states_to_test.map(state => getters.userIsAuthenticated(state));
            results
                .forEach(result => expect(result).toBe(false))
        })

    })
})