<template>
  <TmPage :sign-in-required="true" :managed="true">
    <template slot="managed-body">
      <DelegationsOverview />
      <Undelegations />
      <ModalTutorial :show="showTutorial" :close="closeTutorial" />
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
    showTutorial: true
  }),
  // Just to test tutorial component
  methods: {
    closeTutorial() {
      this.showTutorial = false
    }
  }
}
</script>

