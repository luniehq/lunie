<template>
  <div>
    <h1>You are about to reveal your seed phrase</h1>
    <TmFormGroup
      class="reveal-seed-form-group"
      field-id="password"
      field-label="Password"
    >
      <TmField id="password" v-model="password" type="password" />
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
</template>

<script>
import TmFormGroup from "common/TmFormGroup"
import TmField from "common/TmField"
import TmBtn from "common/TmBtn"
export default {
  name: `reveal-seed`,
  components: {
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
  methods: {
    revealSeedPhrase() {
      const seed = this.$store.dispatch(`getWalletSeed`, {
        address: this.address,
        password: this.password,
      })
      console.log("Your seed is", seed)
    },
  },
}
</script>

<style scoped>
.reveal-seed-buttons {
  display: flex;
}
</style>
