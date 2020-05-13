<template>
  <div class="network-selector">
    <div
      v-for="network in mainnets"
      :key="network.chain_id"
      class="network-item"
      :class="{ selected: networkId === network.id }"
      @click="network.chain_id ? selectNetworkHandler(network) : false"
    >
      <img
        v-tooltip.right="{ content: network.title, offset: 8 }"
        :src="`${network.icon}`"
        :alt="`logo for network ${network.title}`"
      />
    </div>
    <div class="network-item">
      <i
        class="all-networks material-icons notranslate"
        v-tooltip.right="{ content: `All Networks`, offset: 8 }"
        @click="
          $route.name !== `networks` ? $router.push({ name: `networks` }) : null
        "
        >add</i
      >
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex"

export default {
  name: `network-selector`,
  data: () => ({}),
  computed: {
    ...mapState([`connection`]),
    ...mapGetters([`networks`]),
    ...mapGetters({ networkId: `network` }),
    mainnets() {
      return this.networks.filter(network => network.testnet === false)
    },
    networkSlug() {
      return this.connection.networkSlug
    }
  },
  methods: {
    async selectNetworkHandler(network) {
      if (this.networkId !== network.id) {
        this.$store.dispatch(`setNetwork`, network)
        this.$router.push({
          name: "portfolio",
          params: {
            networkId: this.networkSlug
          }
        })
      }
    }
  }
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

.selected img {
  border: 2px solid white;
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
  border: 2px solid transparent;
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
  font-size: 16px;
  font-weight: 700;
}

@media screen and (max-width: 1025px) {
  .network-selector {
    display: flex;
    width: 100%;
    height: 4rem;
    padding: 0 1rem;
    top: 4rem;
  }
}
</style>
