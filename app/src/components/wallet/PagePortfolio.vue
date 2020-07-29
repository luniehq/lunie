<template>
  <TmPage :sign-in-required="true">
    <template slot="signInRequired">
      <TmBalance />
      <DelegationsOverview />
      <Undelegations />
    </template>
  </TmPage>
</template>

<script>
import DelegationsOverview from "staking/DelegationsOverview"
import TmBalance from "common/TmBalance"
import TmPage from "common/TmPage"
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
