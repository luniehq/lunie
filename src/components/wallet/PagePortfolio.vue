<template>
  <TmPage :sign-in-required="true" :managed="true">
    <template slot="managed-body">
      <DelegationsOverview />
      <Undelegations />
      <ModalTutorial
        :steps="steps"
        fullguide="https://lunie.io"
        :close="closeTutorial"
      />
    </template>
  </TmPage>
</template>

<script>
import TmPage from "common/TmPage"
import DelegationsOverview from "staking/DelegationsOverview"
import Undelegations from "staking/Undelegations"

// Just to test tutorial component
import ModalTutorial from "common/ModalTutorial"

export default {
  name: `page-portfolio`,
  components: {
    TmPage,
    Undelegations,
    DelegationsOverview,
    // Just to test tutorial component
    ModalTutorial
  },
  // Just to test tutorial component
  data: () => ({
    steps: [
      {
        title: "How to get tokens?",
        content:
          "Praesent vitae tristique erat.<br />Integer ullamcorper ligula vel dolor sagittis nec fermentum risus pharetra.<br />Nulla mollis tempus sem, a sollicitudin est facilisis ac"
      },
      {
        title: "How to get tokens?",
        content:
          "Praesent vitae tristique erat.<br />Integer ullamcorper ligula vel dolor sagittis nec fermentum risus pharetra.<br />Nulla mollis tempus sem, a sollicitudin est facilisis ac"
      },
      {
        title: "How to get tokens?",
        content:
          "Praesent vitae tristique erat.<br />Integer ullamcorper ligula vel dolor sagittis nec fermentum risus pharetra.<br />Nulla mollis tempus sem, a sollicitudin est facilisis ac"
      },
      {
        title: "How to get tokens?",
        content:
          "Praesent vitae tristique erat.<br />Integer ullamcorper ligula vel dolor sagittis nec fermentum risus pharetra.<br />Nulla mollis tempus sem, a sollicitudin est facilisis ac"
      }
    ]
  }),
  // Just to test tutorial component
  methods: {
    closeTutorial() {
      this.showTutorial = false
    }
  }
}
</script>

