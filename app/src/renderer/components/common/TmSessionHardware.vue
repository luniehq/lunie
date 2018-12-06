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
          icon="rotate_right"
          :spin="true"
          value="Detecting your Ledger Wallet"
          @click.native="setStatus('connect')"
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
import { App, comm_u2f, comm_node } from "ledger-cosmos-js"

const TIMEOUT = 2

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
    async connectLedger() {
      this.setStatus(`detect`)
      try {
        let comm = await comm_u2f
          .create_async(TIMEOUT, true)
          .then(function(comm) {
            let app = new App(comm)
            console.log(app)
            return app
              .get_version()
              .then(function(result) {
                response = result
                console.log(response)
              })
              .catch(error => console.error(error))
          })
        this.setStatus(`success`)
      } catch (error) {
        console.error(error)
      }
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
