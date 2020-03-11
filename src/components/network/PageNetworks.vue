<template>
  <TmPage data-title="Network" class="page" hide-header>
    <TmDataLoading v-if="$apollo.loading" />
    <template v-else-if="!$apollo.loading">
      <h3>Main Networks</h3>
      <NetworkList :networks="mainNetworks" />
      <h3>Test Networks</h3>
      <NetworkList :networks="testNetworks" />
      <h3>Coming Soon</h3>
      <NetworkList :networks="comingSoon" />
    </template>
  </TmPage>
</template>

<script>
import { mapState } from "vuex"
import { NetworksResult } from "src/gql"
import NetworkList from "./NetworkList"
import TmDataLoading from "common/TmDataLoading"

import TmPage from "common/TmPage"
import gql from "graphql-tag"
export default {
  name: `page-network`,
  components: {
    TmPage,
    NetworkList,
    TmDataLoading
  },
  data: () => ({
    networks: [],
    comingSoon: [
      {
        id: "polkadot-mainnet",
        title: "Polkadot",
        icon: "/img/networks/polkadot-mainnet.png"
      },
      {
        id: "polkadot-testnet",
        title: "Kusama",
        icon: "/img/networks/polkadot-testnet.png"
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
    ...mapState(["session"]),
    mainNetworks() {
      return this.networks.filter(network => !network.testnet)
    },
    testNetworks() {
      return this.networks.filter(network => network.testnet)
    }
  },
  apollo: {
    networks: {
      query: gql`
        query Networks($experimental: Boolean) {
          networks(experimental: $experimental) {
            id
            chain_id
            testnet
            title
            icon
            slug
            powered {
              name
              providerAddress
              picture
            }
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          experimental: this.session.experimentalMode
        }
      },
      fetchPolicy: "cache-first",
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
