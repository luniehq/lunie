<template>
  <TmPage data-title="Network" class="small" hide-header>
    <template>
      <NetworkList title="Mainnets" :networks="mainNets" />
      <NetworkList title="Testnets" :networks="testNets" />
    </template>
  </TmPage>
</template>

<script>
import { Networks, NetworksResult } from "src/gql"
import NetworkList from "./NetworkList"

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
    mainNets() {
      return this.networks.filter(network => !network.testnet)
    },
    testNets() {
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
