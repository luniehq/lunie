<template>
  <TmPage :sign-in-required="true" :dark-background="true">
    <TmBalance />
    <DelegationsOverview />
    <Undelegations />
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
