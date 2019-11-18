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
    ...mapState([`session`]),
    ...mapState([`connection`])
  },
  methods: {
    selectNetworkHandler(network) {
      let confirm = this.confirmModalOpen()
      if (this.connection.network !== network.id && confirm) {
        this.$store.dispatch(`setNetwork`, network)
      }
    },
    confirmModalOpen() {
      let confirm = false
      if (this.session.signedIn) {
        confirm = window.confirm(
          `By switching the network you will get signed out of your current address: ${this.$store.state.session.address}`
        )
        return confirm
      } else {
        return true
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
