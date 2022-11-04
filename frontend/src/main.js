import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import BootstrapVue from 'bootstrap-vue'
import VueAppInsights from 'vue-application-insights'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faInfoCircle, faEdit, faUndo,
  faFilter, faCalendarPlus, faTrashAlt, faPlusSquare,
  faExclamationCircle, faStar, faHeart, faThumbtack, faBorderAll, faColumns, faCalendar, faList, faChevronRight, faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import { getCookieValue, getSlotNameFromURL} from './components/util/util-methods.js'
import api from '@/components/backend-api.js';
import '@/plugins/Dayjs';
import VueDayjs from 'vue-dayjs-plugin'

// Configure font awesome
library.add(faInfoCircle, faUndo, faFilter, faCalendarPlus, faPlusSquare,
  faTrashAlt, faEdit, faExclamationCircle, faStar, faHeart, faThumbtack, faBorderAll, faColumns, faCalendar, faList, faChevronRight, faChevronDown, faCheck);

Vue.component('font-awesome-icon', FontAwesomeIcon);

// Configure Bootstrap-Vue
Vue.use(BootstrapVue, VueDayjs);

// Configure global event hub
Vue.prototype.$eventHub = new Vue();

// Configure application insights
Vue.use(VueAppInsights, {
  id: 'da2fab5d-c6fb-4688-8823-303dda0c7ad6',
  router
})

Vue.mixin({
  methods: {
    /**
     * Sends custom telemetry to Application Insights
     * @param {string} metric_name The name of the metric being tracked (eg: "num_schedules_generated", "")
     * @param {object} data an optional data object to send with the event. (eg: {count: 4})
     */
    trackMetric(event_name, data) {
      this.$appInsights.trackEvent({name: event_name}, data);
    }
  }
})

// Subscribe to mutations on the Vuex store and cache the store on the browser's local storage
store.subscribe((mutation, state) => localStorage.setItem('store', JSON.stringify({...state, 'user': undefined})));

// Turn off the annoying "production tip" log
Vue.config.productionTip = false;

// Root Vue Instance (https://vuejs.org/v2/guide/instance.html)
new Vue({
  router,
  store,
  render: h => h(App),
  beforeCreate() {
    this.$store.commit('initializeStore');
    this.$store.dispatch('setUserInfoAsync');

    var telemetryInitializer = (envelope) => {
      const slot = getCookieValue('x-ms-routing-name') || getSlotNameFromURL()  || 'local';

      if (slot == 'local') {
        return false;  // Do not send telemetry for local development.
      } else {
        envelope.tags["ai.cloud.role"] = "app-service-slot";
        envelope.data['slot'] = slot;
      }
    }
    this.$appInsights.addTelemetryInitializer(telemetryInitializer);
  },
  created() {
    api
      .getConfiguration()
      .then(resp => this.$store.commit('setClientConfiguration', resp.data))
      .catch(err => console.log(err));
  }
}).$mount('#app');
