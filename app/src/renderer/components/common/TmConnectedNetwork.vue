<template>
  <div v-if="connected" id="tm-connected-network" class="tm-connected-network">
    <div class="tm-connected-network__connection">
      <div id="tm-connected-network__icon" class="tm-connected-network__icon">
        <i class="material-icons">lock</i>
      </div>
      <div
        id="tm-connected-network__string"
        class="tm-connected-network__string"
      >
        <span v-tooltip.top="networkTooltip" class="chain-id">{{
          lastHeader.chain_id
        }}</span>
      </div>
    </div>
    <div id="tm-connected-network__block" class="tm-connected-network__string">
      <a
        v-tooltip.top="'View block details on the Cosmos explorer.'"
        :href="explorerLink"
        >{{ blockHeight }}<i class="material-icons exit">exit_to_app</i></a
      >
    </div>
  </div>
  <div
    v-else
    id="tm-disconnected-network"
    class="tm-connected-network tm-disconnected-network"
  >
    <img class="tm-connected-network-loader" src="~assets/images/loader.svg" />
    <div
      v-tooltip.top="networkTooltip"
      class="tm-connected-network__string tm-connected-network__string--connecting"
    >
      Connecting to {{ lastHeader.chain_id }}…
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex"
import num from "scripts/num"
export default {
  name: `tm-connected-network`,
  data: () => ({
    num: num
  }),
  computed: {
    ...mapGetters([`lastHeader`, `nodeURL`, `connected`]),
    networkTooltip({ connected, nodeURL } = this) {
      if (connected) {
        return `You\'re connected to the ${
          this.lastHeader.chain_id
        } testnet via node ${nodeURL}.`
      }
      return `We\'re pinging nodes to try to connect you to ${
        this.lastHeader.chain_id
      }.`
    },
    blockHeight() {
      return `#` + num.prettyInt(this.lastHeader.height)
    },
    explorerLink() {
      return `https://explorecosmos.network/blocks/` + this.lastHeader.height
    }
  },
  methods: {
    closeMenu() {
      this.$store.commit(`setActiveMenu`, ``)
    }
  }
}
</script>

<style>
.tm-connected-network {
  align-items: center;
  background: var(--app-fg);
  border-radius: 0.25rem;
  color: var(--dim);
  display: flex;
  font-size: var(--sm);
  justify-content: space-between;
  margin: 0.5rem;
  padding: 0.5rem;
}

.tm-connected-network .chain-id {
  font-weight: 500;
  padding-right: 1rem;
}

.tm-connected-network .exit {
  font-size: var(--sm);
}

.tm-connected-network__icon {
  align-items: center;
  color: var(--success-bc);
  display: flex;
  font-size: var(--m);
  justify-content: center;
  padding-right: 0.25rem;
}

.tm-connected-network__icon .fa-spin {
  color: var(--warning);
}

.tm-connected-network--mocked .tm-connected-network__icon {
  color: var(--warning);
}

.tm-connected-network__connection {
  display: flex;
}

.tm-disconnected-network {
  justify-content: start;
}

.tm-connected-network__string--connecting {
  color: var(--warning);
}

.tm-connected-network-loader {
  height: 1rem;
  margin-right: 0.5rem;
  width: 1rem;
}
</style>
