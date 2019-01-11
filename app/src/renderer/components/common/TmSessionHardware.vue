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
          @click.native="connectLedger()"
        />
        <hardware-state
          v-if="status == 'detect'"
          :spin="true"
          icon="rotate_right"
          value="Detecting your Ledger Wallet"
          @click.native="setStatus('connect')"
        />
        <hardware-state
          v-if="status == 'success'"
          icon="check_circle"
          value="Ledger Wallet successfully loaded"
          @click.native="onLedgerConnected"
        />
      </div>
      <div class="tm-session-footer" />
    </div>
  </div>
</template>

<script>
import HardwareState from "common/TmHardwareState"
import { App, comm_u2f, comm_node } from "ledger-cosmos-js"
import { createCosmosAddress } from "../../scripts/wallet.js"

const TIMEOUT = 2

export default {
  name: `tm-session-hardware`,
  components: { HardwareState },
  data: () => ({
    status: `connect`,
    address: ``
  }),
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
    setAddress(address) {
      this.address = address
    },
    async connectLedger() {
      this.setStatus(`detect`)
      console.log(`Connecting Ledger...`)
      const hdPath = [44, 118, 0, 0, 0]
      try {
        let comm = await comm_u2f.create_async(TIMEOUT, true)
        let app = new App(comm)
        let version = await app.get_version()
        let pubKey = await app.publicKey(hdPath)
        console.log(
          `Ledger Version: v${version.major}.${version.minor}.${version.patch} `
        )
        console.log(pubKey.pk)
        let address = createCosmosAddress(pubKey.pk)
        this.setAddress(address)
        this.setStatus(`success`)
      } catch (error) {
        console.error(error)
      }
    },
    onLedgerConnected() {
      this.$store.dispatch(`signInLedger`, { address: this.address })
      this.$store.commit(`notify`, {
        title: `Welcome back!`,
        body: `You are now signed in to your Cosmos account with your Ledger.`
      })
    }
  }
}
</script>
