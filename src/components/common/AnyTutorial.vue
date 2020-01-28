<template>
  <component :is="tutorialComponent" @close-tutorial="closeTutorial" />
</template>

<script>
import TutorialCosmosStaking from "src/components/tutorials/cosmos/Staking.vue"
import TutorialCosmosKeys from "src/components/tutorials/cosmos/Keys.vue"
import TutorialCosmosTokens from "src/components/tutorials/cosmos/Tokens.vue"
import TutorialCosmosGovernance from "src/components/tutorials/cosmos/Governance.vue"

export default {
  name: `any-tutorial`,
  components: {
    TutorialCosmosStaking,
    TutorialCosmosKeys,
    TutorialCosmosTokens,
    TutorialCosmosGovernance
  },
  props: {
    topic: {
      type: String,
      required: true
    },
    network: {
      type: String,
      required: true
    }
  },
  computed: {
    tutorialComponent() {
      if (
        (this.network === `cosmos-hub-mainnet` ||
          this.network === `cosmos-hub-testnet`) &&
        this.topic === `staking`
      ) {
        return `tutorial-cosmos-staking`
      } else if (
        (this.network === `cosmos-hub-mainnet` ||
          this.network === `cosmos-hub-testnet`) &&
        this.topic === `governance`
      ) {
        return `tutorial-cosmos-governance`
      } else if (
        (this.network === `cosmos-hub-mainnet` ||
          this.network === `cosmos-hub-testnet`) &&
        this.topic === `keys`
      ) {
        return `tutorial-cosmos-keys`
      } else if (
        (this.network === `cosmos-hub-mainnet` ||
          this.network === `cosmos-hub-testnet`) &&
        this.topic === `tokens`
      ) {
        return `tutorial-cosmos-tokens`
      }
      return ``
    }
  },
  methods: {
    closeTutorial() {
      this.$emit(`close-tutorial`)
    }
  }
}
</script>
