<template>
  <div
    class="network-item"
    :class="{ active: connection.network === network.id }"
  >
    <div class="network-icon">
      <img
        src="https://s3.amazonaws.com/network.logos/cosmos-logo.png"
        alt="cosmic atom token"
      />
    </div>
    <div class="network-content">
      <h4 class="network-title">
        {{ network.title }}
      </h4>
      <p class="network-caption">
        {{ network.chain_id }}
      </p>
    </div>
    <div class="network-status">
      <img
        v-if="!connection.connected && connection.network === network.id"
        class="tm-connected-network-loader"
        src="~assets/images/loader.svg"
        alt="a small spinning circle to display loading"
      />
      <div
        v-else-if="connection.connected && connection.network === network.id"
        class="network-selected"
      >
        <i class="material-icons">check</i>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex"

export default {
  name: `network-item`,
  props: {
    network: {
      type: Object,
      required: true
    },
    enabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState([`connection`])
  }
}
</script>

<style scoped>
.network-item {
  display: flex;
  align-items: center;
  border: 1px solid var(--bc-dim);
  background: var(--app-fg);
  width: 100%;
  position: relative;
  padding: 0.5rem 1rem;
  margin-bottom: 0.25rem;
  border-bottom: 1px solid var(--bc-dim);
  border-radius: 0.25rem;
}

.network-item:hover {
  cursor: pointer;
  background: var(--hover-bg);
  color: var(--bright);
}

.network-item b {
  font-weight: 500;
}

.network-icon img {
  max-height: 100%;
  max-width: 52px;
  display: block;
}

.network-content {
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  width: 100%;
  padding-left: 1rem;
}

.network-title {
  font-size: 1rem;
  line-height: 18px;
  font-weight: 500;
  color: var(--bright);
}

.network-caption {
  display: flex;
  flex-direction: row;
  font-size: 14px;
  color: var(--dim);
}

.network-selected {
  color: var(--success);
}
</style>
