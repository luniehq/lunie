<template>
  <router-view></router-view>
</template>

<script>
import gql from "graphql-tag"
export default {
  name: `select-network`,
  methods: {
    findNetwork(networks) {
      if (this.$route.params.networkId.includes(`testnet`)) {
        return networks.find(
          network => network === this.$route.params.networkId
        )
      } else {
        return networks.find(
          network => network === this.$route.params.networkId.concat(`-mainnet`)
        )
      }
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
        if (this.$route.params.networkId && this.findNetwork(networks)) {
          this.$store.dispatch(`setNetwork`, {
            id: this.findNetwork(networks)
          })
        } else {
          this.$router.push("/feature-not-available/network")
        }
      }
    }
  }
}
</script>
