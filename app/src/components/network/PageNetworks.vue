<template>
  <TmPage data-title="Network" class="page">
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
    NetworkList,
  },
  data: () => ({
    comingSoon: [
      {
        id: "tezos-mainnet",
        title: "Tezos",
        icon: "/img/networks/tezos-mainnet.png",
      },
    ],
  }),
  computed: {
    ...mapGetters([`networks`]),
    mainNetworks() {
      return this.networks
        .filter((network) => !network.testnet)
        .sort((a, b) => b.default - a.default)
    },
    testNetworks() {
      return this.networks.filter((network) => network.testnet)
    },
  },
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
