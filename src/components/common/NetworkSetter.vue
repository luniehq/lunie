<template>
  <router-view></router-view>
</template>

<script>
import gql from "graphql-tag"
export default {
  name: `select-network`,
  methods: {
    findNetwork(networks) {
      return (
        this.$route.params.networkId && // checking if network is set in the url
        // finding network with the same slug
        networks.find(network => network.slug === this.$route.params.networkId)
      )
    }
  },
  apollo: {
    networks: {
      query: gql`
        query Networks {
          networks {
            slug
            id
            default
          }
        }
      `,
      /* istanbul ignore next */
      update(data) {
        let network = this.findNetwork(data.networks)
        if (!network) {
          network = data.networks.find(network => network.default === true)
        }
        this.$store.dispatch(`setNetwork`, network)
        this.$router.push(`/${network.slug}/portfolio`)
      }
    }
  }
}
</script>
