<template>
  <TmPage data-title="Network" class="page" hide-header>
    <template>
      <NetworkList :networks="mainNetworks" section-title="Main Networks" />

      <NetworkList :networks="testNetworks" section-title="Test Networks" />

      <NetworkList
        :networks="comingSoon"
        :disabled="true"
        section-title="Coming Soon"
      />
    </template>
  </TmPage>
</template>

<script>
import { mapGetters } from "vuex"
import NetworkList from "./NetworkList"

import TmPage from "common/TmPage"
export default {
  name: `page-networks`,
  components: {
    TmPage,
    NetworkList
  },
  data: () => ({
    comingSoon: [
      {
        id: "polkadot-mainnet",
        title: "Polkadot",
        icon: "/img/networks/polkadot-mainnet.png"
      },
      {
        id: "tezos-mainnet",
        title: "Tezos",
        icon: "/img/networks/tezos-mainnet.png"
      },
      {
        id: "dawnchain-testnet",
        title: "Dawn",
        icon: "/img/networks/dawnchain-testnet.png"
      },
      {
        id: "akash-testnet",
        title: "Akash",
        icon: "/img/networks/akash-testnet.png"
      }
    ]
  }),
  computed: {
    ...mapGetters([`networks`]),
    mainNetworks() {
      return this.networks.filter(network => !network.testnet)
    },
    testNetworks() {
      return this.networks.filter(network => network.testnet)
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

@media screen and (max-width: 767px) {
  .page {
    padding: 1rem;
  }
}
</style>
