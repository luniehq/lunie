<template>
  <SessionFrame>
    <div id="session-welcome">
      <router-link to="/">
        <img
          class="session-logo-mobile"
          src="~assets/images/lunie-logo-white.svg"
          alt="a small spinning circle to display loading"
        />
      </router-link>

      <h2 class="session-title">
        Welcome to Lunie
      </h2>

      <p class="session-paragraph">
        The easiest way to send, stake, and vote on the Cosmos Hub.
      </p>

      <div class="session-list">
        <LiSession
          id="creat-new-address"
          icon="person_add"
          title="Create a new address"
          route="create"
        />
        <LiSession
          id="use-an-existing-address"
          icon="person"
          title="Use an existing address"
          route="existing"
        />
      </div>

      <p class="footnote">
        By using Lunie, you accept our
        <router-link to="/terms" class="link">
          Terms of Service
        </router-link>
        and
        <router-link to="/privacy" class="link"> Privacy Policy </router-link>.
      </p>
    </div>
  </SessionFrame>
</template>

<script>
import SessionFrame from "common/SessionFrame.vue"
import LiSession from "common/TmLiSession"
export default {
  name: `session-welcome`,
  components: {
    SessionFrame,
    LiSession
  }
}
</script>
