<template>
  <TmPage :sign-in-required="true">
    <DelegationsOverview />
    <Undelegations />
  </TmPage>
</template>

<script>
import TmPage from "common/TmPage"
import DelegationsOverview from "staking/DelegationsOverview"
import Undelegations from "staking/Undelegations"

export default {
  name: `page-portfolio`,
  components: {
    TmPage,
    Undelegations,
    DelegationsOverview
  }
}
</script>
