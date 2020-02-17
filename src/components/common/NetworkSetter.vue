<template>
  <router-view></router-view>
</template>

<script>
import gql from "graphql-tag"
export default {
  name: `select-network`,
  methods: {
    findNetwork(networks) {
      return networks.find(
        network =>
          network.replace(/-mainnet$/, ``) === this.$route.params.networkId
      )
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
        const networks = data.networks.map(network => network.id)
        let networkTitle
        if (
          this.$route.params.networkId &&
          (networkTitle = this.findNetwork(networks))
        ) {
          this.$store.dispatch(`setNetwork`, {
            id: networkTitle
          })
        } else {
          this.$router.push("/feature-not-available/network")
        }
      }
    }
  }
}
</script>
