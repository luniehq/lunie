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
        title: "How to get tokens?",
        // Each content array element will be enclosed in a span (newline)
        content: [
          "Praesent vitae tristique erat.",
          "Integer ullamcorper ligula vel dolor sagittis nec fermentum risus pharetra.",
          "Nulla mollis tempus sem, a sollicitudin est facilisis ac."
        ]
      },
      {
        title: "How to get tokens?",
        content: [
          "Praesent vitae tristique erat.",
          "Integer ullamcorper ligula vel dolor sagittis nec fermentum risus pharetra.",
          "Nulla mollis tempus sem, a sollicitudin est facilisis ac."
        ]
      },
      {
        title: "How to get tokens?",
        content: [
          "Praesent vitae tristique erat.",
          "Integer ullamcorper ligula vel dolor sagittis nec fermentum risus pharetra.",
          "Nulla mollis tempus sem, a sollicitudin est facilisis ac."
        ]
      },
      {
        title: "How to get tokens?",
        content: [
          "Praesent vitae tristique erat.",
          "Integer ullamcorper ligula vel dolor sagittis nec fermentum risus pharetra.",
          "Nulla mollis tempus sem, a sollicitudin est facilisis ac."
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
