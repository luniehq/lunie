<template>
  <div class="network-item" :class="{ disabled: disabled }">
    <div class="network-icon">
      <img
        :src="networkItem.icon"
        :alt="`logo for network ${networkItem.title}`"
      />
    </div>
    <div class="network-content">
      <h4 class="network-title">
        {{ networkItem.title }}
      </h4>
      <p class="network-caption">
        {{ networkItem.chain_id }}
      </p>
    </div>
    <PoweredBy
      :network="networkItem"
      :is-current-network="isCurrentNetwork"
      hide-on-mobile
    />
    <div class="network-status">
      <div v-if="isCurrentNetwork" class="network-selected">
        <i class="material-icons notranslate">check</i>
      </div>
      <img
        v-else-if="disabled && isCurrentNetwork"
        class="tm-connected-network-loader"
        src="~assets/images/loader.svg"
        alt="a small spinning circle to display loading"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex"
import PoweredBy from "./PoweredBy"
import config from "src/../config"

export default {
  name: `network-item`,
  components: {
    PoweredBy,
  },
  props: {
    networkItem: {
      type: Object,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    isExtension: config.isExtension,
  }),
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`network`]),
    isCurrentNetwork() {
      return this.networkItem.id === this.network
    },
  },
}
</script>

<style scoped>
.network-item {
  display: flex;
  align-items: center;
  background: var(--app-fg);
  width: 100%;
  position: relative;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.25rem;
}

.network-item:hover {
  cursor: pointer;
  background: var(--app-fg-hover);
  color: var(--bright);
}

.network-item.disabled:hover {
  cursor: default;
  background: var(--app-fg);
}

.network-item b {
  font-weight: 500;
}

.network-icon img {
  max-height: 100%;
  height: 3.5rem;
  width: 3.5rem;
  display: block;
  border-radius: 50%;
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

.network-status {
  width: 4rem;
}
</style>
