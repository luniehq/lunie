<template>
  <SessionFrame hide-back>
    <h2 class="session-title">
      Magic link success!
    </h2>
    <div class="session-main">
      <p class="session-subtitle">
        You're now signed in to Lunie with your email address. Head over to the
        notifications page to see some of your recent events.
      </p>
      <TmBtn value="Let's Go!" centered @click.native="goToNotifications" />
    </div>

    <template v-if="account.signInError || account.signInEmailError">
      <h2 class="session-title">Magic link error! 🙀</h2>
      <div class="session-main">
        <p class="session-subtitle">{{ account.signInError.message }}</p>
      </div>
    </template>
  </SessionFrame>
</template>

<script>
import SessionFrame from "common/SessionFrame"
import TmBtn from "common/TmBtn"
import { mapState } from "vuex"
export default {
  name: `email-authentication`,
  components: {
    SessionFrame,
    TmBtn,
  },
  computed: {
    ...mapState([`account`]),
  },
  mounted() {
    this.$store.dispatch(`signInUser`, window.location.href)
  },
  methods: {
    goToNotifications() {
      this.$router.push({ name: "notifications" }).catch((err) => {})
    },
  },
}
</script>
