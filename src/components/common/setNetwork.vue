<template>
  <router-view></router-view>
</template>

<script>
import gql from "graphql-tag"
export default {
  name: `select-network`,
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
        if (
          this.$route.params.networkId &&
          networks.find(network => network == this.$route.params.networkId)
        ) {
          this.$store.dispatch(`setNetwork`, {
            id: this.$route.params.networkId
          })
        } else {
          this.$router.push("/feature-not-available/network")
        }
      }
    }
  }
}
</script>
