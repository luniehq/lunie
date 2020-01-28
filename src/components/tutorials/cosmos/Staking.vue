<template>
  <ModalTutorial
    fullguide="https://lunie.io/guides/how-cosmos-staking-works/"
    background="blue"
    :steps-num="6"
    :close="closeTutorial"
  >
    <template slot="step1">
      <h2>Intro to staking</h2>
      <p>
        First things first, you'll need to have some staking tokens. On this
        network, they are called ATOMs.
      </p>
    </template>
    <template slot="step2">
      <h2>Validators</h2>
      <p>
        Validators are network operators who collect a fee for maintaining the
        integrity of the blockchain.
      </p>
    </template>
    <template slot="step3">
      <h2>Choosing a validator</h2>
      <p>
        You can 'stake' your tokens with any validator you like. Choose by
        comparing their commission rate, their uptime history, and how they vote
        on proposals.
      </p>
    </template>
    <template slot="step4">
      <h2>Earning rewards</h2>
      <p>
        Once you 'stake' your tokens, you'll instantly start earning rewards.
        Look for the “Claim Rewards” button on your portfolio page to add your
        rewards to your wallet.
      </p>
    </template>
    <template slot="step5">
      <h2>Lock-up period</h2>
      <p>
        While your tokens are 'staked' you will not be able to transfer or spend
        them. It will take 21 days for your tokens to be in your wallet after
        you 'unstake' them.
      </p>
    </template>
    <template slot="step6">
      <h2>Have more questions?</h2>
      <p>
        Check out our full staking guide for an in depth explanation of all
        things staking.
      </p>
    </template>
  </ModalTutorial>
</template>

<script>
import ModalTutorial from "common/ModalTutorial"

export default {
  name: `tutorial-cosmos-staking`,
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
