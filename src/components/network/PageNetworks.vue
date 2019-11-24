<template>
  <TmPage data-title="Network" class="page" hide-header>
    <TmDataLoading v-if="$apollo.loading" />
    <template v-else-if="!$apollo.loading">
      <h3>Main Networks</h3>
      <NetworkList :networks="mainNetworks" />
      <h3>Test Networks</h3>
      <NetworkList :networks="testNetworks" />
    </template>
  </TmPage>
</template>

<script>
import { Networks, NetworksResult } from "src/gql"
const NetworkList = () => import("./NetworkList")
const TmDataLoading = () => import("common/TmDataLoading")

import TmPage from "common/TmPage"
export default {
  name: `page-network`,
  components: {
    TmPage,
    NetworkList,
    TmDataLoading
  },
  data: () => ({
    networks: []
  }),
  computed: {
    mainNetworks() {
      return this.networks.filter(network => !network.testnet)
    },
    testNetworks() {
      return this.networks.filter(network => network.testnet)
    }
  },
  apollo: {
    networks: {
      query: Networks,
      update: NetworksResult
    }
  }
}
</script>
<style scoped>
.page {
  padding: 2rem;
  margin: 0 auto;
  max-width: 680px;
}

h3 {
  margin: 0 0 0.25rem 1rem;
  color: var(--dim);
  font-size: var(--sm);
  font-weight: 500;
}

@media screen and (max-width: 767px) {
  .page {
    padding: 1rem;
  }
}
</style>
