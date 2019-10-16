<template>
  <ul class="network-list">
    <li
      v-for="network in networks"
      :key="network.chain_id"
      class="select-network-item"
      :class="{ selected: connection.network === network.id }"
      @click="selectNetworkHandler(network)"
    >
      <NetworkItem :network="network" />
    </li>
  </ul>
</template>

<script>
import { mapState } from "vuex"
import NetworkItem from "./NetworkItem"

export default {
  name: `page-network`,
  components: {
    NetworkItem
  },
  props: {
    networks: {
      type: Array,
      required: true
    }
  },
  computed: {
    ...mapState([`connection`])
  },
  methods: {
    selectNetworkHandler(network) {
      if (this.connection.network !== network.id) {
        this.$store.dispatch(`setNetwork`, network)
      }
    }
  }
}
</script>
<style scoped>
.network-list {
  margin-bottom: 4rem;
}
</style>
