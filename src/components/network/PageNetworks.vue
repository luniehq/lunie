<template>
  <TmPage data-title="Network" class="page" hide-header>
    <template>
      <h3>Main Networks</h3>
      <NetworkList :networks="mainNetworks" />
      <h3>Test Networks</h3>
      <NetworkList :networks="testNetworks" />
    </template>
  </TmPage>
</template>

<script>
import { Networks, NetworksResult } from "src/gql"
import NetworkList from "./NetworkList"
import config from "src/config"

import TmPage from "common/TmPage"
export default {
  name: `page-network`,
  components: {
    TmPage,
    NetworkList
  },
  data: () => ({
    networks: []
  }),
  computed: {
    mainNetworks() {
      return this.networks.filter(network => !network.testnet)
    },
    testNetworks() {
      const networks = this.networks.filter(network => network.testnet)
      if (config.development) {
        networks.push({
          title: "Local Testnet",
          chain_id: "testnet",
          id: "testnet",
          rpc_url: config.rpc,
          api_url: config.stargate,
          logo_url: "https://s3.amazonaws.com/network.logos/cosmos-logo.png"
        })
      }
      return networks
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
}

.page-profile__title {
  color: var(--bright);
  font-size: var(--h1);
  line-height: 2.25rem;
  font-weight: 500;
  padding: 1rem;
}

.page-profile__section-title {
  color: var(--txt);
}

.tm-data-msg {
  margin: 0;
}

.page-profile__section {
  padding-top: 2rem;
}

h3 {
  margin-bottom: 1rem;
  color: var(--text);
  font-size: var(--h4);
  line-height: 2.25rem;
  font-weight: 500;
}

.select-network-item {
  cursor: pointer;
  padding: 0;
  margin-bottom: 1rem;
}

.select-network-item.selected {
  cursor: inherit;
}
</style>
