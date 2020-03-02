<template>
  <ul class="network-list">
    <li
      v-for="network in networks"
      :key="network.chain_id"
      class="select-network-item"
      :class="{ selected: currentNetwork === network.id }"
      @click="network.chain_id ? selectNetworkHandler(network) : false"
    >
      <NetworkItem :networkitem="network" />
    </li>
  </ul>
</template>

<script>
import { mapGetters } from "vuex"
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
    ...mapGetters([`network`]),
    currentNetwork() {
      return this.network
    }
  },
  methods: {
    async selectNetworkHandler(network) {
      if (this.network !== network.id) {
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
