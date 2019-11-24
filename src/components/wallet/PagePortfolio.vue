<template>
  <TmPage :sign-in-required="true" :managed="true">
    <template slot="managed-body">
      <DelegationsOverview />
      <Undelegations />
    </template>
  </TmPage>
</template>

<script>
const TmPage = () => import("common/TmPage")
const DelegationsOverview = () => import("staking/DelegationsOverview")
const Undelegations = () => import("staking/Undelegations")

export default {
  name: `page-portfolio`,
  components: {
    TmPage,
    Undelegations,
    DelegationsOverview
  }
}
</script>
