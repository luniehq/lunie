<template>
  <TmPage
    :managed="true"
    :loading="false"
    :loaded="true"
    :error="false"
    :sign-in-required="true"
  >
    <template slot="managed-body">
      <DelegationsOverview />
      <Undelegations />
    </template>
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
