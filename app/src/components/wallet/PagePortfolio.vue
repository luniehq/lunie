<template>
  <TmPage :sign-in-required="true" :managed="true" :dark-background="true">
    <template slot="managed-body">
      <TmBalance />
      <DelegationsOverview />
      <Undelegations />
    </template>
  </TmPage>
</template>

<script>
import TmBalance from "common/TmBalance"
import TmPage from "common/TmPage"
import DelegationsOverview from "staking/DelegationsOverview"
import Undelegations from "staking/Undelegations"

export default {
  name: `page-portfolio`,
  components: {
    TmBalance,
    TmPage,
    Undelegations,
    DelegationsOverview,
  },
}
</script>
