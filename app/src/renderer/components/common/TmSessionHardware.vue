<template>
  <div class="tm-session">
    <div class="tm-session-container">
      <div class="tm-session-header">
        <a @click="setState('welcome')"
          ><i class="material-icons">arrow_back</i></a
        >
        <div class="tm-session-title">Sign In</div>
        <a @click="help"><i class="material-icons">help_outline</i></a>
      </div>
      <div class="tm-session-main">
        <hardware-state
          v-if="status == 'connect'"
          icon="usb"
          value="Please plug in your Ledger Wallet"
          @click.native="setStatus('detect')"
        />
        <hardware-state
          v-if="status == 'detect'"
          :spin="true"
          icon="rotate_right"
          value="Detecting your Ledger Wallet"
          @click.native="setStatus('success')"
        />
        <hardware-state
          v-if="status == 'success'"
          icon="check_circle"
          value="Ledger Wallet successfully loaded"
          @click.native="onSubmit"
        />
      </div>
      <div class="tm-session-footer" />
    </div>
  </div>
</template>

<script>
import HardwareState from "common/TmHardwareState"
export default {
  name: `tm-session-hardware`,
  components: { HardwareState },
  data: () => ({ status: `connect` }),
  methods: {
    help() {
      this.$store.commit(`setModalHelp`, true)
    },
    setState(value) {
      this.$store.commit(`setModalSessionState`, value)
    },
    setStatus(value) {
      this.status = value
    },
    onSubmit() {
      this.$store.commit(`setModalSession`, false)
      this.$store.commit(`notify`, {
        title: `Welcome back!`,
        body: `You are now signed in to your Cosmos account.`
      })
      this.$store.dispatch(`signIn`, { password: this.fields.signInPassword })
    }
  }
}
</script>
