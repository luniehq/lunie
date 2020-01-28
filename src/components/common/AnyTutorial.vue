<template>
  <component :is="tutorialComponent" @close-tutorial="closeTutorial" />
</template>

<script>
import TutorialCosmosStaking from "src/components/tutorials/cosmos/Staking.vue"
import TutorialCosmosKeys from "src/components/tutorials/cosmos/Keys.vue"
import TutorialCosmosTokens from "src/components/tutorials/cosmos/Tokens.vue"
import TutorialCosmosGovernance from "src/components/tutorials/cosmos/Governance.vue"

// Map network/topic to component
const tutorials = {
  "cosmos-hub-mainnet": {
    staking: `tutorial-cosmos-staking`,
    keys: `tutorial-cosmos-keys`,
    tokens: `tutorial-cosmos-tokens`,
    governance: `tutorial-cosmos-governance`
  },
  "cosmos-hub-testnet": {
    staking: `tutorial-cosmos-staking`,
    keys: `tutorial-cosmos-keys`,
    tokens: `tutorial-cosmos-tokens`,
    governance: `tutorial-cosmos-governance`
  }
}

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
  data: function() {
    return {
      tutorials
    }
  },
  computed: {
    tutorialComponent() {
      return tutorials[this.network][this.topic] || ``
    }
  },
  methods: {
    closeTutorial() {
      this.$emit(`close-tutorial`)
    }
  }
}
</script>
