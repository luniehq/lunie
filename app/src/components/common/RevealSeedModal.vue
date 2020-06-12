<template>
    <SessionFrame ref="sessionFrame">
        <div class="session-container">
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
  props: {
    address: {
      type: String,
      required: true,
    },
  },
  data: () => {
      return {
            password: '',
            isExtension: config.isExtension,
      }
  },
  methods: {
    async revealSeedPhrase() {
      const seed = await this.$store.dispatch(`getWalletSeed`, {
        address: this.address,
        password: this.password,
      })
      console.log("Your seed is", seed)
    },
    close() {
        // TODO: handle extension case
        this.$refs.sessionFrame.goToPortfolio()
    }
  },
}
</script>

<style scoped>
.reveal-seed-buttons {
  display: flex;
}
</style>
