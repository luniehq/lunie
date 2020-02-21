<template>
  <div class="network-item" :class="{ active: network === networkitem.id }">
    <div class="network-icon">
      <img
        :src="`${networkitem.icon}`"
        :alt="`logo for network ${networkitem.title}`"
      />
    </div>
    <div class="network-content">
      <h4 class="network-title">
        {{ networkitem.title }}
      </h4>
      <p class="network-caption">
        {{ networkitem.chain_id }}
      </p>
    </div>
    <div class="network-status">
      <img
        v-if="!connected && network === networkitem.id"
        class="tm-connected-network-loader"
        src="~assets/images/loader.svg"
        alt="a small spinning circle to display loading"
      />
      <div
        v-else-if="connected && network === networkitem.id"
        class="network-selected"
      >
        <i class="material-icons notranslate">check</i>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"

export default {
  name: `network-item`,
  props: {
    networkitem: {
      type: Object,
      required: true
    },
    enabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters([`connected`, `network`])
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
