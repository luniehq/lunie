<template>
  <TmPage :sign-in-required="true" :managed="true">
    <template slot="managed-body">
      <DelegationsOverview />
      <Undelegations />
      <TmModalTutorial :show="showTutorial" :close="closeTutorial">
        <div slot="main" class="tutorial">
          <h1>An awesome tutorial</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <TmBtn v-focus value="Next" type="primary" />
        </div>
      </TmModalTutorial>
    </template>
  </TmPage>
</template>

<script>
import TmPage from "common/TmPage"
import DelegationsOverview from "staking/DelegationsOverview"
import Undelegations from "staking/Undelegations"

// Just to test tutorial component
import TmModalTutorial from "common/TmModalTutorial"
import TmBtn from "src/components/common/TmBtn"

export default {
  name: `page-portfolio`,
  components: {
    TmPage,
    Undelegations,
    DelegationsOverview,
    // Just to test tutorial component
    TmModalTutorial,
    TmBtn
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

<style>
.tutorial .button {
  width: 100%;
  margin-top: 2rem;
}
</style>
