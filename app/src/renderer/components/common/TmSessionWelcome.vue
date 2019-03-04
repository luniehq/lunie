<template>
  <div id="session-welcome" class="tm-session">
    <div class="tm-session-container">
      <div class="tm-session-header">
        <div class="tm-session-title">
          Sign in to Cosmos Voyager
        </div>
        <a @click="closeSession">
          <i class="material-icons">close</i>
        </a>
      </div>

      <div class="tm-session-main">
        <li-session
          icon="usb"
          title="Sign in with Ledger Nano S"
          subtitle="If you have a Ledger Wallet, choose this option."
          @click.native="setState('hardware')"
        />
        <template
          v-if="session.insecureMode"
        >
          <li-session
            v-if="accountExists"
            id="sign-in-with-account"
            icon="lock"
            title="Sign in with password"
            subtitle="If you have an account, choose this option."
            @click.native="setState('sign-in')"
          />
          <li-session
            icon="person_add"
            title="Create new account"
            subtitle="Generate a brand new seed and create a new account."
            @click.native="setState('sign-up')"
          />
          <li-session
            icon="settings_backup_restore"
            title="Import with seed"
            subtitle="Use an existing seed phrase to create an account."
            @click.native="setState('import')"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import LiSession from "common/TmLiSession"
export default {
  name: `tm-session-welcome`,
  components: {
    LiSession
  },
  computed: {
    ...mapGetters([`session`, `lastPage`]),
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
    },
  }
}
</script>
