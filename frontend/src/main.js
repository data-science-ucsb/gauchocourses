import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import BootstrapVue from 'bootstrap-vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faInfoCircle, faEdit, faUndo,
  faFilter, faCalendarPlus, faTrashAlt, faPlusSquare,
  faExclamationCircle, faStar, faHeart, faThumbtack, faBorderAll, faColumns, faCalendar, faList, faChevronRight, faChevronDown, faCheck, faPencilAlt, faChevronUp} from '@fortawesome/free-solid-svg-icons'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import '@/plugins/Dayjs';
import VueDayjs from 'vue-dayjs-plugin'
import Verte from 'verte';
import 'verte/dist/verte.css';

// Configure font awesome
library.add(faInfoCircle, faUndo, faFilter, faCalendarPlus, faPlusSquare, faTrashAlt, faEdit, faExclamationCircle, faStar, faHeart, faThumbtack, faBorderAll, faColumns, faCalendar, faList, faChevronRight, faChevronDown, faCheck, faPencilAlt, faChevronUp);

Vue.component('font-awesome-icon', FontAwesomeIcon);

// Configure Bootstrap-Vue
Vue.use(BootstrapVue, VueDayjs);

Vue.component(Verte.name, Verte);

// Configure global event hub
Vue.prototype.$eventHub = new Vue();

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
  }
}).$mount('#app');