<template>
  <SessionFrame>
    <div class="select-network">
      <h2 class="session-title">Select a Network</h2>
      <ul class="select-network-list">
        <li
          v-for="network in sortedNetworks"
          :key="network.chain_id"
          class="select-network-item"
          :class="{ selected: networkId === network.id }"
          @click="selectNetworkHandler(network)"
        >
          <NetworkItem :network="network" />
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
    networks: []
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
    },
    sortedNetworks() {
      // sorts networks setting showing the current network first, mainnets at the top and the default one the first
      if (this.networks.length > 0) {
        return [
          // current network first
          this.networks.find(({ id }) => id === this.networkId),
          ...this.networks
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
      } else {
        return []
      }
    }
  },
  methods: {
    async selectNetworkHandler(network) {
      console.log(this.networkId, network.id)
      if (this.networkId !== network.id) {
        this.$store.dispatch(`setNetwork`, network)
      }

      this.$router.push(this.whichFlow)
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
