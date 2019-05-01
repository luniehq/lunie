<template>
  <div v-if="!session.cookiesAccepted" class="cookieBar">
    <a class="close">
      <i class="material-icons" @click="accept">close</i>
    </a>
    Lunie uses cookies and remote error collection to improve the app.
    By dismissing this notification, you consent to this policy.
    <a href="/privacy-policy">Click to learn more.</a>
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
    }
  }
}
</script>

<style scoped>
.cookieBar {
  position: fixed;
  left: 39px;
  bottom: 0;
  z-index: 1000;
  max-width: 225px;
  padding: 17px 31px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  background-color: var(--app-fg);
  box-shadow: 0 -2px 6px 0 var(--app-bg);
  font-size: 13px;
  line-height: 20px;
}

.cookieBar .close {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  width: 44px;
  height: 44px;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

@media (max-width: 767px) {
  .cookieBar {
    left: 0;
    border-radius: 0;
    max-width: 100%;
  }
}
</style>
