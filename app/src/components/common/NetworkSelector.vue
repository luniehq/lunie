<template>
  <div class="network-selector">
    <router-link
      v-for="network in mainnets"
      :key="network.chain_id"
      class="network-item"
      :class="{
        selected: networkId === network.id && $route.meta.networkSpecificRoute,
      }"
      :to="{ params: { networkId: network.slug }, name: 'portfolio' }"
    >
      <img
        v-tooltip.right="{ content: network.title, offset: 8 }"
        :src="`${network.icon}`"
        :alt="`logo for network ${network.title}`"
      />
    </router-link>
    <div class="network-item">
      <router-link to="/networks" exact="exact" title="Networks">
        <i
          v-tooltip.right="{ content: `All Networks`, offset: 8 }"
          class="all-networks material-icons notranslate"
          >add</i
        >
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"

export default {
  name: `network-selector`,
  computed: {
    ...mapGetters([`networks`]),
    ...mapGetters({ networkId: `network` }),
    mainnets() {
      return this.networks
        .filter((network) => network.testnet === false)
        .sort((a, b) => b.default - a.default)
    },
  },
}
</script>

<style scoped>
.network-selector {
  position: fixed;
  height: 100%;
  width: 4rem;
  padding: 1rem 0;
  margin: 0 auto;
  text-align: center;
  background: var(--app-nav);
  border-right: 1px solid var(--menu-border);
  z-index: 1000;
}

.network-item {
  position: relative;
  display: inline-block;
  transition: opacity 0.2s ease-in-out;
  opacity: 0.8;
  padding: 0.25rem;
}

.network-item:hover {
  opacity: 1;
  cursor: pointer;
}

.checkmark-circle {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  right: 0.5rem;
  background: var(--success);
  border-radius: 50%;
  height: 1rem;
  width: 1rem;
}

.checkmark-circle i {
  font-size: 10px;
  font-weight: 500;
}

.selected {
  opacity: 1;
}

img {
  display: block;
  position: relative;
  max-height: 100%;
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 50%;
  margin: 0 auto;
  padding: 2px;
  border: 2px solid rgba(255, 255, 255, 0.15);
}

.selected img {
  border: 2px solid var(--highlight);
}

.all-networks {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  width: 2rem;
  border-radius: 50%;
  margin: 0 auto;
  background: var(--menu-border);
  font-size: var(--sm);
  font-weight: 700;
  color: var(--menu-bright);
}

@media screen and (max-width: 1023px) {
  .network-selector {
    display: none;
  }
}
</style>
