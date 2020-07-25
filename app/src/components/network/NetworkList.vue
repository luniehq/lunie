<template>
  <section>
    <h3>{{ sectionTitle }}</h3>
    <ul class="network-list">
      <li
        v-for="network in networks"
        :key="network.id"
        class="select-network-item"
        :data-network="network.id"
        @click="network.chain_id ? selectNetworkHandler(network) : false"
      >
        <NetworkItem :network-item="network" :disabled="disabled" />
      </li>
    </ul>
  </section>
</template>

<script>
import { mapGetters } from "vuex"
import NetworkItem from "./NetworkItem"

export default {
  name: `network-list`,
  components: {
    NetworkItem,
  },
  props: {
    networks: {
      type: Array,
      required: true,
    },
    disabled: {
      type: Boolean,
      required: false,
    },
    sectionTitle: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapGetters({ networkId: `network` }),
  },
  methods: {
    async selectNetworkHandler(network) {
      if (this.networkId !== network.id) {
        this.$store.dispatch(`setNetwork`, network)
      }
    },
  },
}
</script>
<style scoped>
h3 {
  margin: 0 0 0.25rem 1rem;
  color: var(--dim);
  font-size: var(--sm);
  font-weight: 500;
}

.network-list {
  margin-bottom: 4rem;
}
</style>
