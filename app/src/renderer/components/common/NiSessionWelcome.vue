<template lang="pug">
.ni-session: .ni-session-container
  .ni-session-header
    a &nbsp;
    .ni-session-title Welcome to Cosmos!
    a(@click="help"): i.material-icons help_outline
  .ni-session-main
    template(v-if="accountExists")
      li-session(
        @click.native="setState('sign-in')"
        icon="lock"
        title="Sign in with password"
        subtitle="If you have an account, choose this option")
      li-session(
        @click.native="setState('delete')"
        icon="delete_forever"
        title="Remove account"
        subtitle="If you have want to login to a new account, choose this option")
    template(v-else)
      li-session(
        @click.native="setState('sign-up')"
        icon="create"
        title="Create new account"
        subtitle="Generate a brand new seed and account")
      li-session(
        @click.native="setState('restore')"
        icon="settings_backup_restore"
        title="Restore account from seed"
        subtitle="If you have a seed, choose this option")
      li-session(
        v-if="config.devMode"
        @click.native="setState('hardware')"
        icon="usb"
        title="Sign in with hardware"
        subtitle="If you have a Ledger Wallet, choose this option")
  .ni-session-footer
</template>

<script>
import {mapGetters} from 'vuex'
import ListItem from 'common/NiListItem'
import LiSession from 'common/NiLiSession'
export default {
  name: 'ni-session-welcome',
  components: {
    ListItem,
    LiSession
  },
  computed: {
    ...mapGetters(['config'])
  },
  methods: {
    help () { this.$store.commit('setModalHelp', true) },
    setState (value) { this.$store.commit('setModalSessionState', value) }
  },
  data: () => ({
    accountExists: false
  }),
  async mounted () {
    this.accountExists = !!(await this.$store.dispatch('accountExists'))
  }
}
</script>
