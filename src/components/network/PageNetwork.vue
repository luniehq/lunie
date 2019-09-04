<template>
  <TmPage data-title="Network" class="small" hide-header>
    <template>
      <h3>Mainnets</h3>
      <ul>
        <li
          v-for="network in mainNets"
          :key="network.chain_id"
          class="select-network-item"
          @click="selectNetworkHandler(network)"
        >
          <NetworkItem :network="network" />
        </li>
      </ul>
      <h3>Testnets</h3>
      <ul>
        <li
          v-for="network in testNets"
          :key="network.chain_id"
          class="select-network-item"
          @click="selectNetworkHandler(network)"
        >
          <NetworkItem :network="network" />
        </li>
      </ul>
    </template>
  </TmPage>
</template>

<script>
import { Networks, NetworksResult } from "src/gql"
import NetworkItem from "./NetworkItem"

import TmPage from "common/TmPage"
export default {
  name: `page-network`,
  components: {
    TmPage,
    NetworkItem
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
  methods: {
    selectNetworkHandler(network) {
      console.log("network", network)
      this.$store.dispatch(`setNetwork`, network)
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
</style>
