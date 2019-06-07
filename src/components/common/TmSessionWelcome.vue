<template>
  <div id="session-welcome" class="session">
    <a @click="closeSession">
      <i class="material-icons session-close">close</i>
    </a>
    <div class="session-header">
      <img class="lunie-logo" src="~assets/images/cosmos-wallet-logo.svg" />
      <h2 class="session-title">
        Welcome to Lunie!
      </h2>
      <p class="session-paragraph">
        Lunie is the cryptocurrency wallet for the new staking economy. Easily
        stake your ATOMs, withdraw your rewards, and participate in governance.
      </p>
    </div>

    <div class="session-list">
      <LiSession
        icon="person_add"
        title="Create a new address"
        @click.native="() => setState('sign-up')"
      />
      <LiSession
        icon="person"
        title="Use an existing address"
        @click.native="() => setState('existing')"
      />
    </div>
    <!-- <template>
      <div class="danger-zone">
        <div class="header">
          <h2>DANGER ZONE</h2>
          <p>
            Creating an address or entering a seed in the browser is considered
            extremely unsafe. These features are only enabled in insecure mode
            for testing purposes and should not be used on mainnet or with real
            tokens.
          </p>
        </div>
      </div>
    </template> -->
    <p class="footnote">
      By using Lunie, you accept our
      <router-link to="/terms" class="link">Terms of Service</router-link> and
      <router-link to="/privacy" class="link">Privacy Policy</router-link>.
    </p>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import LiSession from "common/TmLiSession"
export default {
  name: `session-welcome`,
  components: {
    LiSession
  },
  computed: {
    ...mapGetters([`session`]),
    accountExists() {
      return this.session.accounts.length > 0
    }
  },
  methods: {
    setState(value) {
      this.$store.commit(`setSessionModalView`, value)
    },
    closeSession() {
      this.$store.commit(`toggleSessionModal`, false)
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
