<template>
  <ModalTutorial
    fullguide="https://lunie.io/guides/how-cosmos-governance-works/"
    background="lightblue"
    :steps-num="5"
    :close="closeTutorial"
  >
    <template slot="step1">
      <h2>Intro to governance</h2>
      <p>
        If you have staked ATOMs on the Cosmos Hub, you can submit your own
        improvement proposal and vote on what others have proposed.
      </p>
    </template>
    <template slot="step2">
      <h2>Proposals</h2>
      <p>
        Proposals are submitted by community members and typically include ideas
        for how to improve the underlying protocols. Proposals are stored
        'on-chain'.
      </p>
    </template>
    <template slot="step3">
      <h2>Deposit Period</h2>
      <p>
        Proposals start in the 'Deposit Period' and require a certain number of
        deposits, before the proposal can be voted on. This is both a spam
        prevention and signalling mechanism.
      </p>
    </template>
    <template slot="step4">
      <h2>The Vote!</h2>
      <p>
        Validators have an obligation to vote and do so on behalf of the people
        who 'staked' tokens with them. As a token holder, you can vote
        independently of your validators if you wish.
      </p>
    </template>
    <template slot="step5">
      <h2>Have more questions?</h2>
      <p>
        Check out our full governance guide for an in depth explanation of all
        things governance.
      </p>
    </template>
  </ModalTutorial>
</template>

<script>
import ModalTutorial from "common/ModalTutorial"

export default {
  name: `tutorial-cosmos-governance`,
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
