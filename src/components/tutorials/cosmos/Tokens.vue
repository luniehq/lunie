<template>
  <ModalTutorial
    fullguide="https://lunie.io/guides/how-to-get-tokens/"
    background="red"
    :steps-num="5"
    :close="closeTutorial"
  >
    <template slot="step1">
      <h2>How to get tokens</h2>
      <p>
        The easiest way to get tokens is to find a reputable exchange, like
        Coinbase or Binance, to purchase your tokens from.
      </p>
    </template>
    <template slot="step2">
      <h2>Create your address</h2>
      <p>
        You can create an address with Lunie using our browser extension, our
        mobile wallets or a Ledger Nano hardware wallet.
      </p>
    </template>
    <template slot="step3">
      <h2>Back it up!</h2>
      <p>
        When you create an address, ensure your backup code is correct and in a
        secure place. We don't recommend using an address if you haven't backed
        it up appropriately.
      </p>
    </template>
    <template slot="step4">
      <h2>Send to your address</h2>
      <p>
        The short version of your address will look something like this:
        cosmos...7yqp. Make sure to use the full version of your address to
        successfully receive tokens.
      </p>
    </template>
    <template slot="step5">
      <h2>Have more questions?</h2>
      <p>
        Check out our full guide to getting tokens so you can start staking!
      </p>
    </template>
  </ModalTutorial>
</template>

<script>
import ModalTutorial from "common/ModalTutorial"

export default {
  name: `tutorial-cosmos-tokens`,
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
