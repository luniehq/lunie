<template>
  <div v-if="!session.cookiesAccepted">
    <Bar :show="show" :bar-type="'primary'">
      <span class="hide-on-mobile"
        >This site uses cookies to help improve your experience.</span
      >
      By using Lunie, you accept our
      <router-link to="/terms" class="link"> Terms of Service </router-link> and
      <router-link to="/privacy" class="link"> Privacy Policy </router-link>.
    </Bar>
  </div>
</template>

<script>
import { mapState } from "vuex"
import Bar from "common/Bar"
export default {
  name: `cookie-bar`,
  components: {
    Bar
  },
  data: () => ({
    show: true
  }),
  computed: {
    ...mapState([`session`])
  },
  watch: {
    show: function(val) {
      if (val === false) {
        this.$store.dispatch(`setAnalyticsCollection`, true)
        this.$store.dispatch(`setErrorCollection`, true)
        this.$store.dispatch(`storeLocalPreferences`)
      }
    }
  }
}
</script>
