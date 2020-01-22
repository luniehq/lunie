<template>
  <ul class="network-list">
    <li
      v-for="network in networks"
      :key="network.chain_id"
      class="select-network-item"
      :class="{ selected: connection.network === network.id }"
      @click="clickHandler(network)"
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
    },
    route: {
      type: String,
      default: ``
    }
  },
  computed: {
    ...mapState([`session`]),
    ...mapState([`connection`])
  },
  methods: {
    async selectNetworkHandler(network) {
      if (this.connection.network !== network.id) {
        this.$store.dispatch(`setNetwork`, network)
      }
    },
    clickHandler(network) {
      this.selectNetworkHandler(network)
      this.route ? this.$router.push(this.route) : null
    }
  }
}
</script>
<style scoped>
.network-list {
  margin-bottom: 4rem;
}
</style>
