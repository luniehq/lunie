<template>
  <SessionFrame>
    <div id="session-welcome" class="session">
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
        <router-link to="/terms" class="link">Terms of Service</router-link> and
        <router-link to="/privacy" class="link">Privacy Policy</router-link>.
      </p>
    </div>
  </SessionFrame>
</template>

<script>
import SessionFrame from "common/SessionFrame"
import LiSession from "common/TmLiSession"
export default {
  name: `session-welcome`,
  components: {
    SessionFrame,
    LiSession
  }
}
</script>
<style scoped>
.session-title {
  padding-left: 1rem;
}

.lunie-logo {
  height: 4rem;
  margin: 0 0 1rem 1rem;
  align-self: flex-start;
}

.session-paragraph {
  padding: 0 1rem;
}
</style>
