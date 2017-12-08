<template lang="pug">
.ni-session: .ni-session-container
  .ni-session-header
    a(@click="setState('welcome')"): i.material-icons arrow_back
    .ni-session-title Sign In
    a(@click="help"): i.material-icons help_outline
  .ni-session-main
    hardware-state(v-if="status == 'connect'" @click.native="setStatus('detect')"
      icon="usb" value="Please plug in your Ledger Wallet")
    hardware-state(v-if="status == 'detect'" @click.native="setStatus('success')"
      icon="rotate_right" spin="true" value="Detecting your Ledger Wallet")
    hardware-state(v-if="status == 'success'" @click.native="onSubmit"
      icon="check_circle" value="Ledger Wallet successfully loaded")
  .ni-session-footer
</template>

<script>
import HardwareState from 'common/NiHardwareState'
export default {
  name: 'ni-session-hardware',
  components: {
    HardwareState
  },
  data: () => ({
    status: 'connect'
  }),
  methods: {
    help () { this.$store.commit('setModalHelp', true) },
    setState (value) { this.$store.commit('setModalSessionState', value) },
    setStatus (value) { this.status = value },
    onSubmit () {
      this.$store.commit('setModalSession', false)
      this.$store.commit('notify', { title: 'Welcome back!', body: 'You are now signed in to your Cosmos account.' })
      this.$store.commit('signIn', {password: this.fields.signInPassword})
    }
  }
}
</script>
