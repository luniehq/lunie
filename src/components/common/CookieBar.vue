<template>
  <div v-if="!session.cookiesAccepted" class="cookie-bar">
    <i></i>
    <p>
      This site uses cookies to provide you with a great user experience. By
      using Lunie, you accept our
      <a class="link" href="/privacy-policy">privacy policy</a>.
    </p>
    <a class="close">
      <i class="material-icons" @click="accept">close</i>
    </a>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
export default {
  name: `cookie-bar`,
  computed: {
    ...mapGetters([`session`])
  },
  methods: {
    accept() {
      this.$store.dispatch(`setAnalyticsCollection`, true)
      this.$store.dispatch(`setErrorCollection`, true)
      this.$store.dispatch(`storeLocalPreferences`)
      this.$forceUpdate();
    }
  }
}
</script>

<style scoped>
.cookie-bar {
  left: 0;
  right: 0;
  top: 0;
  width: 100%;
  padding: 1rem;
  font-family: var(--sans);
  background-color: var(--link-dark);
  font-size: 14px;
  font-weight: 400;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--bright);
}

.cookie-bar .link {
  text-decoration: underline;
  color: var(--bright);
}

.cookie-bar .close {
  cursor: pointer;
  height: 1rem;
  width: 1rem;
  color: var(--bright);
}

@media (max-width: 767px) {
  .cookie-bar {
    left: 0;
    border-radius: 0;
    max-width: 100%;
  }
}
</style>
