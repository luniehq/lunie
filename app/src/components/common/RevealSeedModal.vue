<template>
    <SessionFrame ref="sessionFrame">
        <div v-if="!wallet" class="session-container">
            <h2 class="session-title">
                You are about to reveal your seed phrase
            </h2>
            <TmFormGroup
                class="reveal-seed-form-group"
                field-id="password"
            >
            <TmField id="password" v-model="password" type="password" placeholder="Password" />
            <div class="reveal-seed-buttons">
                <TmBtn
                    value="Dismiss"
                    type="secondary"
                    @click.native="close"
                    @click.enter.native="close"
                />
                <TmBtn
                    value="Reveal"
                    type="primary"
                    @click.native="revealSeedPhrase"
                    @click.enter.native="revealSeedPhrase"
                />
            </div>
            </TmFormGroup>
        </div>
        <div v-else class="session-container">
            <h2 class="session-title">
                Account: {{wallet.name}}
            </h2>
            <p v-if="wallet.seedPhrase">Seed Phrase: {{wallet.seedPhrase}}</p>
            <p>Private Key: {{wallet.privateKey}}</p>
            <p>Public Key: {{wallet.publicKey}}</p>
        </div>
    </SessionFrame>
</template>

<script>
import SessionFrame from "common/SessionFrame"
import TmFormGroup from "common/TmFormGroup"
import TmField from "common/TmField"
import TmBtn from "common/TmBtn"
import config from "src/../config"
export default {
  name: `reveal-seed`,
  components: {
    SessionFrame,
    TmFormGroup,
    TmField,
    TmBtn,
  },
  data: () => ({
    password: '',
    isExtension: config.isExtension,
    wallet: undefined
  }),
  methods: {
    async revealSeedPhrase() {
      const wallet = await this.$store.dispatch(`getWalletSeed`, {
        address: this.address,
        password: this.password,
      })
      this.wallet = wallet
    },
    close() {
        // TODO: handle extension case
        this.$refs.sessionFrame.goToPortfolio()
    }
  },
  mounted() {
    this.address = this.$route.params.address
  }
}
</script>

<style scoped>
.reveal-seed-buttons {
  display: flex;
}
p {
  color: var(--menu-bright);
}
</style>
