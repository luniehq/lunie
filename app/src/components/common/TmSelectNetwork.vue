<template>
  <SessionFrame>
    <div class="select-network">
      <h2 class="session-title">Select a Network</h2>

      <NetworkList :networks="mainNetworks" section-title="Main Networks" />
      <NetworkList :networks="testNetworks" section-title="Test Networks" />
    </div>
  </SessionFrame>
</template>

<script>
import NetworkList from "../network/NetworkList"
import SessionFrame from "common/SessionFrame"
import { mapGetters } from "vuex"

export default {
  name: `select-network`,
  components: {
    SessionFrame,
    NetworkList,
  },
  data: () => ({
    sortedNetworks: [],
  }),
  computed: {
    ...mapGetters([`networks`]),
    mainNetworks() {
      return this.networks.filter((network) => !network.testnet)
    },
    testNetworks() {
      return this.networks.filter((network) => network.testnet)
    },
  },
}
</script>
<style scoped>
.select-network {
  overflow: auto;
}
</style>
