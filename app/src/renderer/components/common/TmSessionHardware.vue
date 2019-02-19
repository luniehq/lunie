<template>
  <div class="tm-session">
    <div class="tm-session-container">
      <div class="tm-session-header">
        <a @click="setState('welcome')">
          <i class="material-icons">arrow_back</i>
        </a>
        <div class="tm-session-title">Sign In</div>
        <a @click="help"> <i class="material-icons">help_outline</i> </a>
      </div>
      <div class="tm-session-main">
        <hardware-state
          v-if="status == 'connect'"
          icon="usb"
          value="Please plug in your Ledger Nano S and open the Cosmos app"
          @click.native="connectLedger()"
        />
        <hardware-state
          v-if="status == 'detect'"
          :spin="true"
          icon="rotate_right"
          value="Connecting..."
          @click.native="setStatus('connect')"
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
      this.$store.commit(`setSignInModalState`, value)
    },
    setStatus(value) {
      this.status = value
    },
    async connectLedger() {
      this.setStatus(`detect`)
      const connected = await this.$store.dispatch(`connectLedgerApp`)
      if (connected) {
        this.$store.commit(`notify`, {
          title: `Connection succesful`,
          body: `You are now signed in to your Cosmos account with your Ledger.`
        })
      } else {
        this.setStatus(`connect`)
      }
    }
  }
}
</script>
