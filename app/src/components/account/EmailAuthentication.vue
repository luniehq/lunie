<template>
  <SessionFrame hide-back>
    <template v-if="account.signInError || account.signInEmailError">
      <h2 class="session-title">Magic link error! 🙀</h2>
      <div class="session-main">
        <p class="session-subtitle">{{ account.signInError.message }}</p>
        <router-link to="sign-up-email">
          <TmBtn value="Try again" centered />
        </router-link>
      </div>
    </template>

    <template v-else>
      <h2 class="session-title">Magic link success! 👍</h2>
      <div class="session-main">
        <p class="session-subtitle">
          You're now signed in to Lunie with your email address. Head over to
          the notifications page to see some recent events.
        </p>
        <router-link to="notifications">
          <TmBtn value="Let's Go!" centered />
        </router-link>
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
}
</script>
