<template>
  <ul>
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
.page-profile__title {
  color: var(--bright);
  font-size: var(--h1);
  line-height: 2.25rem;
  font-weight: 500;
  padding: 1rem;
}

.page-profile__section-title {
  color: var(--txt);
}

.tm-data-msg {
  margin: 0;
}

.page-profile__section {
  padding-top: 2rem;
}

h3 {
  margin-bottom: 1rem;
  color: var(--text);
  font-size: var(--h4);
  line-height: 2.25rem;
  font-weight: 500;
}

.select-network-item {
  cursor: pointer;
  padding: 0;
  margin-bottom: 1rem;
}

.select-network-item.selected {
  cursor: inherit;
}
</style>
