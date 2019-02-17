<template>
  <div id="session-welcome" class="tm-session">
    <div class="tm-session-container">
      <div class="tm-session-header">
        <a @click="help"><i class="material-icons">help_outline</i></a>
        <div class="tm-session-title">Sign in to Cosmos Voyager</div>
        <a @click="closeSession"><i class="material-icons">close</i></a>
      </div>
      <div class="tm-session-main">
        <li-session
          v-if="accountExists"
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
        <li-session
          icon="usb"
          title="Sign in with hardware"
          subtitle="If you have a Ledger Wallet, choose this option."
          @click.native="setState('hardware')"
        />
        <fundraiser-warning />
      </div>
      <div class="tm-session-footer" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import PerfectScrollbar from "perfect-scrollbar"
import FundraiserWarning from "common/FundraiserWarning"
import LiSession from "common/TmLiSession"
export default {
  name: `tm-session-welcome`,
  components: {
    FundraiserWarning,
    LiSession
  },
  computed: {
    ...mapGetters([`config`, `lastPage`, `user`]),
    accountExists() {
      return this.user.accounts.length > 0
    }
  },
  mounted() {
    new PerfectScrollbar(this.$el.querySelector(`.tm-session-main`))
  },
  methods: {
    help() {
      this.$store.commit(`setModalHelp`, true)
    },
    setState(value) {
      this.$store.commit(`setModalSessionState`, value)
    },
    closeSession() {
      this.$store.commit(`setModalSession`, false)
      this.$store.commit(`setModalSessionState`, false)
      if (
        [
          `/staking/my-delegations`,
          `/wallet`,
          `/transactions`,
          `/preferences`
        ].includes(this.$router.currentRoute.path)
      ) {
        // go back only if tried to access one of the auth-required routes
        this.back()
      }
    },
    back() {
      if (!this.lastPage) return
      this.$store.commit(`pauseHistory`, true)
      this.$router.push(this.lastPage, () => {
        this.$store.commit(`popHistory`)
        this.$store.commit(`pauseHistory`, false)
      })
    }
  }
}
</script>
