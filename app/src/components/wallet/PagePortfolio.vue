<template>
  <TmPage :sign-in-required="true" :managed="true" :dark-background="true">
    <template slot="managed-body">
      <DelegationsOverview />
      <Undelegations />
    </template>
    <div
      v-if="!session.isMobile && session.signedIn && !currentNetwork.testnet"
      id="powered-by-coingecko"
    >
      <span>Fiat currencies courtesy of&nbsp;</span>
      <img id="coingecko-logo" src="/img/icons/coingecko.webp" />
      <span>&nbsp;API</span>
    </div>
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
    DelegationsOverview,
  },
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`currentNetwork`]),
  },
}
</script>
<style scoped>
#powered-by-coingecko {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 0.75rem;
}

#coingecko-logo {
  width: 6rem;
}

#powered-by-coingecko > * {
  display: inline-block;
  margin-right: 0.25rem;
}

@media screen and (max-width: 1023px) {
  #powered-by-coingecko {
    display: none;
  }
}
</style>
