<template>
  <div id="app">
    <!-- Start navbar -->
    <div id="Header">
      <b-navbar toggleable="lg" class="navbar bd-navbar" type="dark" :style="{'background-color': $store.state.configuration.PRIMARY_COLOR}">
        <b-navbar-brand to='/'>
          {{$store.state.configuration.SITE_NAME}}
        </b-navbar-brand>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav>
            <b-nav-item id="homebutton" to='/'>Home</b-nav-item>
            <b-nav-item to="/about">About</b-nav-item>
          </b-navbar-nav>

          <!-- Right aligned nav items -->
          <b-navbar-nav class="ml-auto">
            <!-- If user is signed in, this navbar tab says My Schedules, else Sign In-->
            <div v-if="$store.getters.userIsAuthenticated">
              <b-nav-item right to="/user">My Schedules</b-nav-item>
            </div>
            <div v-else>
              <b-nav-item right to="/user">Sign In</b-nav-item>
            </div>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
    </div>
    <!-- End navbar -->

    <div id="page-container">
      <!-- Start current router view -->
      <div id="content-wrap">
        <router-view />
        <!-- End current router view -->
      </div>

      <br />

      <!-- Start footer -->
      <footer id="footer">
        <div id="footerdiv" class="container-fluid pt-4">
          <b-row class="justify-content-center">
            <b-col class="text-center">
              <p>
                <a class="footer-text" href="#/about">About</a>
              </p>
            </b-col>
            <b-col class="text-center">
              <p>
                <a class="footer-text" href="https://github.com/crunch-time">GitHub</a>
              </p>
            </b-col>
            <b-col class="text-center">
              <p>
                <a class="footer-text" href="#/user">My Profile</a>
              </p>
            </b-col>
          </b-row>

          <b-row id="Advertisement">
            <b-col class="text-center">
              <small class="footer-text">GauchoCourses is an open-source app which is maintained and hosted by <a class="footer-text" href="https://www.datascienceucsb.org/">Data Science UCSB</a>.</small>
            </b-col>
          </b-row>

          <b-row id="Copyright">
            <b-col class="text-center">
              <small class="footer-text">Copyright {{year}} <a class="footer-text" href="https://github.com/data-science-ucsb/gauchocourses" target="blank">GauchoCourses</a></small>
            </b-col>
          </b-row>
        </div>
      </footer>
      <!-- End footer -->
    </div>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      year: ""
    };
  },
  created: function() {
    var d = new Date();
    this.year = d.getFullYear();
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

#page-container {
  position: relative;
  min-height: 100vh;
}

#content-wrap {
  padding-bottom: 2.5rem; /* Footer height */
}

#footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 2.5rem; /* Footer height */
}

#footerdiv {
  background-color: #828282;
}

.footer-text {
  color: #ffffff;
}
</style>
