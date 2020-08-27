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
import { mapGetters, mapState } from "vuex"
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
    ...mapState(["session"]),
    ...mapGetters([{ networkId: `network` }, `isExtension`]),
    whichFlow() {
      if (this.$route.name === "select-network-recover") {
        return `/recover`
      } else if (this.$route.name === "select-network-create") {
        return `/create`
      } else {
        return ``
      }
    },
  },
  methods: {
    async selectNetworkHandler(network) {
      if (this.networkId !== network.id) {
        await this.$store.dispatch(`setNetwork`, network)
      }
      if (this.$route.name !== "networks") {
        this.$router.push(this.whichFlow)
        return
      }

      // enter the network
      if (
        this.session.allSessionAddresses.find(
          ({ networkId }) => networkId === network.id
        )
      ) {
        this.$router.push({
          name: `portfolio`,
          params: { networkId: network.slug },
        })
        // if no active session found then take to the validators table
      } else {
        this.$router.push({
          name: `validators`,
          params: { networkId: network.slug },
        })
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
