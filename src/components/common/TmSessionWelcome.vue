<template>
  <div id="session-welcome" class="session">
    <SessionFrame>
      <template v-slot:image>
        <img class="lunie-logo" src="~assets/images/cosmos-wallet-logo.svg" />
      </template>
      <template v-slot:title>
        Welcome to Lunie!
      </template>
      <template v-slot:paragraph>
        Lunie is the cryptocurrency wallet for the new staking economy. Easily
        stake your ATOMs, withdraw your rewards, and participate in governance.
      </template>
    </SessionFrame>
    <div class="session-list">
      <LiSession
        id="creat-new-address"
        icon="person_add"
        title="Create a new address"
        @click.native="() => setState('sign-up')"
      />
      <LiSession
        id="use-an-existing-address"
        icon="person"
        title="Use an existing address"
        @click.native="() => setState('existing')"
      />
    </div>

    <p class="footnote">
      By using Lunie, you accept our
      <router-link to="/terms" class="link">Terms of Service</router-link> and
      <router-link to="/privacy" class="link">Privacy Policy</router-link>.
    </p>
  </div>
</template>

<script>
import LiSession from "common/TmLiSession"
import SessionFrame from "common/SessionFrame"

export default {
  name: `session-welcome`,
  components: {
    LiSession,
    SessionFrame
  },
  methods: {
    setState(value) {
      this.$emit(`route-change`, value)
    }
  }
}
</script>
<style scoped>
.lunie-logo {
  height: 4rem;
  margin-bottom: 1rem;
}
</style>
