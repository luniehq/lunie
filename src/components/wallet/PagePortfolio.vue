<template>
  <TmPage :sign-in-required="true" :managed="true">
    <template slot="managed-body">
      <DelegationsOverview />
      <Undelegations />
      <ModalTutorial
        v-if="showTutorial && session.experimentalMode"
        :steps="steps"
        fullguide="https://lunie.io"
        :close="closeTutorial"
      />
    </template>
  </TmPage>
</template>

<script>
import { mapState } from "vuex"
import TmPage from "common/TmPage"
import DelegationsOverview from "staking/DelegationsOverview"
import Undelegations from "staking/Undelegations"
import ModalTutorial from "common/ModalTutorial"

export default {
  name: `page-portfolio`,
  components: {
    TmPage,
    Undelegations,
    DelegationsOverview,
    ModalTutorial
  },
  data: () => ({
    showTutorial: true,
    // Tutorial steps
    steps: [
      {
        title: "How Cosmos Governance Works",
        // Each content array element will be enclosed in a span (newline)
        content: [
          "If you are staking your ATOM on Cosmos, you should also consider participating in it’s on-chain governance. Here we’ll show you how to explore some of the unique governance features that Lunie gives you access to:"
        ]
      },
      {
        title: " Do you have something at stake?",
        content: [
          "If you have tokens staked on this network, you’re eligible to participate in the network’s governance system. If you don’t have tokens yet, click here [link to staking guide]."
        ]
      },
      {
        title: "Proposals",
        content: [
          "In the Proposals view you will see all past and present proposals as well as the “Create Proposal” button to create your own. If you believe in this network and what it stands for, you should participate!!"
        ]
      },
      {
        title: "Deposit Period",
        content: [
          "If a proposal is in the “Deposit Period” you will be able to contribute ATOM to the proposal if you wish to see it move to a voting stage."
        ]
      },
      {
        title: "Vote!",
        content: [
          "If a proposal is in the voting stage you can vote on whether you support it or not."
        ]
      }
    ]
  }),
  computed: {
    ...mapState([`session`])
  },
  methods: {
    closeTutorial() {
      /* istanbul ignore next */
      this.showTutorial = false
    }
  }
}
</script>
