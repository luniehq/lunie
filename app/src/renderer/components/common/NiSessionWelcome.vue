<template lang="pug">
.ni-session: .ni-session-container
  .ni-session-header
    a &nbsp;
    .ni-session-title Welcome to Cosmos Voyager
    a(@click="help"): i.material-icons help_outline
  .ni-session-main
    li-session(
      v-if="accountExists"
      @click.native="setState('sign-in')"
      icon="lock"
      title="Sign in with password"
      subtitle="If you have an account, choose this option.")
    li-session(
      @click.native="setState('sign-up')"
      icon="create"
      title="Create new account"
      subtitle="Generate a brand new seed and create a new account.")
    li-session(
      v-if="config.devMode"
      @click.native="setState('import')"
      icon="settings_backup_restore"
      title="Import with seed"
      subtitle="Use an existing seed phrase to create an account.")
    li-session(
      v-if="config.devMode"
      @click.native="setState('hardware')"
      icon="usb"
      title="Sign in with hardware"
      subtitle="If you have a Ledger Wallet, choose this option.")
    fundraiser-warning
  .ni-session-footer
</template>

<script>
import { mapGetters } from 'vuex'
import FundraiserWarning from 'common/FundraiserWarning'
import ListItem from 'common/NiListItem'
import LiSession from 'common/NiLiSession'
export default {
  name: 'ni-session-welcome',
  components: {
    FundraiserWarning,
    ListItem,
    LiSession
  },
  computed: {
    ...mapGetters(['config', 'user']),
    accountExists () {
      return this.user.accounts.length > 0
    }
  },
  methods: {
    help () {
      this.$store.commit('setModalHelp', true)
    },
    setState (value) {
      this.$store.commit('setModalSessionState', value)
    }
  }
}
</script>
