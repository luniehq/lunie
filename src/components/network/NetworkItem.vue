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
    <div v-if="networkitem.powered" class="powered-div">
      <span class="powered-by">Powered by</span>
      <Avatar
        v-if="
          !networkitem.powered.picture || networkitem.powered.picture === 'null'
        "
        class="powered-by-image"
        alt="generic geometric symbol - generated avatar from address"
        :address="networkitem.powered.providerAddress"
      />
      <img
        v-else-if="networkitem.powered.picture"
        :src="networkitem.powered.picture"
        :alt="`validator logo for ` + networkitem.powered.name"
        class="powered-by-image"
      />
      <span
        ><router-link
          :event="networkitem.testnet ? '' : 'click'"
          :class="{
            active: !networkitem.testnet,
            inactive: networkitem.testnet
          }"
          :to="{
            name: 'validator',
            params: {
              networkId: networkitem.slug,
              validator: networkitem.powered.providerAddress
            }
          }"
          >{{ networkitem.powered.name }}</router-link
        ></span
      >
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
      <div v-else style="display: block; width: 24px;"></div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import Avatar from "common/Avatar"

export default {
  name: `network-item`,
  components: {
    Avatar
  },
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

.powered-div {
  display: flex;
  align-items: center;
  width: 100%;
  font-size: 14px;
}

.powered-by {
  color: var(--dim);
}

.powered-by-image {
  width: 1rem;
  border-radius: 100%;
  margin: 0 0.5rem 0 0.5rem;
}

.active {
  color: var(--txt);
}

.active:hover {
  color: var(--link-hover);
}

.inactive {
  color: var(--txt);
}

@media screen and (max-width: 495px) {
  .powered-div {
    font-size: 2vw;
  }
}

@media screen and (max-width: 385px) {
  .powered-div {
    margin-left: 1rem;
  }
  .powered-by {
    display: none;
  }
}
</style>
