<template>
  <ModalTutorial
    fullguide="https://lunie.io/guides/how-to-manage-your-keys/"
    background="yellow"
    :steps-num="6"
    :close="closeTutorial"
  >
    <template slot="step1">
      <h2>Managing your keys</h2>
      <p>
        When you create an address, we're also creating a public and private
        key-pair for you in the background. Your address can be public but your
        backup code should remain private.
      </p>
    </template>
    <template slot="step2">
      <h2>The backup code</h2>
      <p>
        The backup code (aka. seed phrase) needs to be treated with great care.
        Using your backup key, it's possible to determine your private key and
        access your tokens.
      </p>
    </template>
    <template slot="step3">
      <h2>Several copies, stored safely</h2>
      <p>
        Keep a physical copy of your backup code written down somewhere. We'd
        recommend storing it in different places both physically on paper and
        encrypted digitally.
      </p>
    </template>
    <template slot="step4">
      <h2>The 'private' key</h2>
      <p>
        Never reveal your backup code or private key to anyone. This backup code
        should always remain private.
      </p>
    </template>
    <template slot="step5">
      <h2>Use a hardware wallet</h2>
      <p>
        Our browser extension and mobile apps will keep your keys safe, but
        nothing has the same guarantees as a hardware wallet.
      </p>
    </template>

    <template slot="step6">
      <h2>Have more questions?</h2>
      <p>
        Check out our full guide for an in depth explanation of how to manage
        your keys!
      </p>
    </template>
  </ModalTutorial>
</template>

<script>
import ModalTutorial from "common/ModalTutorial"

export default {
  name: `tutorial-cosmos-keys`,
  components: {
    ModalTutorial
  },
  methods: {
    closeTutorial() {
      this.$emit(`close-tutorial`)
    }
  }
}
</script>
