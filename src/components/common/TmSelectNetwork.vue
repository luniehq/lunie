<template>
  <SessionFrame>
    <div class="select-network">
      <h2 class="session-title">Select a Network</h2>
      <ul class="select-network-list">
        <li
          v-for="network in sortedNetworks"
          :key="network.chain_id"
          class="select-network-item"
          :data-network="network.id"
          :class="{ selected: networkId === network.id }"
          @click="selectNetworkHandler(network)"
        >
          <NetworkItem :networkitem="network" />
        </li>
      </ul>
    </div>
  </SessionFrame>
</template>

<script>
import { mapState } from "vuex"
import gql from "graphql-tag"
import NetworkItem from "../network/NetworkItem"
import SessionFrame from "common/SessionFrame"
import { mapGetters } from "vuex"

export default {
  name: `select-network`,
  components: {
    SessionFrame,
    NetworkItem
  },
  data: () => ({
    networks: [],
    sortedNetworks: []
  }),
  computed: {
    ...mapState([`connection`]),
    ...mapGetters({ networkId: `network` }),
    whichFlow() {
      if (this.$route.params.recover) {
        return `/recover`
      } else {
        return `/create`
      }
    }
  },
  methods: {
    async selectNetworkHandler(network) {
      if (this.networkId !== network.id) {
        this.$store.dispatch(`setNetwork`, network)
      }

      this.$router.push(this.whichFlow)
    },
    updateSelectedNetwork(networks) {
      if (networks.length > 0) {
        this.sortedNetworks = [
          // current network first
          networks.find(({ id }) => id === this.networkId),
          ...networks
            // ignore the current network in the rest of the list as already showing on the top
            .filter(({ id }) => id !== this.networkId)
            // show all mainnets next
            .sort((a, b) => {
              return a.testnet - b.testnet
            })
            // show the default network on the top
            .sort((a, b) => {
              return b.default - a.default
            })
        ]
          // filter out undefineds (happens if this.networkId is not set like in the extension)
          .filter(x => !!x)
      } else {
        this.sortedNetworks = []
      }
      return this.sortedNetworks // just for tests
    }
  },
  apollo: {
    networks: {
      query: gql`
        query Networks {
          networks {
            id
            chain_id
            title
            testnet
            icon
          }
        }
      `,
      /* istanbul ignore next */
      update(data) {
        // updating sortedNetworks
        this.updateSelectedNetwork(data.networks)
        return data.networks
      }
    }
  }
}
</script>
<style scoped>
.page-networks {
  overflow: scroll;
}
</style>
