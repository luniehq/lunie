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
        <h3 class="tab-header">Pending Undelegations</h3>
        <Undelegations />
      </template>
    </template>
  </TmPage>
</template>

<script>
import num from "scripts/num"
import { mapState, mapGetters } from "vuex"
import orderBy from "lodash.orderby"
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
    ...mapGetters([
      `connected`,
      `distribution`,
      `totalRewards`,
      `bondDenom`,
      `lastHeader`
    ]),
    filteredBalances() {
      return orderBy(
        this.wallet.balances,
        [`amount`, balance => num.viewDenom(balance.denom).toLowerCase()],
        [`desc`, `asc`]
      )
    },
    // only be ready to withdraw of the validator rewards are loaded and the user has rewards to withdraw
    // the validator rewards are needed to filter the top 5 validators to withdraw from
    readyToWithdraw() {
      return this.totalRewards > 0
    }
  },
  watch: {
    lastHeader: {
      immediate: true,
      handler(newHeader) {
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
