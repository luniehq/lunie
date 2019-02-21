<template>
  <div class="tm-session">
    <div class="tm-session-container">
      <div class="tm-session-header">
        <a @click="setState('welcome')">
          <i class="material-icons">arrow_back</i>
        </a>
        <div class="tm-session-title">
          Sign In
        </div>
        <a @click="help">
          <i class="material-icons">help_outline</i>
        </a>
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
          :loading="true"
          value="Connecting..."
          @click.native="setStatus('connect')"
        />
        <p class="ledger-install">
          Don't have the Cøsmos Ledger App yet? Install it
          <a
            href="https://github.com/cosmos/voyager#ledger-cosmos-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>.
        </p>
      </div>
      <div class="tm-session-footer">
        <p v-if="connectionError" class="tm-form-msg sm tm-form-msg--error">
          {{ connectionError }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import HardwareState from "common/TmHardwareState"
export default {
  name: `tm-session-hardware`,
  components: { HardwareState },
  data: () => ({
    status: `connect`,
    connectionError: null
  }),
  methods: {
    help() {
      this.$store.commit(`setModalHelp`, true)
    },
    setState(value) {
      this.$store.commit(`setSessionModalView`, value)
    },
    setStatus(value) {
      this.status = value
    },
    setConnectionError(error) {
      this.connectionError = error
    },
    async connectLedger() {
      this.setConnectionError(null)
      this.setStatus(`detect`)
      try {
        await this.$store.dispatch(`connectLedgerApp`)
      } catch (error) {
        this.setStatus(`connect`)
        this.setConnectionError(error.message)
      }
    }
  }
}
</script>
<style>
.ledger-install {
  text-align: center;
}
</style>
