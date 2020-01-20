<template>
  <SessionFrame>
    <div class="select-network">
      <h2 class="session-title">Select a Network</h2>
      <div class="select-networks-list">
        <LiSession
          v-for="network in sortedNetworks"
          :key="network.title"
          icon="language"
          :title="network.title"
          :route="{ name: 'create', params: { network: network.id } }"
        />
      </div>
    </div>
  </SessionFrame>
</template>

<script>
import LiSession from "common/TmLiSession"
import SessionFrame from "common/SessionFrame"
import gql from "graphql-tag"

export default {
  name: `select-network`,
  components: {
    SessionFrame,
    LiSession
  },
  data: () => ({
    networks: []
  }),
  computed: {
    sortedNetworks() {
      // sorts networks setting mainnets at the top and the default one the first
      if (this.networks) {
        const sortedNetworks = this.networks
        return sortedNetworks.sort((a, b) => {
          return b.testnet - a.testnet
        }).sort((a, b) => {
          return b.default - a.default
        })
      } else {
        return null
      }
    }
  },
  apollo: {
    networks: {
      query: gql`
        query Networks {
          networks {
            id
            title
            testnet
            default
          }
        }
      `
    }
  }
}
</script>
