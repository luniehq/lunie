<template>
  <section>
    <h3>{{ sectionTitle }}</h3>
    <ul class="network-list">
      <router-link
        v-for="network in networks"
        :to="{ params: { networkId: network.slug }, name: 'portfolio' }"
        :key="network.id"
        class="select-network-item"
        :data-network="network.id"
        tag="li"
      >
        <NetworkItem :network-item="network" :disabled="disabled" />
      </router-link>
    </ul>
  </section>
</template>

<script>
import { mapGetters } from "vuex"
import NetworkItem from "./NetworkItem"

export default {
  name: `network-list`,
  components: {
    NetworkItem
  },
  props: {
    networks: {
      type: Array,
      required: true
    },
    disabled: {
      type: Boolean,
      required: false
    },
    sectionTitle: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapGetters({ networkId: `network` }),
    whichFlow() {
      if (this.$route.name === "select-network-recover") {
        return `/recover`
      } else if (this.$route.name === "select-network-create") {
        return `/create`
      } else {
        return ``
      }
    }
  }
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
