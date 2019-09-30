<template>
  <TmPage
    :managed="true"
    :loading="wallet.loading && delegation.loading"
    :loaded="wallet.loaded && delegation.loaded"
    :error="wallet.error || delegation.error"
    :sign-in-required="true"
  >
    <template slot="managed-body">
      <DelegationsOverview />
      <template v-if="Object.keys(delegation.unbondingDelegations).length">
        <h3 class="tab-header">
          Pending Undelegations
        </h3>
        <Undelegations />
      </template>
    </template>
  </TmPage>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import TmPage from "common/TmPage"
import DelegationsOverview from "staking/DelegationsOverview"
import Undelegations from "staking/Undelegations"

export default {
  name: `page-portfolio`,
  components: {
    TmPage,
    Undelegations,
    DelegationsOverview
  },
  data: () => ({
    lastUpdate: 0
  }),
  computed: {
    ...mapState([`session`, `wallet`, `delegation`]),
    ...mapGetters([`lastHeader`])
  },
  watch: {
    lastHeader: {
      immediate: true,
      handler: function(newHeader) {
        const height = Number(newHeader.height)
        // run the update queries the first time and after every 10 blocks
        const waitedTenBlocks = height - this.lastUpdate >= 10
        if (
          this.session.signedIn &&
          (this.lastUpdate === 0 || waitedTenBlocks)
        ) {
          this.update(height)
        }
      }
    }
  },
  methods: {
    update(height) {
      this.lastUpdate = height
      this.$store.dispatch(`getRewardsFromMyValidators`)
    }
  }
}
</script>
<style scoped>
.tab-header {
  margin-top: 2rem;
  margin-bottom: 1rem;
}
</style>
