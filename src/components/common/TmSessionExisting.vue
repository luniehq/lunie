<template>
  <div id="session-existing" class="session">
    <div class="session-header">
      <a @click="goToWelcome()">
        <i class="material-icons session-back">arrow_back</i>
      </a>
      <h2 class="session-title">
        Use an existing address
      </h2>
      <a @click="$store.commit(`toggleSessionModal`, false)">
        <i class="material-icons session-close">close</i>
      </a>
    </div>

    <div class="session-list">
      <LiSession
        id="explore-with-address"
        icon="language"
        title="Explore with any address"
        @click.native="() => setState('explore')"
      />
      <LiSession
        id="use-ledger-nano"
        icon="vpn_key"
        title="Use Ledger Nano"
        @click.native="() => setState('hardware')"
      />
      <LiSession
        v-if="session.insecureMode"
        id="recover-with-backup"
        icon="settings_backup_restore"
        title="Recover with backup code"
        @click.native="() => setState('import')"
      />
      <LiSession
        v-if="accountExists && session.insecureMode"
        id="sign-in-with-account"
        icon="lock"
        title="Sign in with account"
        @click.native="setState('sign-in')"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import LiSession from "common/TmLiSession"
export default {
  name: `session-existing`,
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
    goToWelcome() {
      this.$store.commit(`setSessionModalView`, `welcome`)
    }
  }
}
</script>
<style>
.form-group a {
  cursor: pointer;
}
</style>
