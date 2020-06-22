<template>
  <TmPage :sign-in-required="true" :managed="true" :dark-background="true">
    <template slot="managed-body">
      <DelegationsOverview />
      <Undelegations />
    </template>
    <div id="powered-by-coingecko">
      <span>Fiat currencies courtesy of&nbsp;</span>
      <img id="coingecko-logo" src="/img/icons/coingecko.webp"/>
      <span>&nbsp;API</span>
    </div>
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
    DelegationsOverview,
  },
}
</script>
<style scoped>
  #coingecko-logo {
    width: 6rem;
  }

  #powered-by-coingecko {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-right: 1rem;
    font-size: 0.75rem;
  }

  #powered-by-coingecko > * {
    display: inline-block;
    margin-right: 0.25rem;
  }
</style>